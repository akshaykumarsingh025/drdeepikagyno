/**
 * Generates the /redesign/ preview copy of the site.
 *
 * The redesign is delivered as a theme layer (src/style-v2.css, scoped to
 * [data-theme="warm"]) rather than a forked set of pages, so this script simply
 * re-stamps the originals with:
 *
 *   - data-theme="warm" on <html>
 *   - the *-v2 script entry, which pulls in the theme
 *   - internal links rewritten to stay inside /redesign/
 *   - noindex/nofollow, so the preview can never compete with the real pages
 *   - a small switcher for flipping between the two versions
 *
 * Re-run it any time the originals change:  node scripts/build-redesign.js
 * When the redesign is approved, none of this is needed — the theme just moves
 * onto the real pages.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'redesign')

const SCRIPT_MAP = {
    '/src/main.js': '/src/main-v2.js',
    '/src/tools.js': '/src/tools-v2.js',
    '/src/fertility-score.js': '/src/fertility-score-v2.js',
}

// Paths that must keep pointing at the real thing rather than the preview copy.
const PASSTHROUGH = ['/assets/', '/api/', '/diet-plans/', '/redesign/']

function rewriteHref(href) {
    if (!href.startsWith('/')) return href                 // external, tel:, mailto:, #anchor
    if (PASSTHROUGH.some(p => href.startsWith(p))) return href
    if (href === '/') return '/redesign/index.html'
    return '/redesign' + href
}

// Sits above the page but fades back until pointed at, so it never fights the
// design it is there to show off.
const SWITCHER = `
    <!-- Redesign preview switcher (generated; not part of the real site) -->
    <style>
        .v2-switch{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:90;display:flex;align-items:center;gap:2px;padding:4px;border-radius:9999px;background:rgba(32,29,25,.7);backdrop-filter:blur(10px);box-shadow:0 8px 28px rgba(32,29,25,.22);font-family:Inter,sans-serif;font-size:12px;line-height:1;opacity:.45;transition:opacity .25s}
        .v2-switch:hover{opacity:1}
        .v2-switch span{padding:7px 13px;border-radius:9999px;background:#fffdfa;color:#201d19;font-weight:700;white-space:nowrap}
        .v2-switch a{padding:7px 13px;border-radius:9999px;color:#e5dfd7;font-weight:600;text-decoration:none;white-space:nowrap}
        .v2-switch a:hover{color:#fff}
        @media (max-width:640px){.v2-switch{bottom:78px;font-size:11px;opacity:.35}}
    </style>
    <div class="v2-switch">
        <span>New design</span>
        <a href="__ORIGINAL__">Original</a>
    </div>
`

function transform(html, originalPath) {
    let out = html

    // 1. Theme flag on the root element
    out = out.replace(/<html([^>]*)>/i, (m, attrs) => {
        if (/data-theme=/.test(attrs)) return m
        return `<html${attrs} data-theme="warm">`
    })

    // 2. Point at the v2 entry so the theme CSS loads
    for (const [from, to] of Object.entries(SCRIPT_MAP)) {
        out = out.split(`src="${from}"`).join(`src="${to}"`)
    }

    // 3. Keep navigation inside the preview
    out = out.replace(/href="([^"]*)"/g, (m, href) => `href="${rewriteHref(href)}"`)

    // 4. Never let the preview get indexed
    if (/<meta\s+name="robots"/i.test(out)) {
        out = out.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
            '<meta name="robots" content="noindex, nofollow">')
    } else {
        out = out.replace(/<\/title>/i, '</title>\n    <meta name="robots" content="noindex, nofollow">')
    }

    // 5. Version switcher
    out = out.replace(/<\/body>/i, SWITCHER.replace('__ORIGINAL__', originalPath) + '</body>')

    return out
}

function collect() {
    const pages = readdirSync(root).filter(f => f.endsWith('.html')).map(f => ({ src: f, out: f }))
    const blogDir = join(root, 'blog')
    if (existsSync(blogDir)) {
        for (const f of readdirSync(blogDir).filter(f => f.endsWith('.html'))) {
            pages.push({ src: `blog/${f}`, out: `blog/${f}` })
        }
    }
    return pages
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(join(outDir, 'blog'), { recursive: true })

const pages = collect()
for (const { src, out } of pages) {
    const html = readFileSync(join(root, src), 'utf8')
    const originalPath = '/' + (src === 'index.html' ? '' : src)
    writeFileSync(join(outDir, out), transform(html, originalPath), 'utf8')
}

console.log(`Generated ${pages.length} preview pages in /redesign/`)
console.log(pages.map(p => '  /redesign/' + p.out).join('\n'))
