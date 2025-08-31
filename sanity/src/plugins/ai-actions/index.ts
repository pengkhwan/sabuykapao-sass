// sanity/src/plugins/ai-actions/index.ts
import { definePlugin } from 'sanity'

/** ---------- API base (Method B) ---------- */
function swapStudioToWorker(origin: string) {
  try {
    const u = new URL(origin)
    if (u.hostname === 'localhost' && u.port === '3333') {
      return `${u.protocol}//${u.hostname}:3000`
    }
    return origin
  } catch {
    return origin.includes(':3333') ? origin.replace(':3333', ':3000') : origin
  }
}
const autodetectBase =
  typeof window !== 'undefined' ? swapStudioToWorker(window.location.origin) : 'http://localhost:3000'
function normalizeApiBase(v: string) {
  const s = (v || '').replace(/\/+$/, '')
  return s.endsWith('/api') ? s : `${s}/api`
}
const RAW_BASE =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_BASE) || autodetectBase
const API_BASE = normalizeApiBase(RAW_BASE)
const api = (path: string) => `${API_BASE}/${path.replace(/^\/+/, '')}`
if (typeof window !== 'undefined') console.info('[ai-actions] API_BASE =', API_BASE)

const toPub = (id?: string) => (id && id.startsWith('drafts.') ? id.slice(7) : id || '')

/* ---------------- helpers ---------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeout = 15000) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeout)
  try {
    return await fetch(input, { ...(init || {}), signal: ctrl.signal })
  } finally {
    clearTimeout(id)
  }
}
async function safeJson(res: Response) { try { return await res.json() } catch { return null } }
async function postJSON(url: string, body: any) {
  try {
    const r = await fetchWithTimeout(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    const j = await safeJson(r)
    return { ok: r.ok, status: r.status, json: j }
  } catch (e: any) { return { ok: false, status: 0, json: null, error: e?.message || String(e) } }
}
async function getJSON(url: string) {
  try {
    const r = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } })
    const j = await safeJson(r)
    return { ok: r.ok, status: r.status, json: j }
  } catch (e: any) { return { ok: false, status: 0, json: null, error: e?.message || String(e) } }
}
async function poll<T>(runner: () => Promise<T | null>, attempts = 8, delayMs = 800) {
  for (let i = 0; i < attempts; i++) { const r = await runner(); if (r) return r; await sleep(delayMs) }
  return null
}
function pickId(props: any) {
  return props?.id || props?.documentId || props?.draft?._id || props?.published?._id || ''
}
// ⬇️ อัปเดต: รองรับทั้ง product.name และ article.title
function pickName(props: any) {
  return (
    props?.draft?.name || props?.published?.name ||
    props?.draft?.title || props?.published?.title ||
    ''
  )
}
function pickSlug(props: any) {
  return props?.draft?.slug?.current || props?.published?.slug?.current || ''
}

/* -------- calls -------- */
async function fetchTitlesRemote(docIdPub: string) {
  const r = await postJSON(api('ai/get-titles'), { docId: docIdPub })
  return r.ok && Array.isArray(r.json?.titles) && r.json.titles.length ? r.json.titles : null
}
async function fetchShortRemote(docIdPub: string) {
  const r = await getJSON(api(`ai/get-short?docId=${encodeURIComponent(docIdPub)}`))
  if (r.ok && r.json?.ok && r.json.short && r.json.meta) return { short: r.json.short, meta: r.json.meta }
  return null
}
async function fetchImageAltRemote(docIdPub: string) {
  const r = await getJSON(api(`ai/get-image-alt?docId=${encodeURIComponent(docIdPub)}`))
  if (r.ok && r.json?.ok && r.json.alt) return { alt: r.json.alt, filename: r.json.filename || null }
  return null
}
async function fetchGalleryAltsRemote(docIdPub: string) {
  const r = await getJSON(api(`ai/get-gallery-alts?docId=${encodeURIComponent(docIdPub)}`))
  return r.ok && r.json?.ok && r.json.count > 0 ? r.json.items : null
}
async function checkSlugRemote(docIdPub: string, slug: string) {
  const u = new URL(api('ai/slug-check'))
  u.searchParams.set('slug', slug)
  if (docIdPub) u.searchParams.set('id', docIdPub)
  const r = await getJSON(u.toString())
  return r.ok ? r.json : null
}
async function fetchTocRemote(docIdPub: string) {
  const r = await getJSON(api(`ai/get-toc?docId=${encodeURIComponent(docIdPub)}`))
  return r.ok && r.json?.ok && Array.isArray(r.json.items) && r.json.items.length ? r.json.items : null
}

/* ---------------- badge ---------------- */
const aiBadge = () => ({ label: 'AI', title: 'AI plugin active' })

/* ---------------- TITLE (product) ---------------- */
const aiTitleGenerate = (props: any) => ({
  name: 'aiTitleGenerate',
  label: 'AI Title (3)',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const currentName = pickName(props)
      if (!pub) return alert('Cannot resolve document id')
      const r = await postJSON(api('ai/trigger'), {
        name: 'ai/product.title_suggest',
        data: { docId: pub, name: currentName, max: 3, meta: { userId: 'studio' } },
      })
      alert(r.ok ? 'Triggered OK' : `Trigger failed: ${r.status || r.error || 'unknown'}`)
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})
const aiTitleApply = (props: any) => ({
  name: 'aiTitleApply',
  label: 'Apply AI Title…',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      if (!pub) return alert('Cannot resolve document id')
      const titles = await poll(() => fetchTitlesRemote(pub))
      if (!titles) return alert('Still no AI titles. Please click "AI Title (3)" first.')
      const numbered = titles.map((t, i) => `${i + 1}) ${t}`).join('\n')
      const ans = prompt(`Pick 1-${titles.length}:\n\n${numbered}`, '1')
      if (ans === null) return
      const idx = Math.max(0, Math.min(parseInt(ans, 10) - 1, titles.length - 1))
      const r = await postJSON(api('ai/apply-title'), { docId: pub, index: idx })
      alert(r.ok ? 'Applied' : `Apply failed: ${r.status || r.error || 'unknown'}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

/* ---------------- SHORT (product) ---------------- */
const aiShortGenerate = (props: any) => ({
  name: 'aiShortGenerate',
  label: 'AI Short (≤160)',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const currentName = pickName(props)
      if (!pub) return alert('Cannot resolve document id')
      const r = await postJSON(api('ai/trigger'), {
        name: 'ai/product.short_generate',
        data: { docId: pub, name: currentName, limit: 160, meta: { userId: 'studio' } },
      })
      alert(r.ok ? 'Triggered OK' : `Trigger failed: ${r.status || r.error || 'unknown'}`)
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})
const aiShortApply = (props: any) => ({
  name: 'aiShortApply',
  label: 'Apply AI Short…',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const data = await poll(() => fetchShortRemote(pub))
      if (!data) return alert('Still no result. Please click "AI Short (≤160)" first.')
      const { short, meta } = data
      const ok = confirm(`Apply these?\n\nShort (≤160):\n${short}\n\nMeta (140–160):\n${meta}`)
      if (!ok) return
      const r = await postJSON(api('ai/apply-short'), { docId: pub })
      alert(r.ok ? 'Applied' : `Apply failed: ${r.status || r.error || 'unknown'}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

/* ---------------- ALT (Main Image, product) ---------------- */
const aiMainAltGenerate = (props: any) => ({
  name: 'aiMainAltGenerate',
  label: 'AI ALT (Main)',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const currentName = pickName(props)
      if (!pub) return alert('Cannot resolve document id')
      const r = await postJSON(api('ai/trigger'), {
        name: 'ai/product.image_alt_rename',
        data: { docId: pub, name: currentName, meta: { userId: 'studio' } },
      })
      alert(r.ok ? 'Triggered OK' : `Trigger failed: ${r.status || r.error || 'unknown'}`)
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})
const aiMainAltApply = (props: any) => ({
  name: 'aiMainAltApply',
  label: 'Apply ALT (Main)…',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const data = await poll(() => fetchImageAltRemote(pub))
      if (!data) return alert('Still no ALT. Please click "AI ALT (Main)" first.')
      const { alt, filename } = data
      const ok = confirm(`Apply ALT to main image?\n\nALT:\n${alt}\n\nSuggested filename:\n${filename || '(unchanged)'}`)
      if (!ok) return
      const r = await postJSON(api('ai/apply-image-alt'), { docId: pub })
      alert(r.ok ? 'Applied' : `Apply failed: ${r.status || r.error || 'unknown'}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

/* ---------------- GALLERY ALTs (product) ---------------- */
const aiGalleryAltsGenerate = (props: any) => ({
  name: 'aiGalleryAltsGenerate',
  label: 'AI Gallery ALTs',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const currentName = pickName(props)
      if (!pub) return alert('Cannot resolve document id')
      const r = await postJSON(api('ai/trigger'), {
        name: 'ai/product.gallery_alt_generate',
        data: { docId: pub, name: currentName, meta: { userId: 'studio' } },
      })
      alert(r.ok ? 'Triggered OK' : `Trigger failed: ${r.status || r.error || 'unknown'}`)
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})
const aiGalleryAltsApply = (props: any) => ({
  name: 'aiGalleryAltsApply',
  label: 'Apply Gallery ALTs…',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const items = await poll(() => fetchGalleryAltsRemote(pub))
      if (!items) return alert('Still no gallery ALTs. Please click "AI Gallery ALTs" first.')
      const preview = items.map((it: any, i: number) => `${i + 1}) ${it.alt}`).join('\n').slice(0, 4000)
      const ok = confirm(`Apply ALT to ${items.length} gallery images?\n\n${preview}`)
      if (!ok) return
      const r = await postJSON(api('ai/apply-gallery-alts'), { docId: pub })
      alert(r.ok ? 'Applied' : `Apply failed: ${r.status || r.error || 'unknown'}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

/* ---------------- SLUG (product) ---------------- */
const aiSlugGenerate = (props: any) => ({
  name: 'aiSlugGenerate',
  label: 'AI Slug (Generate)',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const name = pickName(props)
      if (!pub) return alert('Cannot resolve document id')
      if (!name) return alert('Document has no name/title to base slug on.')
      const current = pickSlug(props)
      if (current) {
        const ok = confirm(`This document already has slug:\n"${current}"\n\nGenerate & overwrite it?`)
        if (!ok) return
      }
      const res = await postJSON(api('ai/slug-generate'), { docId: pub, name })
      if (!res.ok || !res.json?.ok) {
        return alert(`Slug generate failed: ${res.status || res.error || res.json?.error || 'unknown'}`)
      }
      alert(`Slug generated:\n${res.json.slug}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})
const aiSlugCheck = (props: any) => ({
  name: 'aiSlugCheck',
  label: 'Check Slug',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const slug = pickSlug(props)
      if (!slug) return alert('No slug on document.')
      const res = await checkSlugRemote(pub, slug)
      if (!res?.ok) return alert('Slug check failed.')
      if (!res.valid) return alert('Slug invalid (EN-only, kebab, ≤60).')
      if (res.conflict) {
        const who = res.hit?.name || res.hit?.title || res.hit?._id || '(unknown doc)'
        return alert(`Slug conflict with: ${who}`)
      }
      alert('Slug is valid and available ✅')
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

/* ---------------- TOC + ARTICLE SLUG ---------------- */
const aiTocGenerate = (props: any) => ({
  name: 'aiTocGenerate',
  label: 'AI TOC (Generate)',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      if (!pub) return alert('Cannot resolve document id')
      const r = await postJSON(api('ai/trigger'), {
        name: 'ai/article.toc_generate',
        data: { docId: pub, max: 8, meta: { userId: 'studio' } },
      })
      alert(r.ok ? 'TOC triggered' : `Trigger failed: ${r.status || r.error || 'unknown'}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})
const aiTocApply = (props: any) => ({
  name: 'aiTocApply',
  label: 'Apply TOC…',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      if (!pub) return alert('Cannot resolve document id')
      const items = await poll(() => fetchTocRemote(pub))
      if (!items) return alert('Still no TOC. Click "AI TOC (Generate)" first.')
      const preview = items.map((x: any, i: number) => `${i + 1}) ${x.text}${x.anchor ? ` (#${x.anchor})` : ''}`).join('\n').slice(0, 4000)
      const ok = confirm(`Apply ${items.length} TOC items?\n\n${preview}`)
      if (!ok) return
      const res = await postJSON(api('ai/apply-toc'), { docId: pub })
      if (res.ok) { alert('Applied'); props.onComplete?.(); return }
      const dbg = await getJSON(api(`ai/get-toc?docId=${encodeURIComponent(pub)}&debug=1`))
      if (dbg.ok && dbg.json?.ok) {
        alert(`Apply failed (${res.status || res.error || 'unknown'}).\nTOC still present (${dbg.json.count} items). Please click "Apply TOC…" again.`)
      } else {
        alert(`Apply failed (${res.status || res.error || 'unknown'}).\nAlso failed to read TOC (${dbg.error || dbg.status}). Try "AI TOC (Generate)" again.`)
      }
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

// ⬇️ NEW: Article → AI Slug (Generate)
const aiArticleSlugGenerate = (props: any) => ({
  name: 'aiArticleSlugGenerate',
  label: 'AI Slug (Generate)',
  onHandle: async () => {
    try {
      const pub = toPub(pickId(props))
      const nameOrTitle = pickName(props)
      if (!pub) return alert('Cannot resolve document id')
      if (!nameOrTitle) return alert('Document has no title to base slug on.')

      const current = pickSlug(props)
      if (current) {
        const ok = confirm(`This document already has slug:\n"${current}"\n\nGenerate & overwrite it?`)
        if (!ok) return
      }

      const res = await postJSON(api('ai/slug-generate'), { docId: pub, name: nameOrTitle })
      if (!res.ok || !res.json?.ok) {
        return alert(`Slug generate failed: ${res.status || res.error || res.json?.error || 'unknown'}`)
      }
      alert(`Slug generated:\n${res.json.slug}`)
      props.onComplete?.()
    } catch (e: any) { alert('Error: ' + (e?.message || String(e))) }
  },
})

/* ---------------- register ---------------- */
export default definePlugin(() => ({
  name: 'ai-actions',
  document: {
    badges: (prev) => prev.concat(aiBadge),
    actions: (prev, ctx) => {
      if (ctx.schemaType === 'product') {
        return prev.concat(
          aiTitleGenerate, aiTitleApply,
          aiShortGenerate, aiShortApply,
          aiMainAltGenerate, aiMainAltApply,
          aiGalleryAltsGenerate, aiGalleryAltsApply,
          aiSlugGenerate,
          aiSlugCheck,
        )
      }
      if (ctx.schemaType === 'article') {
        return prev.concat(
          aiTocGenerate, aiTocApply,
          aiArticleSlugGenerate,   // ⬅️ เพิ่มปุ่ม slug สำหรับบทความ
        )
      }
      return prev
    },
  },
}))
