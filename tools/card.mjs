#!/usr/bin/env node
/**
 * card.mjs — update how an existing template looks in the gallery.
 *
 * The gallery card is made of four things: title, description, thumbnail, and
 * the preview link. None of them affect the template's content, so changing
 * one should not mean re-exporting the portal and re-running author.mjs.
 *
 * Only the fields you pass are touched. Everything else is left alone.
 *
 * Usage:
 *   node tools/card.mjs --id <slug>
 *       [--title "Gallery Title"]
 *       [--description "One line shown under the heading"]
 *       [--thumbnail path/to/card.png]
 *       [--preview-url "https://..."]
 *       [--clear-preview]
 *       [--publish]
 *
 *   node tools/card.mjs --id <slug> --purge     # refresh the CDN, nothing else
 *
 * --publish commits the touched files, pushes to main, and purges the CDN so
 * the change is visible immediately rather than in up to 24 hours.
 */

import {
	readFileSync, writeFileSync, existsSync, unlinkSync, statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath( new URL( '.', import.meta.url ) );
const repoRoot = join( __dirname, '..' );
const REPO = 'clientportal/client-portal-templates';

// Matches the plugin's thumbnail allowlist. SVG is excluded there, so a .svg
// here would be silently dropped and the card would render with no image.
const IMAGE_EXTS = [ '.png', '.jpg', '.jpeg', '.webp', '.gif' ];

// ── Args ────────────────────────────────────────────────────────────────────

const argv = process.argv.slice( 2 );
let id, title, description, thumbnail, previewUrl;
let clearPreview = false, publish = false, purgeOnly = false, noWebp = false;

for ( let i = 0; i < argv.length; i++ ) {
	const a = argv[ i ];
	if ( a === '--id' ) { id = argv[ ++i ]; continue; }
	if ( a === '--title' ) { title = argv[ ++i ]; continue; }
	if ( a === '--description' ) { description = argv[ ++i ]; continue; }
	if ( a === '--thumbnail' ) { thumbnail = argv[ ++i ]; continue; }
	if ( a === '--preview-url' ) { previewUrl = argv[ ++i ]; continue; }
	if ( a === '--clear-preview' ) { clearPreview = true; continue; }
	if ( a === '--publish' ) { publish = true; continue; }
	if ( a === '--purge' ) { purgeOnly = true; continue; }
	if ( a === '--no-webp' ) { noWebp = true; continue; }
	console.error( `ERROR: unknown argument "${ a }"` );
	process.exit( 1 );
}

if ( ! id ) {
	console.error(
		'Usage: node tools/card.mjs --id <slug>\n' +
		'       [--title "..."] [--description "..."]\n' +
		'       [--thumbnail path/to/card.png] [--preview-url "https://..."]\n' +
		'       [--clear-preview] [--no-webp] [--publish]\n\n' +
		'       node tools/card.mjs --id <slug> --purge'
	);
	process.exit( 1 );
}

// ── Load manifest ───────────────────────────────────────────────────────────

const manifestPath = join( repoRoot, 'manifest.json' );

if ( ! existsSync( manifestPath ) ) {
	console.error( 'ERROR: manifest.json not found.' );
	process.exit( 1 );
}

const manifest = JSON.parse( readFileSync( manifestPath, 'utf8' ) );
const idx = manifest.templates.findIndex( ( t ) => t.id === id );

if ( idx < 0 ) {
	const known = manifest.templates.map( ( t ) => t.id ).join( ', ' ) || '(none)';
	console.error( `ERROR: no template with id "${ id }" in the manifest.` );
	console.error( `Known ids: ${ known }` );
	console.error( 'To add a new template, use author.mjs instead.' );
	process.exit( 1 );
}

const entry = manifest.templates[ idx ];
const changed = [];

// ── Purge-only mode ─────────────────────────────────────────────────────────

if ( purgeOnly ) {
	await purge( purgePaths( entry ) );
	process.exit( 0 );
}

// ── Apply changes ───────────────────────────────────────────────────────────

if ( title ) {
	entry.title = title;
	changed.push( 'title' );
}

if ( description ) {
	entry.description = description;
	changed.push( 'description' );
}

if ( clearPreview ) {
	delete entry.preview_url;
	changed.push( 'preview_url (cleared)' );
} else if ( previewUrl ) {
	let parsed;
	try {
		parsed = new URL( previewUrl );
	} catch {
		console.error( `ERROR: --preview-url is not a valid URL: ${ previewUrl }` );
		process.exit( 1 );
	}

	// The plugin renders this as an href in wp-admin and accepts http(s) only.
	if ( parsed.protocol !== 'https:' ) {
		console.error( `ERROR: --preview-url must be https. Got: ${ parsed.protocol }//` );
		process.exit( 1 );
	}

	entry.preview_url = previewUrl;
	changed.push( 'preview_url' );
}

let thumbRelPath;
if ( thumbnail ) {
	if ( ! existsSync( thumbnail ) ) {
		console.error( `ERROR: thumbnail not found: ${ thumbnail }` );
		process.exit( 1 );
	}

	let source = thumbnail;
	let ext = extname( basename( source ) ).toLowerCase();

	if ( ! IMAGE_EXTS.includes( ext ) ) {
		console.error( `ERROR: thumbnail must be one of ${ IMAGE_EXTS.join( ', ' ) }. Got: ${ ext }` );
		process.exit( 1 );
	}

	// Card thumbnails are screenshots, which WebP encodes far smaller than PNG
	// at the same visible quality — the onboarding card goes 104 KB -> 16 KB.
	// Every browser that runs wp-admin supports it.
	if ( '.webp' !== ext && ! noWebp ) {
		const converted = toWebp( source );
		if ( converted ) {
			source = converted;
			ext = '.webp';
		}
	}

	const name = basename( source );
	const dest = join( repoRoot, 'images', id, name );
	const bytes = readFileSync( source );

	// A changed image under an unchanged filename keeps the same CDN URL, so
	// customers would be served the old picture from cache for up to 24 hours.
	if ( existsSync( dest ) && ! readFileSync( dest ).equals( bytes ) ) {
		const stem = basename( name, ext );
		console.error( `\nERROR: ${ name } already exists in images/${ id }/ with different content.` );
		console.error( 'Reusing the filename would serve the old image from cache.' );
		console.error( `Rename it (e.g. "${ stem }-v2${ ext }") and re-run.` );
		process.exit( 1 );
	}

	writeFileSync( dest, bytes );

	// Drop the temp file conversion left behind.
	if ( source !== thumbnail ) {
		unlinkSync( source );
	}

	thumbRelPath = `images/${ id }/${ name }`;
	entry.thumbnail = thumbRelPath;
	changed.push( 'thumbnail' );
}

if ( changed.length === 0 ) {
	console.log( 'Nothing to change. Pass at least one of --title, --description, --thumbnail, --preview-url, --clear-preview.' );
	process.exit( 0 );
}

// Keep a stable, readable key order so manifest diffs stay small.
const order = [ 'id', 'title', 'description', 'file', 'thumbnail', 'tier', 'preview_url' ];
manifest.templates[ idx ] = Object.fromEntries(
	order.filter( ( k ) => k in entry ).map( ( k ) => [ k, entry[ k ] ] )
);

writeFileSync( manifestPath, JSON.stringify( manifest, null, '\t' ) + '\n' );

console.log( `Updated "${ id }": ${ changed.join( ', ' ) }\n` );
console.log( JSON.stringify( manifest.templates[ idx ], null, '\t' ) );

// ── Publish ─────────────────────────────────────────────────────────────────

const paths = [ 'manifest.json' ];
if ( thumbRelPath ) {
	paths.push( thumbRelPath );
}

if ( ! publish ) {
	console.log( '\nNext steps:' );
	console.log( `  git add ${ paths.join( ' ' ) }` );
	console.log( `  git commit -m "Update ${ id } card" && git push origin main` );
	console.log( `  node tools/card.mjs --id ${ id } --purge` );
	process.exit( 0 );
}

console.log( '\nPublishing...' );

try {
	git( [ 'add', ...paths ] );
	git( [ 'commit', '-m', `Update ${ id } card: ${ changed.join( ', ' ) }` ] );
	git( [ 'push', 'origin', 'main' ] );
	console.log( 'Pushed to main.' );
} catch ( e ) {
	console.error( `\nERROR: git step failed: ${ e.message }` );
	console.error( 'The manifest is updated locally — commit and push by hand, then run --purge.' );
	process.exit( 1 );
}

await purge( purgePaths( manifest.templates[ idx ] ) );

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Re-encode an image as WebP in the system temp dir.
 *
 * Returns null rather than throwing when cwebp is not installed: a machine
 * without libwebp should still be able to publish a card, just a heavier one,
 * and the warning says what it cost.
 *
 * @param {string} input Path to the source image.
 * @return {string|null} Path to the WebP file, or null if conversion was skipped.
 */
function toWebp( input ) {
	const out = join( tmpdir(), basename( input, extname( input ) ) + '.webp' );

	try {
		execFileSync( 'cwebp', [ '-quiet', '-q', '90', input, '-o', out ], { stdio: 'pipe' } );
	} catch ( e ) {
		console.warn( 'ENOENT' === e.code
			? '\nNOTE: cwebp not found, using the image as-is.'
			: `\nNOTE: WebP conversion failed (${ String( e.message ).split( '\n' )[ 0 ] }), using the image as-is.` );
		console.warn( '      Install it with "brew install webp" — WebP thumbnails are several times smaller.' );
		return null;
	}

	const before = statSync( input ).size;
	const after = statSync( out ).size;
	console.log(
		`Converted to WebP: ${ kb( before ) } -> ${ kb( after ) } ` +
		`(${ Math.round( ( 1 - after / before ) * 100 ) }% smaller)`
	);

	return out;
}

/**
 * Format a byte count as whole KB.
 *
 * @param {number} bytes Size in bytes.
 * @return {string}
 */
function kb( bytes ) {
	return `${ Math.round( bytes / 1024 ) } KB`;
}

/**
 * Run a git command in the repo root.
 *
 * @param {string[]} args Arguments passed to git.
 * @return {string} stdout.
 */
function git( args ) {
	return execFileSync( 'git', args, { cwd: repoRoot, encoding: 'utf8', stdio: 'pipe' } );
}

/**
 * The CDN paths a card depends on.
 *
 * @param {object} e A manifest entry.
 * @return {string[]} Repo-relative paths.
 */
function purgePaths( e ) {
	// The template body belongs here as well as the card's own assets. A
	// re-export rewrites e.file, and purging only the manifest and thumbnail
	// leaves jsDelivr serving the previous template for up to 24 hours — the
	// gallery card would update while the portal it creates silently did not.
	const paths = [ 'manifest.json' ];

	if ( e.file ) {
		paths.push( e.file );
	}

	if ( e.thumbnail ) {
		paths.push( e.thumbnail );
	}

	return paths;
}

/**
 * Ask jsDelivr to drop its cached copies so the change is visible now.
 *
 * Without this a branch-pinned file can serve stale for up to 24 hours.
 *
 * @param {string[]} paths Repo-relative paths to purge.
 */
async function purge( paths ) {
	console.log( '\nPurging CDN cache...' );

	for ( const p of paths ) {
		const url = `https://purge.jsdelivr.net/gh/${ REPO }@main/${ p }`;
		try {
			const res = await fetch( url );
			const body = await res.json();
			const ok = res.ok && body.status !== 'failed';
			console.log( `  ${ ok ? 'ok  ' : 'FAIL' }  ${ p }` );
		} catch ( e ) {
			console.log( `  FAIL  ${ p } — ${ e.message }` );
		}
	}

	console.log( '\nDone. The gallery will pick this up on its next manifest refresh (up to 12h),' );
	console.log( 'or immediately on a site where the transient is cleared.' );
}
