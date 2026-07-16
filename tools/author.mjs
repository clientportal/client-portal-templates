#!/usr/bin/env node
/**
 * Featured Templates authoring script.
 *
 * Takes a Client Portal JSON export, validates it against the plugin's block
 * allowlist, downloads images into the repo, rewrites attachment source_urls
 * to cdn.jsdelivr.net @main URLs, writes the template JSON, and upserts the
 * manifest entry.
 *
 * Usage:
 *   node tools/author.mjs <export.json> --id <slug>
 *       [--title "Gallery Title"]
 *       [--preview-url "https://..."]
 *       [--plugin-dir ../leco-client-portal]
 */

import {
	readFileSync, writeFileSync, mkdirSync, existsSync,
	unlinkSync, renameSync, createWriteStream,
} from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath( new URL( '.', import.meta.url ) );
const REPO = 'clientportal/client-portal-templates';
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${ REPO }@main`;

// ── Args ────────────────────────────────────────────────────────────────────

const argv = process.argv.slice( 2 );
let exportPath, id, title, previewUrl;
let pluginDir = resolve( __dirname, '../../leco-client-portal' );

for ( let i = 0; i < argv.length; i++ ) {
	const a = argv[ i ];
	if ( a === '--id' ) { id = argv[ ++i ]; continue; }
	if ( a === '--title' ) { title = argv[ ++i ]; continue; }
	if ( a === '--preview-url' ) { previewUrl = argv[ ++i ]; continue; }
	if ( a === '--plugin-dir' ) { pluginDir = resolve( argv[ ++i ] ); continue; }
	if ( ! a.startsWith( '--' ) && ! exportPath ) { exportPath = resolve( a ); }
}

if ( ! exportPath || ! id ) {
	console.error(
		'Usage: node tools/author.mjs <export.json> --id <slug>\n' +
		'       [--title "Gallery Title"] [--preview-url "https://..."]\n' +
		'       [--plugin-dir ../leco-client-portal]'
	);
	process.exit( 1 );
}

if ( ! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test( id ) ) {
	console.error( `ERROR: --id must be a lowercase slug (a-z, 0-9, hyphens). Got: "${ id }"` );
	process.exit( 1 );
}

// ── Read export ─────────────────────────────────────────────────────────────

let data;
try {
	data = JSON.parse( readFileSync( exportPath, 'utf8' ) );
} catch ( e ) {
	console.error( `ERROR: Could not read/parse ${ exportPath }: ${ e.message }` );
	process.exit( 1 );
}

// ── Parse block allowlist from plugin source ────────────────────────────────

const importPhp = join( pluginDir, 'includes/admin/class-leco-cp-import.php' );
if ( ! existsSync( importPhp ) ) {
	console.error( `ERROR: Plugin file not found: ${ importPhp }` );
	console.error( 'Pass --plugin-dir pointing to the plugin root.' );
	process.exit( 1 );
}

const phpSource = readFileSync( importPhp, 'utf8' );

// Scope to validate_blocks() so we don't accidentally match an $allowed in
// another method. Then filter to leco-cp/* so stray quoted strings are ignored.
const vbStart = phpSource.indexOf( 'function validate_blocks' );
if ( vbStart === -1 ) {
	console.error( 'ERROR: Could not find validate_blocks() in plugin source.' );
	process.exit( 1 );
}
const allowMatch = phpSource.slice( vbStart ).match( /\$allowed\s*=\s*array\(\s*([\s\S]*?)\);/ );
if ( ! allowMatch ) {
	console.error( 'ERROR: Could not parse $allowed array in validate_blocks().' );
	process.exit( 1 );
}
const allowed = [ ...allowMatch[ 1 ].matchAll( /'([^']+)'/g ) ]
	.map( m => m[ 1 ] )
	.filter( name => name.startsWith( 'leco-cp/' ) );
console.log( `Block allowlist (${ allowed.length } leco-cp/* blocks) read from plugin source.` );

// ── Validate structure ──────────────────────────────────────────────────────

const errors = [];
if ( data.format !== 'leco-cp-export' ) errors.push( 'format must be "leco-cp-export"' );
if ( parseInt( data.version ) !== 1 ) errors.push( 'version must be 1.x' );
if ( ! [ 'portal', 'template' ].includes( data.type ) ) errors.push( 'type must be "portal" or "template"' );
if ( ! data.portal?.title ) errors.push( 'portal.title is required' );
if ( typeof data.portal?.post_content !== 'string' ) errors.push( 'portal.post_content must be a string' );
if ( ! data.portal?.meta || typeof data.portal.meta !== 'object' ) errors.push( 'portal.meta must be an object' );

if ( errors.length ) {
	console.error( 'Validation errors:' );
	errors.forEach( e => console.error( `  - ${ e }` ) );
	process.exit( 1 );
}

// ── Validate blocks ─────────────────────────────────────────────────────────

function extractBlockNames( content ) {
	const names = new Set();
	for ( const m of content.matchAll( /<!-- wp:([a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)?)/g ) ) {
		names.add( m[ 1 ] );
	}
	return names;
}

const contentFields = [ data.portal.post_content ];
for ( const cp of data.content_pages || [] ) contentFields.push( cp.post_content );
for ( const nav of data.navigations || [] ) contentFields.push( nav.post_content );
for ( const pat of data.synced_patterns || [] ) contentFields.push( pat.post_content );

const allNames = new Set();
for ( const c of contentFields ) {
	for ( const name of extractBlockNames( c ) ) allNames.add( name );
}

// Non-namespaced (e.g. "paragraph") = core. Namespaced core/* = core. Anything
// else must be in the leco-cp/* allowlist.
const disallowed = [];
for ( const name of allNames ) {
	if ( name.includes( '/' ) && ! name.startsWith( 'core/' ) && ! allowed.includes( name ) ) {
		disallowed.push( name );
	}
}

if ( disallowed.length ) {
	console.error( 'Disallowed blocks:' );
	disallowed.forEach( b => console.error( `  - ${ b }` ) );
	process.exit( 1 );
}
console.log( `Blocks validated (${ allNames.size } unique names across ${ contentFields.length } content fields).` );

// ── Check for private-uploader images ───────────────────────────────────────

const attachments = data.attachments || [];
const privateUploads = attachments.filter( a =>
	a.source_url && /\/uploads\/leco-cp\//.test( a.source_url )
);

if ( privateUploads.length ) {
	console.error( '' );
	console.error( 'ERROR: These attachments use the private client uploader (uploads/leco-cp/).' );
	console.error( 'Files in that directory are 403-blocked — customers cannot download them.' );
	console.error( 'Re-upload these images to the regular Media Library and re-export:\n' );
	privateUploads.forEach( a => console.error( `  ${ a.filename }  (ref: ${ a.ref_id })` ) );
	process.exit( 1 );
}

// ── Download images and rewrite URLs ────────────────────────────────────────

const repoRoot = resolve( __dirname, '..' );
const imagesDir = join( repoRoot, 'images', id );
const templatesDir = join( repoRoot, 'templates', id );

mkdirSync( imagesDir, { recursive: true } );
mkdirSync( templatesDir, { recursive: true } );

function download( url, dest ) {
	return new Promise( ( ok, fail ) => {
		const mod = url.startsWith( 'https' ) ? 'node:https' : 'node:http';
		import( mod ).then( ( { default: http } ) => {
			http.get( url, ( res ) => {
				if ( res.statusCode !== 200 ) {
					res.resume();
					fail( new Error( `HTTP ${ res.statusCode }` ) );
					return;
				}
				const ws = createWriteStream( dest );
				res.pipe( ws );
				ws.on( 'finish', ok );
				ws.on( 'error', fail );
			} ).on( 'error', fail );
		} );
	} );
}

async function main() {
	for ( const att of attachments ) {
		const filename = att.filename;
		const dest = join( imagesDir, filename );
		const tmp = dest + '.tmp';

		process.stdout.write( `Downloading ${ filename }... ` );

		try {
			await download( att.source_url, tmp );
		} catch ( e ) {
			console.log( 'FAILED' );
			console.error( `  ${ att.source_url } → ${ e.message }` );
			if ( existsSync( tmp ) ) unlinkSync( tmp );
			process.exit( 1 );
		}

		if ( existsSync( dest ) ) {
			const existing = readFileSync( dest );
			const incoming = readFileSync( tmp );
			if ( existing.equals( incoming ) ) {
				console.log( 'unchanged, skipped.' );
				unlinkSync( tmp );
			} else {
				unlinkSync( tmp );
				const ext = extname( filename );
				const base = basename( filename, ext );
				console.log( 'CONFLICT' );
				console.error( `\nERROR: ${ filename } already exists in images/${ id }/ with different content.` );
				console.error( 'jsDelivr caches @main URLs — reusing the filename serves stale content to customers.' );
				console.error( `Rename the new image (e.g. "${ base }-v2${ ext }") and re-export.` );
				process.exit( 1 );
			}
		} else {
			renameSync( tmp, dest );
			console.log( 'ok.' );
		}

		att.source_url = `${ CDN_BASE }/images/${ id }/${ filename }`;
	}

	// ── Write template JSON ───────────────────────────────────────────────

	const templatePath = join( templatesDir, `${ id }.json` );
	writeFileSync( templatePath, JSON.stringify( data, null, '\t' ) + '\n' );
	console.log( `\nTemplate written: templates/${ id }/${ id }.json` );

	// ── Upsert manifest ──────────────────────────────────────────────────

	const manifestPath = join( repoRoot, 'manifest.json' );
	let manifest = { templates: [] };
	if ( existsSync( manifestPath ) ) {
		manifest = JSON.parse( readFileSync( manifestPath, 'utf8' ) );
	}

	const entry = {
		id,
		title: title || data.portal.title,
		file: `templates/${ id }/${ id }.json`,
	};
	const tier = data.tier || 'free';
	if ( tier !== 'free' ) entry.tier = tier;
	if ( previewUrl ) entry.preview_url = previewUrl;

	const idx = manifest.templates.findIndex( t => t.id === id );
	if ( idx >= 0 ) {
		// Preserve existing preview_url when --preview-url isn't passed.
		if ( ! previewUrl && manifest.templates[ idx ].preview_url ) {
			entry.preview_url = manifest.templates[ idx ].preview_url;
		}
		manifest.templates[ idx ] = entry;
	} else {
		manifest.templates.push( entry );
	}
	writeFileSync( manifestPath, JSON.stringify( manifest, null, '\t' ) + '\n' );
	console.log( `Manifest ${ idx >= 0 ? 'updated' : 'updated (new entry)' }.` );

	// ── Summary ──────────────────────────────────────────────────────────

	const ts = Date.now();
	console.log( `\nDone. ${ attachments.length } image(s), ${ contentFields.length } content field(s) validated.\n` );
	console.log( 'Next steps:' );
	console.log( `  git add images/${ id }/ && git commit -m "Add images for ${ id }" && git push origin main` );
	console.log( `  git checkout -b test/${ id }-${ ts }` );
	console.log( `  git add manifest.json templates/${ id }/ && git commit -m "Add template ${ id }" && git push -u origin HEAD` );
	console.log( '' );
	console.log( '  # Then in wp-config.php (or via the leco_cp_featured_templates_base_url filter):' );
	console.log( `  # define( 'LECO_CP_FEATURED_TEMPLATES_BASE_URL', 'https://cdn.jsdelivr.net/gh/${ REPO }@test/${ id }-${ ts }/' );` );
	console.log( '  # Test in the plugin gallery, then merge the branch to main.' );
}

main().catch( ( e ) => {
	console.error( `\nFATAL: ${ e.message }` );
	process.exit( 1 );
} );
