import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, CircleHelp, Contrast, Expand, Focus, Gauge, Layers3, Moon, RotateCcw, Sun, X } from 'lucide-react'
import { colorAtHue, colorScale, contrastRatio, hexToHsl, hexToRgb, hslToHex } from './utils/color'

// The deck follows the same order as the live refactor: palette → hierarchy → meaning → contrast → tokens → dark mode.
const acts = [
  { name: 'Intro', question: 'Why does color matter?' },
  { name: 'Palette', question: 'Which colors do we have?' },
  { name: 'Hierarchy', question: 'What is each color for?' },
  { name: 'Meaning & access', question: 'Does everyone get the message?' },
  { name: 'System', question: 'How does it survive in code?' },
  { name: 'Apply it', question: 'Can we fix a real UI?' },
]
const slides = [
  { title: 'Color in UI Design', act: 0 },
  { title: 'Color communicates', act: 0 },
  { title: 'The plan', act: 0 },
  { title: 'Color has three dimensions', act: 1 },
  { title: 'The color wheel', act: 1 },
  { title: 'Relationships create palettes', act: 1 },
  { title: 'One hue, many values', act: 1 },
  { title: 'Give every color a role', act: 2 },
  { title: 'Color creates hierarchy', act: 2 },
  { title: 'The 60–30–10 rule', act: 2 },
  { title: 'Colors have meaning', act: 3 },
  { title: 'Contrast = legibility', act: 3 },
  { title: 'Never color alone', act: 3 },
  { title: 'Name roles as tokens', act: 4 },
  { title: 'From tokens to CSS', act: 4 },
  { title: 'Components own the meaning', act: 4 },
  { title: 'Dark mode is a token set', act: 4 },
  { title: 'Color mistakes', act: 5 },
  { title: 'Live demo: fix the UI', act: 5 },
  { title: 'Before you ship', act: 5 },
]
const totalSlides = slides.length
const actStart = (act: number) => slides.findIndex((slide) => slide.act === act)
const actEnd = (act: number) => slides.findLastIndex((slide) => slide.act === act)
const pad = (n: number) => String(n).padStart(2, '0')
const eyebrowFor = (index: number) => {
  const { act } = slides[index]
  return act === 0 ? `${pad(index + 1)} / Intro` : `${pad(index + 1)} / Act ${act} · ${acts[act].name}`
}
const spring = { type: 'spring' as const, stiffness: 150, damping: 22 }

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="kicker"><span />{children}</div>
}

function SlideHeading({ eyebrow, title, accent }: { eyebrow: string; title: React.ReactNode; accent?: React.ReactNode }) {
  return <header className="slide-heading"><Kicker>{eyebrow}</Kicker><h1>{title}{accent && <span className="heading-accent"> {accent}</span>}</h1></header>
}

function ProductMock({ variant = 'good', highlight = '', dark = false }: { variant?: 'good' | 'bad'; highlight?: string; dark?: boolean }) {
  return <div className={`product-mock ${variant === 'bad' ? 'mock-bad' : ''} ${dark ? 'mock-dark' : ''}`}>
    <aside className="mock-sidebar"><div className="mock-brand"><span className="brand-dot" />Northstar</div><span className="mock-nav active">◈ <b>Overview</b></span><span className="mock-nav">◷ <b>Activity</b></span><span className="mock-nav">▦ <b>Projects</b></span><span className="mock-nav">⚙ <b>Settings</b></span><div className="mock-user"><span>AM</span><div><b>Alex Morgan</b><small>Pro workspace</small></div></div></aside>
    <main className="mock-main"><div className="mock-top"><div><small>MONDAY, OCTOBER 21</small><b>Good morning, Alex <span>✳</span></b></div><button className={`mock-cta ${highlight === 'primary' ? 'is-highlighted' : ''}`}>+ New project</button></div>
      <div className="mock-metrics">{[['Total revenue', '$48,290', '+12.8%'], ['Active users', '2,841', '+8.2%'], ['Conversion', '4.62%', '+0.6%']].map(([title, number, delta]) => <div className={`metric ${highlight === 'surface' ? 'is-highlighted' : ''}`} key={title}><small>{title}</small><strong>{number}</strong><span className={highlight === 'accent' ? 'is-highlighted' : ''}>↗ {delta}</span></div>)}</div>
      <div className="mock-chart"><div className="chart-head"><b>Performance</b><button className={highlight === 'secondary' ? 'is-highlighted' : ''}>Last 30 days⌄</button></div><div className="chart-bars">{[38, 54, 44, 68, 59, 78, 54, 88, 72, 94, 70, 84, 62, 92, 74, 100, 69, 87, 58, 80, 67, 96, 75, 88].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="chart-axis"><span>Oct 01</span><span>Oct 10</span><span>Oct 21</span></div></div>
      <div className="mock-activity"><div className="chart-head"><b>Recent activity</b><a>View all <ArrowRight size={12} /></a></div>{[['AP', 'A new report is ready', '2 min ago'], ['JD', 'Jamie joined the workspace', '1 hr ago']].map(([initials, title, time]) => <div className="activity-row" key={initials}><span>{initials}</span><b>{title}</b><small>{time}</small></div>)}</div>
    </main>
  </div>
}

const harmonies = [
  { name: 'Complementary', offsets: [0, 180], points: [0, 180] },
  { name: 'Split complementary', offsets: [0, 150, 210], points: [0, 150, 210] },
  { name: 'Analogous', offsets: [-30, 0, 30], points: [-30, 0, 30] },
  { name: 'Triadic', offsets: [0, 120, 240], points: [0, 120, 240] },
  { name: 'Tetradic', offsets: [0, 60, 180, 240], points: [0, 60, 180, 240] },
  { name: 'Square', offsets: [45, 135, 225, 315], points: [45, 135, 225, 315] },
] as const

function RelationshipDemo() {
  const [mode, setMode] = useState<(typeof harmonies)[number]['name']>('Complementary')
  const [hue, setHue] = useState(158)
  const selectedHarmony = harmonies.find((harmony) => harmony.name === mode) ?? harmonies[0]
  const colors = selectedHarmony.offsets.map((offset) => hslToHex({ h: (hue + offset + 360) % 360, s: 70, l: 56 }))
  const examples: Record<(typeof harmonies)[number]['name'], { ui: string; reference: string }> = {
    Complementary: { ui: 'Analytics UI: keep charts teal; reserve warm coral for the “Create report” CTA.', reference: 'IKEA’s blue and yellow logo is a familiar near-complementary pairing. Van Gogh’s Cafe Terrace at Night sets golden lights against deep blue.' },
    'Split complementary': { ui: 'Product UI: use blue for the primary action, with orange and red-orange for supporting chart series.', reference: 'This is easier to spot in a designed palette than a famous logo; it gives one base hue two contrasting, less-opposite partners.' },
    Analogous: { ui: 'Revenue UI: use neighboring blue-green shades for related chart series.', reference: 'Van Gogh’s Almond Blossom uses a family of neighboring cool blues around the branches and sky.' },
    Triadic: { ui: 'Project UI: distinguish three categories; label each, don’t imply status.', reference: 'Piet Mondrian’s Broadway Boogie Woogie is built around a vivid red, yellow, and blue triad.' },
    Tetradic: { ui: 'Operations UI: map four distinct data series to four labeled hues.', reference: 'Microsoft’s four-color window mark is a loose example of two warm/cool complementary pairs.' },
    Square: { ui: 'Multi-section UI: give four feature areas distinct hues, with neutral UI around them.', reference: 'Google’s four-color G mark loosely suggests a square harmony; its brand hues are not an exact geometric match.' },
  }
  const points = selectedHarmony.points.map((offset, index) => {
    const angle = (hue + offset - 90) * Math.PI / 180
    return { x: 50 + 39 * Math.cos(angle), y: 50 + 39 * Math.sin(angle), color: colors[index] }
  })
  const pointString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  return <div className="relationship-demo"><div className="harmony-options" role="group" aria-label="Choose a color harmony">{harmonies.map((harmony) => {
    const miniColors = harmony.offsets.map((offset) => hslToHex({ h: (hue + offset + 360) % 360, s: 75, l: 55 }))
    const miniPoints = harmony.points.map((offset) => {
      const angle = (hue + offset - 90) * Math.PI / 180
      return `${50 + 36 * Math.cos(angle)},${50 + 36 * Math.sin(angle)}`
    })
    return <button key={harmony.name} className={`harmony-option ${mode === harmony.name ? 'selected' : ''}`} aria-pressed={mode === harmony.name} onClick={() => setMode(harmony.name)}><span className="harmony-wheel"><i/><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={miniPoints.join(' ')} />{miniPoints.map((point, index) => <circle key={point} cx={point.split(',')[0]} cy={point.split(',')[1]} r="3.1" fill={miniColors[index]} />)}</svg></span><b>{harmony.name}</b></button>
  })}</div><label className="inline-control">Base hue <input aria-label="Base hue" type="range" min="0" max="359" value={hue} onChange={(event) => setHue(Number(event.target.value))} /></label><div className="harmony-result"><div className="harmony-wheel harmony-wheel-large"><i/><svg viewBox="0 0 100 100" role="img" aria-label={`${mode} color wheel relationship`}><polygon points={pointString} />{points.map(({ x, y, color }) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.7" fill={color} />)}</svg></div><div className="relationship-swatches">{colors.map((color, index) => <motion.div layout key={`${mode}-${index}`} title={color.toUpperCase()} style={{ backgroundColor: color }}><small>{color.toUpperCase()}</small></motion.div>)}</div></div><div className="relationship-note"><b>{mode}</b><span>{mode === 'Complementary' ? 'Opposite hues create a focused accent.' : mode === 'Analogous' ? 'Neighboring hues create a cohesive range.' : mode === 'Split complementary' ? 'One hue plus its two near-opposites.' : mode === 'Triadic' ? 'Three evenly spaced hues.' : mode === 'Tetradic' ? 'Two complementary pairs.' : 'Four evenly spaced hues.'}</span></div><div className="relationship-usecase"><div><small>UI EXAMPLE</small><p>{examples[mode].ui}</p></div><div><small>REAL-WORLD REFERENCE</small><p>{examples[mode].reference}</p></div><em>Brand and artwork examples are visual approximations, not claims about the creator’s original method.</em></div></div>
}

function ColorWheel() {
  const [hue, setHue] = useState(158)
  const center = 140
  const polar = (radius: number, angle: number) => ({ x: center + radius * Math.cos((angle - 90) * Math.PI / 180), y: center + radius * Math.sin((angle - 90) * Math.PI / 180) })
  const segments = Array.from({ length: 36 }, (_, index) => {
    const start = index * 10
    const end = start + 10
    const outerStart = polar(124, start)
    const outerEnd = polar(124, end)
    const innerEnd = polar(70, end)
    const innerStart = polar(70, start)
    return { hue: index * 10, d: `M ${outerStart.x} ${outerStart.y} A 124 124 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 70 70 0 0 0 ${innerStart.x} ${innerStart.y} Z` }
  })
  const selected = hslToHex({ h: hue, s: 78, l: 56 })
  const rgb = hexToRgb(selected)
  const hsl = hexToHsl(selected)
  return <div className="wheel-layout"><div className="wheel-wrap"><svg viewBox="0 0 280 280" role="img" aria-label="Interactive color wheel">{segments.map((segment) => <path key={segment.hue} d={segment.d} fill={`hsl(${segment.hue} 82% 56%)`} stroke="#171c19" strokeWidth="1" onClick={() => setHue(segment.hue + 5)} className="wheel-segment" />)}<circle cx="140" cy="140" r="62" fill="#171c19"/><circle cx="140" cy="140" r="48" fill={selected} className="wheel-center"/><circle cx={polar(98, hue).x} cy={polar(98, hue).y} r="7" fill="white" stroke="#111412" strokeWidth="3" /></svg></div><div className="wheel-detail"><Kicker>Selected color</Kicker><h3>{selected.toUpperCase()}</h3><div className="value-grid"><div><small>RGB</small><b>{rgb.r}, {rgb.g}, {rgb.b}</b></div><div><small>HSL</small><b>{hsl.h}°, {hsl.s}%, {hsl.l}%</b></div></div><div className="mini-swatches"><span style={{ background: colorAtHue(selected, 180) }} /><span style={{ background: colorAtHue(selected, -30) }} /><span style={{ background: colorAtHue(selected, 30) }} /><span style={{ background: colorAtHue(selected, 120) }} /><small>Opposite · Neighbors · Triadic</small></div><label className="range-label">Hue <input aria-label="Selected wheel hue" type="range" min="0" max="359" value={hue} onChange={(event) => setHue(Number(event.target.value))} /></label></div></div>
}

function ContrastChecker() {
  const [foreground, setForeground] = useState('#5d6b65')
  const [background, setBackground] = useState('#ffffff')
  const ratio = contrastRatio(foreground, background)
  return <div className="contrast-demo"><div className="contrast-preview" style={{ color: foreground, backgroundColor: background }}><small>LIVE PREVIEW</small><strong>Readable by design.</strong><span>Body text at a comfortable size.</span></div><div className="contrast-controls"><label>Foreground <input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} /></label><label>Background <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label><div className="ratio-number"><small>Contrast ratio</small><strong>{ratio.toFixed(2)} <span>: 1</span></strong></div><div className="wcag-row"><span>AA normal text <b className={ratio >= 4.5 ? 'pass' : 'fail'}>{ratio >= 4.5 ? 'PASS' : 'FAIL'}</b></span><span>AAA normal text <b className={ratio >= 7 ? 'pass' : 'fail'}>{ratio >= 7 ? 'PASS' : 'FAIL'}</b></span></div></div></div>
}

function TokenDemo() {
  const [primary, setPrimary] = useState('#78d5ad')
  return <div className="token-demo"><div className="token-list">{[['Primary', primary], ['Secondary', '#7798e8'], ['Background', '#f7f8f5'], ['Surface', '#ffffff'], ['Text', '#202923'], ['Muted', '#77827a'], ['Border', '#dce3dd'], ['Success', '#31835a'], ['Warning', '#ae7618'], ['Error', '#bb5550'], ['Info', '#527dbe']].map(([name, color]) => <div className="token-row" key={name}><i style={{ backgroundColor: color }} /><span>{name}</span><code>{color}</code>{name === 'Primary' && <input aria-label="Change primary token" type="color" value={primary} onChange={(event) => setPrimary(event.target.value)} />}</div>)}</div><div className="token-preview" style={{ '--token-primary': primary } as React.CSSProperties}><div className="token-preview-top"><span>◈</span><small>FIELDNOTE / 01</small><span>···</span></div><div className="token-preview-content"><small>YOUR WORKSPACE</small><h3>Ship work that matters.</h3><p>A calm place to move your team forward.</p><button>Open workspace <ArrowRight size={14} /></button></div><div className="token-preview-foot"><span><i /> All systems operational</span><small>Updated just now</small></div></div></div>
}

function BadUiDemo() {
  const [step, setStep] = useState(0)
  const steps = ['Define the palette', 'Establish hierarchy', 'Add semantic colors', 'Fix contrast', 'Apply consistent tokens', 'Add dark mode']
  const stepActs = [1, 2, 3, 3, 4, 4]
  return <div className={`repair-demo ${step >= 6 ? 'repair-dark' : ''}`}><div className={`repair-screen repair-step-${step}`}><header><span>☀️ <b>Sunshine Analytics!!!</b></span><button>✨ Export ✨</button><button>Delete</button><button>BUY NOW</button></header><div className="repair-welcome"><span>⚠︎ Revenue is down!!!</span><h3>Dashboard</h3><strong>$48,290</strong><button>+ Add</button></div><div className="repair-grid"><div><small>Total sales</small><b>$12,409</b><i>+12%</i></div><div><small>Users online</small><b>2,804</b><i>ERROR!!</i></div><div><small>Conversion</small><b>4.8%</b><i>Warning</i></div></div><div className="repair-bars">{[20, 55, 37, 78, 43, 90, 58, 70, 42, 94, 63, 83].map((height, index) => <i style={{ height: `${height}%` }} key={index} />)}</div><footer>Success!  •  ERROR!  •  Warning!!!  •  💥</footer></div><div className="repair-controls"><div><Kicker>Live refactor · Step {Math.min(step, 6)} / 6</Kicker><h3>{step === 0 ? 'A little too loud?' : step >= 6 ? 'Now it feels intentional.' : steps[step - 1]}</h3><p>{step === 0 ? 'We’ll refactor the interface one decision at a time.' : step >= 6 ? 'Roles, rhythm, and contrast. Same data, a clearer story.' : ['Choose one accent, then let neutrals do the heavy lifting.', 'Make the main action obvious. Demote the rest.', 'Keep success, warning, and error meanings stable.', 'Raise text contrast without adding visual noise.', 'Replace one-off values with reusable roles.', 'Build a surface and text hierarchy for low light.'][step - 1]}</p>{step > 0 && <span className="repair-act">{step >= 6 ? 'Recap · Acts 1 → 4' : `From Act ${stepActs[step - 1]} · ${acts[stepActs[step - 1]].name}`}</span>}</div><div className="repair-action"><div className="repair-dots">{steps.map((_, index) => <span className={step > index ? 'done' : ''} key={index} />)}</div><button className="button-primary" onClick={() => setStep(step >= 6 ? 0 : step + 1)}>{step === 0 ? 'Fix this UI' : step >= 6 ? 'Reset demo' : 'Next step'} <ArrowRight size={15} /></button></div></div></div>
}

type Hsl = { h: number; s: number; l: number }

function SlideContent({ index, hsl, setHsl, onJump }: { index: number; hsl: Hsl; setHsl: (hsl: Hsl) => void; onJump: (target: number) => void }) {
  const [selectedRole, setSelectedRole] = useState('Primary')
  const [hierarchyGood, setHierarchyGood] = useState(false)
  const [accentShare, setAccentShare] = useState(10)
  const [darkMode, setDarkMode] = useState(false)
  const [activeMistake, setActiveMistake] = useState(0)
  const [checks, setChecks] = useState<boolean[]>(Array(8).fill(false))
  const selectedColor = hslToHex(hsl)
  const eyebrow = eyebrowFor(index)
  const semantic = [['Success', 'Payment successful', '✓', '#8bd0a5'], ['Error', 'Invalid password', '×', '#e37b72'], ['Warning', 'Storage almost full', '!', '#edbf68'], ['Information', 'New update available', 'i', '#82a9e9']]
  const roles = [['Primary', '#78d5ad', 'Main action', 'primary-600'], ['Secondary', '#7798e8', 'Supporting action', 'secondary-500'], ['Accent', '#edbf68', 'Highlight', 'accent-400'], ['Neutral', '#b7c0ba', 'Structure + surfaces', 'neutral-100']]
  // Ordered by act; `id` keeps the matching .mistake-N style.
  const mistakes = [
    { id: 0, act: 1, name: 'Too many colors', why: 'Too many colors compete for attention.' },
    { id: 6, act: 1, name: 'Inconsistent shades', why: 'Near-miss shades feel unintentional.' },
    { id: 7, act: 1, name: 'Pure black + white', why: 'Harsh extremes erase visual nuance.' },
    { id: 3, act: 2, name: 'No hierarchy', why: 'Every element claims priority.' },
    { id: 4, act: 2, name: 'Color everywhere', why: 'Accent is no longer an accent.' },
    { id: 2, act: 3, name: 'Random semantics', why: 'Color labels contradict their meaning.' },
    { id: 1, act: 3, name: 'Poor contrast', why: 'Low contrast makes key data disappear.' },
    { id: 5, act: 3, name: 'Red / green only', why: 'Color vision differences hide the signal.' },
  ]
  const mistake = mistakes[activeMistake]
  const checklist = [['Does every color have a purpose?', 'Palette'], ['Is the hierarchy clear?', 'Hierarchy'], ['Are semantic colors consistent?', 'Meaning'], ['Is text contrast sufficient?', 'Access'], ['Does it work for color-blind users?', 'Access'], ['Is information conveyed without color alone?', 'Access'], ['Are colors defined as reusable tokens?', 'System'], ['Does dark mode keep its hierarchy?', 'System']]
  const modeTokens = [['--color-background', '#f4f6f2', '#1e2621'], ['--color-surface', '#ffffff', '#252e28'], ['--color-text', '#26332b', '#e8efe9'], ['--color-border', '#dfe5df', '#3a473d'], ['--color-primary', '#43845e', '#a4dfb9']]
  const componentRules = [['background: #78d5ad', 'variant="primary"'], ['className="text-red-500"', 'variant="danger"'], ['border: 1px solid #ae7618', '<Alert variant="warning">'], ['color: #31835a', '<Badge variant="success">']]

  switch (index) {
    // Intro
    case 0: return <div className="title-layout"><div className="title-copy"><Kicker>Frontend fieldnotes <span className="edition">VOL. 04 · 2025</span></Kicker><h1>Color in<br /><em>UI Design</em></h1><p>Choosing colors is easy.<br /><span>Using them well is the hard part.</span></p><div className="title-tags"><span><Contrast size={14} /> Systems</span><span><Layers3 size={14} /> Interfaces</span><span><Gauge size={14} /> Accessibility</span></div></div><div className="spectrum-art" aria-label="Animated color spectrum"><div className="spectrum-ring ring-one"/><div className="spectrum-ring ring-two"/><div className="spectrum-orbit"><i/><i/><i/><i/><i/><i/></div><div className="spectrum-core">COLOR<br /><small>WITH INTENT</small></div><span className="orbit-label label-a">H 158°</span><span className="orbit-label label-b">#78D5AD</span><span className="orbit-label label-c">01 / {totalSlides}</span></div></div>
    case 1: return <><SlideHeading eyebrow={eyebrow} title={<>Color isn't decoration.<br /><span className="heading-accent">Color communicates.</span></>} /><div className="compare-layout"><div className="compare-side"><Kicker>Without a system</Kicker><div className="poor-ui"><header><b>Acme analytics</b><button>Home</button><button style={{ background: '#ff793a' }}>Reports</button><button style={{ background: '#6c4dda' }}>Settings</button></header><h3>Good morning!!!</h3><div><b style={{ color: '#ff2525' }}>$24,928 <small>+3%</small></b><button style={{ background: '#f1d233', color: '#76550a' }}>Click here</button></div><p style={{ color: '#bdbdbd' }}>Everything you need to know is right here.</p></div></div><motion.div className="transform-arrow" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowRight /></motion.div><div className="compare-side"><Kicker>With intention</Kicker><ProductMock /></div></div></>
    case 2: return <><SlideHeading eyebrow={eyebrow} title={<>Five questions,<br /><span className="heading-accent">asked in order.</span></>} /><div className="agenda-layout"><div className="agenda-grid">{acts.slice(1).map((act, i) => { const n = i + 1; return <button key={act.name} className="agenda-card" onClick={() => onJump(actStart(n))}><small>ACT {n} · SLIDES {pad(actStart(n) + 1)}–{pad(actEnd(n) + 1)}</small><strong>{pad(n)}</strong><h3>{act.name}</h3><p>{act.question}</p><ul>{slides.filter((slide) => slide.act === n).map((slide) => <li key={slide.title}>{slide.title}</li>)}</ul></button> })}</div><div className="agenda-note"><span className="hierarchy-line"/><p>Each act builds on the one before. At the end, we fix a broken UI in exactly this order.</p></div></div></>
    // Act 1 · Palette
    case 3: return <><SlideHeading eyebrow={eyebrow} title={<>Color has <span className="heading-accent">three dimensions.</span></>} /><div className="theory-layout"><div className="theory-controls"><div className="theory-slider"><label>Hue <small>{hsl.h}°</small></label><input aria-label="Hue" type="range" min="0" max="359" value={hsl.h} onChange={(event) => setHsl({ ...hsl, h: Number(event.target.value) })} /><small className="range-caption"><span>0°</span><span>360°</span></small></div><div className="theory-slider"><label>Saturation <small>{hsl.s}%</small></label><input aria-label="Saturation" type="range" min="0" max="100" value={hsl.s} onChange={(event) => setHsl({ ...hsl, s: Number(event.target.value) })} /><small className="range-caption"><span>Muted</span><span>Vivid</span></small></div><div className="theory-slider"><label>Lightness <small>{hsl.l}%</small></label><input aria-label="Lightness" type="range" min="5" max="95" value={hsl.l} onChange={(event) => setHsl({ ...hsl, l: Number(event.target.value) })} /><small className="range-caption"><span>Dark</span><span>Light</span></small></div><code>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</code></div><motion.div className="hsl-preview" animate={{ backgroundColor: selectedColor }} transition={{ duration: .25 }}><span className="preview-hue">HUE</span><div className="preview-caption"><b>{selectedColor.toUpperCase()}</b><small>Move the controls.<br />We'll reuse this color later.</small></div><span className="preview-glow" /></motion.div><div className="theory-legend">{[['01', 'Hue', 'Which color family?'], ['02', 'Saturation', 'How vivid or muted?'], ['03', 'Lightness', 'How bright or deep?']].map(([n, title, text]) => <div key={n}><small>{n}</small><b>{title}</b><span>{text}</span></div>)}</div></div></>
    case 4: return <><SlideHeading eyebrow={eyebrow} title={<>Start with a hue.<br /><span className="heading-accent">Explore the wheel.</span></>} /><ColorWheel /></>
    case 5: return <><SlideHeading eyebrow={eyebrow} title={<>Relationships create <span className="heading-accent">palettes.</span></>} /><div className="relationship-layout"><div className="relationship-intro"><span className="large-index">{pad(index + 1)}</span><h3>One base.<br />Different energy.</h3><p>Use the wheel when starting a palette or choosing chart colors. Harmony picks the hues; it doesn’t yet tell you where each one goes.</p><div className="relationship-key"><span><i style={{ background: '#78d5ad' }} /> Base hue</span><span><i style={{ background: '#7798e8' }} /> Supporting hues</span></div></div><RelationshipDemo /></div></>
    case 6: return <><SlideHeading eyebrow={eyebrow} title={<>One hue.<br /><span className="heading-accent">Eleven useful values.</span></>} /><div className="scale-layout"><div className="scale-label"><Kicker>From hue to ramp</Kicker><h3>Your color from<br />slide 04, as a scale.</h3><p>A harmony gives you hues. A scale gives each hue a range: light surfaces, borders, hover states, readable text. That range is what the next act assigns to jobs.</p><div className="scale-code"><code>primary-50</code><code>primary-100</code><code>primary-500</code><code>primary-600</code><code>primary-900</code></div></div><ColorScale hueColor={selectedColor}/></div></>
    // Act 2 · Hierarchy
    case 7: return <><SlideHeading eyebrow={eyebrow} title={<>A UI needs roles,<br /><span className="heading-accent">not just “blue.”</span></>} /><div className="roles-layout"><div className="roles-selector">{roles.map(([role, color, description, step]) => <button className={selectedRole === role ? 'role-selected' : ''} onClick={() => setSelectedRole(role)} key={role}><i style={{ background: color }} /><b>{role}</b><span>{description} · <code>{step}</code></span><ArrowRight size={15} /></button>)}</div><div className="role-product"><ProductMock highlight={selectedRole === 'Neutral' ? 'surface' : selectedRole.toLowerCase()} /><div className="role-caption"><span className="live-dot" /> Highlighting: <b>{selectedRole}</b><span>Pick the job first. Then pick the shade.</span></div></div></div></>
    case 8: return <><SlideHeading eyebrow={eyebrow} title={<>If everything is colorful,<br /><span className="heading-accent">nothing is important.</span></>} /><div className="hierarchy-layout"><div className="hierarchy-toggle"><span>{hierarchyGood ? 'After · Intentional hierarchy' : 'Before · Everything shouts'}</span><button className="text-control" onClick={() => setHierarchyGood(!hierarchyGood)}><RotateCcw size={14} /> Toggle view</button></div><div className={`hierarchy-demo ${hierarchyGood ? 'hierarchy-good' : 'hierarchy-bad'}`}><div className="hierarchy-info"><small>PROJECT ATLAS · UPDATED 2H AGO</small><h3>Quarterly<br />performance</h3><p>Your team's impact, at a glance.</p><div className="hierarchy-number">$128,420 <span>↗ 18.4%</span></div></div><div className="hierarchy-actions"><button className="main-action">View report <ArrowRight size={15} /></button><button className="second-action">Share report</button><p>Last updated by <b>Alex Morgan</b><br /><span>All changes saved · yesterday</span></p><button className="disabled-action" disabled>Archive report</button></div></div><div className="hierarchy-note"><span className="hierarchy-line"/><p>Color gives the primary action a clear lane. Everything else gets out of the way.</p></div></div></>
    case 9: return <><SlideHeading eyebrow={eyebrow} title={<>The <span className="heading-accent">60–30–10</span> rule.</>} /><div className="proportion-layout"><div className="proportion-copy"><div><strong>60<span>%</span></strong><p>Dominant<br /><small>Background + structure</small></p></div><div><strong>30<span>%</span></strong><p>Secondary<br /><small>Surfaces + supporting UI</small></p></div><div><strong>10<span>%</span></strong><p>Accent<br /><small>Actions + focus</small></p></div><label className="accent-range">Accent share <b>{accentShare}%</b><input type="range" min="10" max="40" step="5" value={accentShare} onChange={(event) => setAccentShare(Number(event.target.value))} /></label></div><div className="proportion-preview" style={{ '--noise': `${accentShare * 2.5}%` } as React.CSSProperties}><div className="proportion-app"><div><span className="brand-dot" /> northstar</div><h3>Good work<br />starts with focus.</h3><p>One clear action beats a dozen bright ones.</p><button>Start a project <ArrowRight size={14} /></button><div className="proportion-footer"><i/><i/><i/><i/><i/><i/><i/><i/></div></div><div className="proportion-status"><span>{accentShare <= 15 ? '✓ Focused' : '⚠ Getting noisy'}</span><small>{accentShare}% accent surface</small></div></div></div></>
    // Act 3 · Meaning & access
    case 10: return <><SlideHeading eyebrow={eyebrow} title={<>Colors have <span className="heading-accent">meaning.</span></>} /><div className="semantic-layout"><div className="semantic-grid">{semantic.map(([name, message, icon, color], i) => <motion.button whileHover={{ y: -4 }} transition={spring} className="semantic-card" style={{ '--semantic': color } as React.CSSProperties} key={name}><div className="semantic-icon">{icon}</div><small>0{i + 1} / {name}</small><h3>{message}</h3><span>Just now <i /></span></motion.button>)}</div><div className="semantic-caption"><span>✓</span><p>Semantic colors mean the same thing on every screen. Red is never “brand,” green is never “decoration.”</p></div></div></>
    case 11: return <><SlideHeading eyebrow={eyebrow} title={<>Contrast = <span className="heading-accent">legibility.</span></>} /><div className="contrast-layout"><div className="contrast-context"><p>A meaning only works if people can read it. Contrast decides who can read, act, and understand.</p><div className="contrast-stats"><div><b>4.5:1</b><small>AA · body text</small></div><div><b>3:1</b><small>AA · large text + UI</small></div><div><b>7:1</b><small>AAA · body text</small></div></div><span className="contrast-standard">WCAG 2.2 · AA</span></div><ContrastChecker /></div></>
    case 12: return <><SlideHeading eyebrow={eyebrow} title={<>Never communicate<br /><span className="heading-accent">important information with color alone.</span></>} /><div className="access-layout"><div className="access-examples"><div className="access-problem"><small>01 / COLOR VISION</small><div><span className="red-dot"/> <span className="green-dot"/></div><p>Red and green can look nearly identical to 1 in 12 men.</p></div><div className="access-problem"><small>02 / ERROR STATE</small><div className="error-example"><b>●</b><strong>Error</strong><span>Invalid email address</span></div><p>Pair color with an icon and a clear label.</p></div><div className="access-problem"><small>03 / CHARTS</small><div className="contrast-compare"><span>● ● ● Legend by color</span><b>▲ Revenue ■ Costs ● Users</b></div><p>Use shapes, patterns, or direct labels as well as color.</p></div></div><div className="access-takeaway"><div className="access-mark">Aa</div><Kicker>Design for more people</Kicker><h3>Color should<br />reinforce the signal.<br /><em>Never be the signal.</em></h3><span>Icon · label · pattern · text</span></div></div></>
    // Act 4 · System
    case 13: return <><SlideHeading eyebrow={eyebrow} title={<>Name the role,<br /><span className="heading-accent">not the value.</span></>} /><TokenDemo /></>
    case 14: return <><SlideHeading eyebrow={eyebrow} title={<>From design decision<br /><span className="heading-accent">to CSS variable.</span></>} /><div className="pipeline"><div className="pipeline-flow">{[['Design', '◈'], ['Tokens', '▤'], ['CSS vars', '⌘'], ['Components', '◫'], ['Application', '▦']].map(([name, icon], i) => <div className="pipeline-step" key={name}><div><span>{icon}</span><b>{name}</b></div>{i < 4 && <ArrowRight size={16} />}</div>)}</div><div className="code-preview"><div className="code-title"><span><i/> variables.css</span><small>TOKENS → RUNTIME</small></div><pre><code><span className="syntax-selector">:root</span> {'{'}<br />  <span className="syntax-prop">--color-primary</span>: <span className="syntax-value">#78d5ad</span>;<br />  <span className="syntax-prop">--color-primary-hover</span>: <span className="syntax-value">#58b78f</span>;<br />  <span className="syntax-prop">--color-background</span>: <span className="syntax-value">#f7f8f5</span>;<br />  <span className="syntax-prop">--color-surface</span>: <span className="syntax-value">#ffffff</span>;<br />  <span className="syntax-prop">--color-text</span>: <span className="syntax-value">#202923</span>;<br />  <span className="syntax-prop">--color-border</span>: <span className="syntax-value">#dce3dd</span>;<br />  <span className="syntax-prop">--color-success</span>: <span className="syntax-value">#31835a</span>;<br />  <span className="syntax-prop">--color-error</span>: <span className="syntax-value">#bb5550</span>;<br />{'}'}</code></pre><span className="token-benefit"><Check size={13}/> Components read var(--color-primary). Never a hex value.</span></div></div></>
    case 15: return <><SlideHeading eyebrow={eyebrow} title={<>Components <span className="heading-accent">own the meaning.</span></>} /><div className="developer-layout"><div className="component-rules"><Kicker>Hardcoded → semantic</Kicker>{componentRules.map(([bad, good]) => <div key={bad}><s>{bad}</s><ArrowRight size={13}/><b>{good}</b></div>)}<p>Hex values leak into every screen and break on a rebrand. Variants keep the decision in one place, which is what makes dark mode possible.</p></div><div className="component-code"><div className="code-title"><span><i/> Button.tsx</span><small>DESIGN SYSTEM</small></div><pre><code><span className="syntax-muted">// Meaning lives in the variant.</span><br /><span className="syntax-key">&lt;Button</span> <span className="syntax-prop">variant</span>=<span className="syntax-string">"primary"</span> /&gt;<br /><span className="syntax-key">&lt;Button</span> <span className="syntax-prop">variant</span>=<span className="syntax-string">"danger"</span> /&gt;<br /><span className="syntax-key">&lt;Alert</span> <span className="syntax-prop">variant</span>=<span className="syntax-string">"warning"</span> /&gt;<br /><span className="syntax-key">&lt;Badge</span> <span className="syntax-prop">variant</span>=<span className="syntax-string">"success"</span> /&gt;</code></pre><div className="component-samples"><button>Primary action <ArrowRight size={14}/></button><span>● Warning · Low storage</span><i>✓ Success</i></div><p>Good color systems become reusable through components.</p></div></div></>
    case 16: return <><SlideHeading eyebrow={eyebrow} title={<>Dark mode is <span className="heading-accent">a second token set.</span></>} /><div className="darkmode-layout"><div className="darkmode-copy"><p>Same token names. New values. Components don’t change.</p><div className="mode-tokens">{modeTokens.map(([name, light, dark]) => <div key={name}><i style={{ background: darkMode ? dark : light }} /><code>{name}</code><code>{darkMode ? dark : light}</code></div>)}</div><small>Don’t invert. Rebuild the hierarchy: raised surfaces get lighter, saturation drops, semantics stay recognizable.</small><button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Moon size={16} /> : <Sun size={16} />} <span>{darkMode ? 'Dark mode' : 'Light mode'}</span><i className={darkMode ? 'toggle-on' : ''} /></button></div><motion.div className="darkmode-product" animate={{ backgroundColor: darkMode ? '#1e2621' : '#f4f6f2', color: darkMode ? '#e8efe9' : '#26332b' }} transition={{ duration: .35 }}><ProductMock dark={darkMode} /><div className="mode-note"><span>{darkMode ? 'NIGHT SHIFT' : 'DAYLIGHT'}</span><b>{darkMode ? 'Low-glare surfaces. Same clear signals.' : 'A soft neutral canvas. Calm, not clinical.'}</b></div></motion.div></div></>
    // Act 5 · Apply it
    case 17: return <><SlideHeading eyebrow={eyebrow} title={<>Color mistakes<br /><span className="heading-accent">you can now spot in a second.</span></>} /><div className="mistakes-layout"><div className="mistakes-list">{mistakes.map((item, i) => <button key={item.name} className={activeMistake === i ? 'mistake-active' : ''} onClick={() => setActiveMistake(i)}><span>0{i + 1}</span>{item.name}<ArrowRight size={14}/></button>)}</div><div className={`mistake-display mistake-${mistake.id}`}><div className="mistake-window"><div className="mistake-windowbar"><i/><i/><i/><span>dashboard / design-system</span></div><ProductMock variant="bad"/></div><div className="mistake-caption"><span>ISSUE 0{activeMistake + 1} · ACT {mistake.act} {acts[mistake.act].name.toUpperCase()}</span><b>{mistake.why}</b></div></div></div></>
    case 18: return <><SlideHeading eyebrow={eyebrow} title={<>Same product.<br /><span className="heading-accent">Better decisions.</span></>} /><BadUiDemo /></>
    case 19: return <><SlideHeading eyebrow={eyebrow} title={<>Before you <span className="heading-accent">ship.</span></>} /><div className="checklist-layout"><div className="checklist-items">{checklist.map(([item, act], i) => <button key={item} className={checks[i] ? 'checked' : ''} onClick={() => setChecks(checks.map((value, j) => j === i ? !value : value))}><span>{checks[i] && <Check size={13}/>}</span><b>{item}</b><small>{act}</small></button>)}</div><div className="final-statement"><Kicker>{checks.filter(Boolean).length} / {checklist.length} checks complete</Kicker><h2>Don't just<br />pick colors.</h2><p>Give them <em>meaning.</em></p><div className="final-mark">C<span>·</span></div></div></div></>
    default: return null
  }
}

function ColorScale({ hueColor }: { hueColor: string }) {
  const [baseColor, setBaseColor] = useState(hueColor)
  const scale = colorScale(baseColor)
  return <div className="scale-demo"><div className="scale-bar">{scale.map((color, index) => <div key={index} style={{ backgroundColor: color }}><span>{[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][index]}</span></div>)}</div><div className="scale-details">{scale.map((color, index) => <div key={index}><i style={{ backgroundColor: color }} /><small>{[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][index]}</small><code>{color.toUpperCase()}</code></div>)}</div><label className="scale-picker">Try another hue <input type="color" value={baseColor} aria-label="Set scale base color" onChange={(event) => setBaseColor(event.target.value)} /></label></div>
}

function KeyboardHelp({ onClose }: { onClose: () => void }) {
  return <motion.div className="help-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div className="help-dialog" initial={{ y: 10, scale: .98 }} animate={{ y: 0, scale: 1 }} onClick={(event) => event.stopPropagation()}><button className="help-close" onClick={onClose} aria-label="Close shortcuts"><X size={18}/></button><Kicker>Quick controls</Kicker><h2>Move around</h2>{[['← / →', 'Previous / next slide'], ['Space', 'Next slide'], ['Home / End', 'First / last slide'], ['F', 'Toggle fullscreen'], ['Esc', 'Exit fullscreen'], ['?', 'Show this panel']].map(([key, action]) => <div className="shortcut-row" key={key}><span>{action}</span><kbd>{key}</kbd></div>)}</motion.div></motion.div>
}

function App() {
  const [slide, setSlide] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  // Lifted so the color mixed on the HSL slide carries into the scale slide.
  const [hsl, setHsl] = useState<Hsl>({ h: 158, s: 55, l: 58 })
  const { act } = slides[slide]
  const go = (target: number) => setSlide(Math.max(0, Math.min(totalSlides - 1, target)))

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setHelpOpen(false)
        window.setTimeout(() => {
          if (document.fullscreenElement) void document.exitFullscreen()
        }, 25)
        return
      }
      if (isTyping) return
      if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); go(slide + 1) }
      else if (event.key === 'ArrowLeft') go(slide - 1)
      else if (event.key === 'Home') go(0)
      else if (event.key === 'End') go(totalSlides - 1)
      else if (event.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen()
        else void document.documentElement.requestFullscreen()
      }
      else if (event.key === '?') setHelpOpen(true)
    }
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    window.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => { window.removeEventListener('keydown', onKeyDown, true); document.removeEventListener('fullscreenchange', onFullscreen) }
  }, [slide])

  return <main className="presentation-shell"><div className="ambient-grid"/><div className="topbar"><div className="wordmark"><span>◈</span> FIELDNOTES <i> / </i> FRONTEND</div><div className="topbar-center"><span className="session-dot"/> COLOR SYSTEMS <span className="topbar-divider">·</span> 18 MIN</div><button className="icon-button help-button" aria-label="Keyboard shortcuts" onClick={() => setHelpOpen(true)}><CircleHelp size={17}/><span>Shortcuts</span><kbd>?</kbd></button></div><section className="stage" aria-label={`Slide ${slide + 1}: ${slides[slide].title}`}><motion.article key={slide} className={`slide slide-${slide}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24, ease: 'easeOut' }}><SlideContent index={slide} hsl={hsl} setHsl={setHsl} onJump={go}/></motion.article></section><footer className="navigation"><div className="nav-meta"><span className="nav-section">{act === 0 ? 'INTRO' : `ACT ${act}`} <b>{act === 0 ? 'COLOR IN UI' : acts[act].name.toUpperCase()}</b></span><span className="nav-title">{slides[slide].title}</span></div><div className="nav-controls"><button className="nav-button" onClick={() => go(slide - 1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={16}/><span>Previous</span></button><div className="slide-count"><b>{String(slide + 1).padStart(2, '0')}</b><span>/</span>{String(totalSlides).padStart(2, '0')}</div><button className="nav-button next-button" onClick={() => go(slide + 1)} disabled={slide === totalSlides - 1} aria-label="Next slide"><span>Next</span><ArrowRight size={16}/></button></div><button className="icon-button fullscreen-button" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>{isFullscreen ? <Focus size={17}/> : <Expand size={17}/>}</button><div className="progress-track">{acts.slice(1).map((_, i) => <i className="progress-tick" key={i} style={{ left: `${(actStart(i + 1) / totalSlides) * 100}%` }} />)}<motion.div className="progress-fill" animate={{ width: `${((slide + 1) / totalSlides) * 100}%` }} transition={{ duration: .25 }}/></div></footer><AnimatePresence>{helpOpen && <KeyboardHelp onClose={() => setHelpOpen(false)}/>}</AnimatePresence></main>
}

export default App