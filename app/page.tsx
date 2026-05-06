'use client'

import { useState } from 'react'

const GENRE_CATEGORIES = [
  {
    id: 'death', label: 'Death Metal', variant: 'indigo' as const,
    subs: ['Melodic Death', 'Technical Death', 'Brutal Death', 'Death-Doom', 'Deathcore'],
  },
  {
    id: 'black', label: 'Black Metal', variant: 'purple' as const,
    subs: ['Atmospheric Black', 'Symphonic Black', 'Raw Black', 'Post-Black', 'Blackgaze'],
  },
  {
    id: 'thrash', label: 'Thrash & Speed', variant: 'indigo' as const,
    subs: ['Bay Area Thrash', 'Speed Metal', 'Crossover Thrash', 'Technical Thrash', 'Heavy Metal'],
  },
  {
    id: 'doom', label: 'Doom & Sludge', variant: 'purple' as const,
    subs: ['Traditional Doom', 'Sludge Metal', 'Stoner Metal', 'Funeral Doom', 'Death-Doom'],
  },
  {
    id: 'modern', label: 'Modern Heavy', variant: 'indigo' as const,
    subs: ['Metalcore', 'Djent', 'Deathcore', 'Nu-Metal', 'Groove Metal'],
  },
  {
    id: 'prog', label: 'Progressive', variant: 'purple' as const,
    subs: ['Progressive Metal', 'Power Metal', 'Symphonic Metal', 'Folk Metal', 'Industrial Metal'],
  },
]

const OUTPUT_TYPES: { id: string; label: string }[] = [
  { id: 'full',       label: 'Full Package' },
  { id: 'lyrics',     label: 'Lyrics Only' },
  { id: 'hooks',      label: 'Hooks & Chorus' },
  { id: 'production', label: 'Production Notes' },
]

const INSTRUMENTS = [
  'Vocals', 'Screams', 'Guitar', 'Bass', 'Drums', 'Keys',
  'Synth', 'Strings', 'Choir', 'Electronics', 'Saxophone', 'Violin',
]

const MOODS = [
  { icon: '🔥', label: 'Furious' },
  { icon: '🌑', label: 'Brooding' },
  { icon: '⚔️', label: 'Triumphant' },
  { icon: '💀', label: 'Crushing' },
  { icon: '🌊', label: 'Melancholic' },
  { icon: '🌩', label: 'Chaotic' },
  { icon: '🏔', label: 'Epic' },
  { icon: '❄️', label: 'Cold' },
]

const MOOD_PRESETS = [
  { icon: '🌑', label: 'Night',    mood: 'Brooding',    tempo: 'Slow (40–60)',  key: 'B minor',  intensity: 2 },
  { icon: '⚔️', label: 'War',      mood: 'Triumphant',  tempo: 'Fast (160+)',   key: 'E minor',  intensity: 5 },
  { icon: '🌧', label: 'Doom',     mood: 'Melancholic', tempo: 'Drone (20–40)', key: 'D minor',  intensity: 1 },
  { icon: '💀', label: 'Brutal',   mood: 'Crushing',    tempo: 'Fast (160+)',   key: 'C# minor', intensity: 5 },
  { icon: '🏔', label: 'Epic',     mood: 'Epic',        tempo: 'Mid (90–120)',  key: 'Open',     intensity: 4 },
  { icon: '❄️', label: 'Nihilist', mood: 'Cold',        tempo: 'Fast (160+)',   key: 'F# minor', intensity: 5 },
]

const KEYS = [
  'E minor', 'A minor', 'D minor', 'B minor', 'C# minor',
  'F# minor', 'G minor', 'C minor', 'F minor', 'Open', 'Drop D', 'Drop B',
]

const TEMPOS = ['Drone (20–40)', 'Slow (40–60)', 'Mid (90–120)', 'Fast (160+)']
const INTENSITY_LABELS = ['', 'Soft', 'Heavy', 'Crushing', 'Devastating', 'Annihilating']

const LANGUAGES = [
  'English', 'Russian', 'German', 'Norwegian', 'Finnish', 'Swedish',
  'Danish', 'Icelandic', 'Polish', 'Ukrainian', 'Czech', 'French',
  'Spanish', 'Portuguese', 'Italian', 'Greek', 'Arabic', 'Japanese',
]

const TRACK_MODES = [
  { id: 'vocal',        label: 'Vocals',       icon: '🎤' },
  { id: 'instrumental', label: 'Instrumental', icon: '🎸' },
  { id: 'both',         label: 'Both',         icon: '🎭' },
]

const STRUCTURES = [
  'Verse / Chorus / Verse / Bridge',
  'Intro / Verse / Chorus / Solo / Outro',
  'Verse / Verse / Chorus / Bridge / Chorus',
  'Through-composed',
  'Drone / Build / Explosion',
]

const s = {
  col: { display: 'flex' as const, flexDirection: 'column' as const, height: '100%', overflow: 'hidden' as const },
  sectionLabel: {
    fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-muted)',
    textTransform: 'uppercase' as const, padding: '14px 16px 8px', fontWeight: 500,
  },
  outBtn: (active: boolean) => ({
    fontSize: '12px', padding: '8px 14px', borderRadius: '6px',
    border: `1px solid ${active ? 'var(--indigo)' : 'transparent'}`,
    background: active ? 'var(--border-indigo)' : 'transparent',
    color: active ? 'var(--indigo-light)' : 'var(--text-secondary)',
    cursor: 'pointer' as const, textAlign: 'left' as const,
    fontWeight: active ? 500 : 400, transition: 'all 0.15s', width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  }),
  paramCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '10px 12px',
  },
  paramLabel: {
    fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, marginBottom: '6px', fontWeight: 500,
  },
  select: {
    width: '100%', background: 'transparent', border: 'none',
    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
    outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  tag: (active: boolean, variant: 'indigo' | 'purple' | 'teal') => {
    const colors = {
      indigo: { border: 'var(--indigo)',  bg: 'var(--border-indigo)',  color: 'var(--indigo-light)' },
      purple: { border: 'var(--purple)', bg: 'var(--border-purple)', color: '#ffaaaa' },
      teal:   { border: '#991b1b',       bg: 'rgba(153,27,27,0.2)',  color: '#fca5a5' },
    }
    const c = colors[variant]
    return {
      fontSize: '12px', padding: '5px 12px', borderRadius: '20px',
      border: `1px solid ${active ? c.border : 'var(--border)'}`,
      background: active ? c.bg : 'var(--bg-card)',
      color: active ? c.color : 'var(--text-secondary)',
      cursor: 'pointer' as const, transition: 'all 0.15s',
      fontWeight: active ? 500 : 400, whiteSpace: 'nowrap' as const,
      fontFamily: "'DM Sans', sans-serif",
    }
  },
}

function getVariantForGenre(label: string): 'indigo' | 'purple' {
  const cat = GENRE_CATEGORIES.find(c => c.subs.includes(label))
  return cat?.variant === 'indigo' ? 'indigo' : 'purple'
}

export default function Home() {
  const [activeGenres, setActiveGenres] = useState<string[]>(['Metalcore'])
  const [openCat, setOpenCat] = useState<string | null>(null)
  const [outputType, setOutputType] = useState('full')
  const [mood, setMood] = useState('Furious')
  const [tempo, setTempo] = useState('Fast (160+)')
  const [songKey, setSongKey] = useState('E minor')
  const [intensity, setIntensity] = useState(4)
  const [instruments, setInstruments] = useState<string[]>(['Vocals', 'Guitar', 'Drums'])
  const [language, setLanguage] = useState('English')
  const [trackMode, setTrackMode] = useState('vocal')
  const [structure, setStructure] = useState(STRUCTURES[0])
  const [theme, setTheme] = useState('')
  const [result, setResult] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inspireLoading, setInspireLoading] = useState(false)
  const [randomLoading, setRandomLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [history, setHistory] = useState<{ title: string; genres: string; time: string }[]>([])

  const songTitle = result.split('\n').find(l => /^#?\s*TITLE:/i.test(l))?.replace(/^#?\s*TITLE:/i, '').trim() || ''

  const lyrics = (() => {
    const lm = result.match(/LYRICS:\s*([\s\S]*?)(?=MUSIC PROMPT:|$)/)
    return lm ? lm[1].trim() : result
  })()

  const musicPrompt = (() => {
    const mm = result.match(/MUSIC PROMPT:\s*(.+)/)
    return mm ? mm[1].trim() : ''
  })()

  function clearAll() {
    setResult(''); setTheme('')
    setActiveGenres(['Metalcore']); setOutputType('full'); setMood('Furious')
    setTempo('Fast (160+)'); setSongKey('E minor'); setIntensity(4)
    setInstruments(['Vocals', 'Guitar', 'Drums'])
    setLanguage('English'); setTrackMode('vocal'); setOpenCat(null)
  }

  function toggleGenre(g: string) {
    setActiveGenres(prev => {
      if (prev.includes(g)) return prev.length > 1 ? prev.filter(x => x !== g) : prev
      if (prev.length >= 3) return prev
      return [...prev, g]
    })
  }

  function removeGenre(g: string) {
    setActiveGenres(prev => prev.length > 1 ? prev.filter(x => x !== g) : prev)
  }

  function isCatActive(cat: typeof GENRE_CATEGORIES[0]) {
    return activeGenres.includes(cat.label) || cat.subs.some(sub => activeGenres.includes(sub))
  }

  function toggleInstrument(i: string) {
    setInstruments(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  async function inspire() {
    setInspireLoading(true); setTheme('')
    try {
      const res = await fetch('/api/forge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Generate a short 1–2 sentence creative direction for a ${activeGenres.join(' + ')} metal song with ${mood} mood, ${tempo} tempo. Make it vivid and visceral. Return only the text, no labels.` }),
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setTheme(acc)
      }
    } catch { setTheme('Ash falls over a ruined city. The last voice screams into silence.') }
    finally { setInspireLoading(false) }
  }

  async function randomTheme() {
    setRandomLoading(true); setTheme('')
    try {
      const res = await fetch('/api/random-theme', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.theme) setTheme(data.theme)
    } catch { setTheme('A dying sun bleeds over the battlefield. Nothing remains but bone and silence.') }
    finally { setRandomLoading(false) }
  }

  function buildPrompt() {
    const outMap: Record<string, string> = {
      full: 'Full Package: title, full lyrics with structure labels, and at the very end a detailed Suno/Udio music prompt labeled MUSIC PROMPT: — the music prompt must be specific, evocative and include: genre tags, key, BPM, vocal style, guitar tone, drum style, atmosphere, and production style. Max 220 chars.',
      lyrics: 'Full lyrics with structure labels only',
      hooks: 'Hooks and chorus only — the most memorable lines',
      production: 'Production notes: tuning, drop, tempo, arrangement, sound design, mix direction, reference artists',
    }
    return `Generate ${outMap[outputType]} for a metal song with these parameters:
- Subgenres: ${activeGenres.join(' + ')}
- Mood: ${mood}
- Tempo: ${tempo}
- Key: ${songKey}
- Intensity: ${INTENSITY_LABELS[intensity]}
- Instruments: ${instruments.join(', ')}
- Language: ${language}
- Track Mode: ${trackMode}
- Structure: ${structure}
- Theme / Creative Direction: ${theme || 'Open — choose something powerful and visceral'}

Format exactly as:
TITLE: [song title]

LYRICS:
[full lyrics with section labels like [Verse 1], [Chorus], [Bridge], [Solo] etc.]

MUSIC PROMPT: [detailed Suno/Udio prompt with genre, key, BPM, vocal style, guitar tone, drum pattern, atmosphere]`
  }

  async function generate() {
    setLoading(true); setIsStreaming(true); setResult('')
    try {
      const res = await fetch('/api/forge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt() }),
      })
      if (!res.body) { setResult('Error connecting to API'); return }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      setLoading(false)
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setResult(acc)
      }
      const t = acc.split('\n').find(l => /^#?\s*TITLE:/i.test(l))?.replace(/^#?\s*TITLE:/i, '').trim() || ''
      if (t) {
        const now = new Date()
        setHistory(prev => [{ title: t, genres: activeGenres.slice(0, 2).join(' · '), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev.slice(0, 9)])
      }
      setTheme('')
    } catch { setResult('Error connecting to API') }
    finally { setLoading(false); setIsStreaming(false) }
  }

  function handleSave() {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${songTitle || 'metal-forge'}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ height: 52, borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #991b1b, #450a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fca5a5' }}>MF</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-primary)' }}>METAL FORGE V1</div>
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>HEAVY LYRICS & MUSIC PROMPTS</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['New Track', 'Export TXT', 'Export PDF', 'Docs', 'GitHub'].map(btn => (
            <button key={btn} onClick={btn === 'Export TXT' || btn === 'Export PDF' ? handleSave : btn === 'New Track' ? clearAll : undefined} style={{ padding: '6px 14px', fontSize: 11, letterSpacing: '0.1em', border: btn === 'Export PDF' ? 'none' : '1px solid var(--border)', background: btn === 'Export PDF' ? 'var(--indigo)' : 'transparent', color: btn === 'Export PDF' ? '#fff' : 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{btn}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', flex: 1, overflow: 'hidden' }}>

        {/* COL 1 — Cover Art */}
        <div style={{ ...s.col, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '16px' }}>
            <div style={s.sectionLabel}>Cover Art</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '0 16px', marginBottom: 10 }}>Image Prompts</div>
            <div style={{ margin: '0 16px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 8, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center' as const, padding: 12 }}>
              Forge a track first to generate cover art
            </div>
          </div>
        </div>

        {/* COL 2 — Hero + Genre + Output + History */}
        <div style={{ ...s.col, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '40px 20px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.0, letterSpacing: '-0.03em' }}>
              Forge your next
              <br />
              <span style={{ color: 'var(--indigo-light)', fontStyle: 'italic' }}>metal masterpiece</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.4 }}>
              Select subgenre, set parameters, generate.
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' as const }}>
              {MOOD_PRESETS.map(preset => (
                <button key={preset.label} onClick={() => { setMood(preset.mood); setTempo(preset.tempo); setSongKey(preset.key); setIntensity(preset.intensity) }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  {preset.icon} {preset.label}
                </button>
              ))}
            </div>
            <button onClick={inspire} disabled={inspireLoading} style={{ marginTop: 10, width: '100%', padding: '8px 14px', background: inspireLoading ? 'var(--bg-card)' : 'var(--border-indigo)', border: `1px solid ${inspireLoading ? 'var(--border)' : 'var(--indigo-dim)'}`, borderRadius: 8, color: inspireLoading ? 'var(--text-muted)' : 'var(--indigo-light)', fontSize: 12, fontWeight: 500, cursor: inspireLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" }}>
              {inspireLoading ? 'Generating brief...' : '✦ Inspire Me'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' as const }}>
            <div style={s.sectionLabel}>Subgenre</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '0 12px' }}>
              {GENRE_CATEGORIES.map(cat => {
                const active = isCatActive(cat)
                const isOpen = openCat === cat.id
                const v = cat.variant
                return (
                  <div key={cat.id} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', borderRadius: 20, border: `1px solid ${active ? (v === 'indigo' ? 'var(--indigo)' : 'var(--purple)') : 'var(--border)'}`, background: active ? (v === 'indigo' ? 'var(--border-indigo)' : 'var(--border-purple)') : 'var(--bg-card)', overflow: 'hidden', transition: 'all 0.15s' }}>
                      <button onClick={() => { toggleGenre(cat.subs[0]); setOpenCat(null) }} style={{ flex: 1, fontSize: 12, padding: '6px 4px 6px 10px', background: 'transparent', border: 'none', color: active ? (v === 'indigo' ? 'var(--indigo-light)' : '#ffaaaa') : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' as const, fontWeight: active ? 500 : 400, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.label}
                      </button>
                      <button onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{ width: 22, background: 'transparent', border: 'none', borderLeft: `1px solid ${active ? (v === 'indigo' ? 'var(--indigo-dim)' : 'var(--purple-dim)') : 'var(--border)'}`, color: active ? (v === 'indigo' ? 'var(--indigo-light)' : '#ffaaaa') : 'var(--text-muted)', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▾</button>
                    </div>
                    {isOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, zIndex: 50, overflow: 'hidden' }}>
                        {cat.subs.map((sub, idx) => {
                          const subActive = activeGenres.includes(sub)
                          return (
                            <button key={sub} onClick={() => toggleGenre(sub)} style={{ display: 'block', width: '100%', textAlign: 'left' as const, padding: '7px 12px', background: subActive ? (v === 'indigo' ? 'var(--border-indigo)' : 'var(--border-purple)') : 'transparent', border: 'none', borderBottom: idx < cat.subs.length - 1 ? '1px solid var(--border)' : 'none', color: subActive ? (v === 'indigo' ? 'var(--indigo-light)' : '#ffaaaa') : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                              {sub}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ padding: '8px 12px 0', display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
              {activeGenres.map(g => {
                const v = getVariantForGenre(g)
                return (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px 3px 10px', borderRadius: 20, border: `1px solid ${v === 'indigo' ? 'var(--indigo)' : 'var(--purple)'}`, background: v === 'indigo' ? 'var(--border-indigo)' : 'var(--border-purple)', color: v === 'indigo' ? 'var(--indigo-light)' : '#ffaaaa' }}>
                    <span>{g}</span>
                    <button onClick={() => removeGenre(g)} style={{ background: 'none', border: 'none', color: v === 'indigo' ? 'var(--indigo)' : 'var(--purple)', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: '0 0 0 2px' }}>×</button>
                  </div>
                )
              })}
            </div>

            {activeGenres.length >= 2 && (
              <div style={{ margin: '6px 12px 0', padding: '7px 10px', background: 'var(--border-purple)', border: '1px solid var(--purple-dim)', borderRadius: 6, fontSize: 11, color: '#ffaaaa' }}>
                Blend mode — {activeGenres.length} subgenres active
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

            <div style={s.sectionLabel}>Output</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
              {OUTPUT_TYPES.map(o => (
                <button key={o.id} onClick={() => setOutputType(o.id)} style={s.outBtn(outputType === o.id)}>{o.label}</button>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

            <div style={s.sectionLabel}>History</div>
            <div style={{ padding: '0 16px 16px' }}>
              {history.length === 0
                ? <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Forge a track first</div>
                : history.map((item, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.genres} · {item.time}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* COL 3 — Params + Result */}
        <div style={{ ...s.col, background: 'var(--bg-primary)' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Key</div>
                <select style={s.select} value={songKey} onChange={e => setSongKey(e.target.value)}>
                  {KEYS.map(k => <option key={k} style={{ background: '#131010' }}>{k}</option>)}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Tempo</div>
                <select style={s.select} value={tempo} onChange={e => setTempo(e.target.value)}>
                  {TEMPOS.map(t => <option key={t} style={{ background: '#131010' }}>{t}</option>)}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Intensity</div>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setIntensity(n)} style={{ height: 6, flex: 1, borderRadius: 2, border: 'none', background: n <= intensity ? 'var(--indigo)' : 'var(--border)', cursor: 'pointer' }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--indigo-light)', marginTop: 5 }}>{INTENSITY_LABELS[intensity]}</div>
              </div>
            </div>

            <div>
              <div style={s.paramLabel}>Mood</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                {MOODS.map(m => (
                  <button key={m.label} onClick={() => setMood(m.label)} style={s.tag(mood === m.label, 'indigo')}>{m.icon} {m.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={s.paramLabel}>Theme / Creative Direction</div>
                <button onClick={randomTheme} disabled={randomLoading} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: randomLoading ? 'var(--text-muted)' : 'var(--text-secondary)', fontSize: 14, cursor: randomLoading ? 'not-allowed' : 'pointer', padding: '2px 8px', lineHeight: 1 }}>
                  {randomLoading ? '⟳' : '🎲'}
                </button>
              </div>
              <textarea value={theme} onChange={e => setTheme(e.target.value)}
                placeholder="Ash falls over a ruined city. The last voice screams into silence..."
                style={{ width: '100%', height: 90, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-secondary)', fontSize: 12, resize: 'none', outline: 'none', fontFamily: "'DM Mono', monospace", lineHeight: 1.7, boxSizing: 'border-box' as const }}
              />
            </div>

            <div>
              <div style={s.paramLabel}>Instrumentation</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                {INSTRUMENTS.map(i => (
                  <button key={i} onClick={() => toggleInstrument(i)} style={s.tag(instruments.includes(i), 'teal')}>{i}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={s.paramLabel}>Language</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setLanguage(l)} style={s.tag(language === l, 'purple')}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Structure</div>
                <select style={s.select} value={structure} onChange={e => setStructure(e.target.value)}>
                  {STRUCTURES.map(t => <option key={t} style={{ background: '#131010' }}>{t}</option>)}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Mode</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  {TRACK_MODES.map(m => (
                    <button key={m.id} onClick={() => setTrackMode(m.id)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, border: `1px solid ${trackMode === m.id ? 'var(--indigo)' : 'var(--border)'}`, background: trackMode === m.id ? 'var(--border-indigo)' : 'transparent', color: trackMode === m.id ? 'var(--indigo-light)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{m.icon} {m.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {!result && !loading && !isStreaming && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 20 }}>Your composition will appear here...</div>}
            {(loading || isStreaming) && !result && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 20 }}>Forging your metal track...</div>}
            {result && (
              <div>
                {songTitle && <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>{songTitle}</div>}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: "'DM Mono', monospace" }}>{lyrics}</div>
                {musicPrompt && (
                  <div style={{ marginTop: 20, padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>MUSIC PROMPT</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{musicPrompt}</div>
                    <button onClick={() => handleCopy(musicPrompt, 'music')} style={{ marginTop: 8, fontSize: 11, background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: copiedField === 'music' ? 'var(--indigo-light)' : 'var(--text-muted)', cursor: 'pointer', padding: '3px 8px', fontFamily: "'DM Sans', sans-serif" }}>
                      {copiedField === 'music' ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={handleSave} disabled={!result} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: result ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: 12, cursor: result ? 'pointer' : 'not-allowed', letterSpacing: '0.04em', fontFamily: "'DM Sans', sans-serif" }}>
              Save Draft
            </button>
            <button onClick={generate} disabled={loading || isStreaming} style={{ flex: 1, padding: 10, background: (loading || isStreaming) ? 'var(--bg-card)' : 'var(--indigo)', border: 'none', borderRadius: 6, color: (loading || isStreaming) ? 'var(--text-muted)' : '#fff', fontSize: 13, fontWeight: 600, cursor: (loading || isStreaming) ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
              {(loading || isStreaming) ? 'Forging...' : 'Forge Track ↗'}
            </button>
          </div>
        </div>

        {/* COL 4 — Right Panel */}
        <div style={{ ...s.col, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={s.sectionLabel}>Title</div>
            <div style={{ padding: '0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', minHeight: 24, fontFamily: "'Playfair Display', serif" }}>
              {(loading || isStreaming) && !songTitle ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>Generating...</span> : songTitle || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>Title will appear here</span>}
            </div>
            {songTitle && (
              <button onClick={() => handleCopy(songTitle, 'title')} style={{ margin: '8px 16px 0', fontSize: 11, background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: copiedField === 'title' ? 'var(--indigo-light)' : 'var(--text-muted)', cursor: 'pointer', padding: '3px 8px', fontFamily: "'DM Sans', sans-serif" }}>
                {copiedField === 'title' ? 'Copied!' : 'Copy Title'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <div style={s.sectionLabel}>Video Script</div>
            <div style={{ padding: '0 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Scene Prompts</div>
              <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 8, padding: 16, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, minHeight: 80 }}>
                {result ? 'Ready to generate video script — click below.' : 'Forge a track first, then generate a video script.'}
              </div>
              {result && (
                <button style={{ marginTop: 10, width: '100%', padding: '8px', fontSize: 11, letterSpacing: '0.1em', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Generate Video Script ↗
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={s.sectionLabel}>Track Duration</div>
            <div style={{ padding: '0 16px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>3:30</div>
            <div style={{ padding: '0 16px' }}>
              <div style={s.paramLabel}>Clip Length</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['5s', '8s', '10s', '15s'].map(d => (
                  <button key={d} style={{ flex: 1, padding: '5px 0', fontSize: 10, border: d === '10s' ? '1px solid var(--indigo)' : '1px solid var(--border)', background: d === '10s' ? 'var(--border-indigo)' : 'transparent', color: d === '10s' ? 'var(--indigo-light)' : 'var(--text-muted)', borderRadius: 4, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}