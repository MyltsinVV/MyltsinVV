// Чистая функция: данные профиля -> строка SVG. Ни сети, ни файлов.

const C = {
    bg: '#ffffff',
    border: '#d0d7de',
    text: '#1f2328',
    muted: '#656d76',
    accent: '#d29b00',
    bar: '#eaeef2',
}

const CERT_COLORS = { BRONZE: '#cd7f32', SILVER: '#8c959f', GOLD: '#d29b00', LEGEND: '#e8590c' }
const CERT_NAMES = {
    CODING_SPEED: 'Coding speed',
    COLLABORATION: 'Collaboration',
    AI: 'Bot / AI',
    ALGORITHMS: 'Algorithms',
    OPTIMIZATION: 'Optimization',
}
const CATEGORIES = [
    ['clash', 'Clash of Code'],
    ['codegolf', 'Code golf'],
    ['contest', 'Contests'],
    ['optim', 'Optimization'],
    ['botProgramming', 'Bot programming'],
]

const W = 520
const PAD = 24
const ROW = 22
const COL2 = W / 2 + 40 // x правой колонки

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const fmt = (n) => Number(n).toLocaleString('en-US')
const titleCase = (s) => s[0] + s.slice(1).toLowerCase()
const topPct = (rank, total) => {
    const p = (rank / total) * 100
    return p < 1 ? p.toFixed(2) : p < 10 ? p.toFixed(1) : Math.round(p)
}

// Доля пути от текущего уровня к следующему, 0..1
function xpProgress({ codingamer, xpThresholds = [] }) {
    const cur = xpThresholds.find((t) => t.level === codingamer.level)
    const next = xpThresholds.find((t) => t.level === codingamer.level + 1)
    if (!cur || !next) return 0
    return Math.min(1, Math.max(0, (codingamer.xp - cur.cumulativeXp) / (next.cumulativeXp - cur.cumulativeXp)))
}

export function render({ stats, language = [], certifications = [], points, achievements = [] }) {
    const me = stats.codingamer
    const progress = xpProgress(stats)
    const TOP = 120 // y первой строки колонок

    // Левая колонка: места по категориям
    const rankings = CATEGORIES
        .filter(([key]) => points[`${key}PointsRankGlobal`]) // нет места — нет строки
        .map(([key, label], i) => {
            const rank = points[`${key}PointsRankGlobal`]
            const total = points.totalCodingamerGlobal[key]
            const y = TOP + i * ROW
            return `
    <text x="${PAD}" y="${y}" class="muted">${label}</text>
    <text x="230" y="${y}" class="value" text-anchor="end">#${fmt(rank)}</text>
    <text x="238" y="${y}" class="muted small">top ${topPct(rank, total)}%</text>`
        })

    // Правая колонка собирается сверху вниз, y считается по ходу
    let y = TOP
    const right = []

    for (const c of certifications) {
        const color = CERT_COLORS[c.level] ?? C.muted
        right.push(`
    <circle cx="${COL2 + 6}" cy="${y - 4}" r="5" fill="${color}"/>
    <text x="${COL2 + 18}" y="${y}" class="muted">${esc(CERT_NAMES[c.category] ?? c.category)}</text>
    <text x="${W - PAD}" y="${y}" class="value" text-anchor="end" style="fill:${color}">${titleCase(c.level)}</text>`)
        y += ROW
    }

    // Под сертификатами одна строка: главный язык слева, ачивки справа
    const lang = [...language].sort((a, b) => b.puzzleCount - a.puzzleCount)[0]
    y += 6
    right.push(`
    <text x="${COL2}" y="${y}" class="section">LANGUAGE</text>
    <text x="${W - PAD}" y="${y}" class="section" text-anchor="end">ACHIEVEMENTS</text>
    <text x="${COL2}" y="${y + ROW}" class="muted">${lang ? `${esc(lang.languageName)} · ${lang.puzzleCount}` : '—'}</text>
    <text x="${W - PAD}" y="${y + ROW}" class="muted" text-anchor="end"><tspan class="value">${stats.achievementCount}</tspan> / ${achievements.length}</text>`)
    y += ROW

    const H = Math.max(TOP + rankings.length * ROW, y) + 14

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    text { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif; fill: ${C.text}; font-size: 13px; }
    .muted { fill: ${C.muted}; }
    .small { font-size: 11px; }
    .value { font-weight: 600; fill: ${C.text}; }
    .title { font-size: 18px; font-weight: 700; }
    .section { font-size: 11px; font-weight: 700; letter-spacing: 1px; fill: ${C.accent}; }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="8" fill="${C.bg}" stroke="${C.border}"/>

  <text x="${PAD}" y="38" class="title">${esc(me.pseudo)}</text>
  <text x="${W - PAD}" y="38" class="muted" text-anchor="end">CodinGame · ${esc(me.countryId)}</text>

  <text x="${PAD}" y="66" class="small muted">Level <tspan class="value" style="fill:${C.accent}" font-size="14">${me.level}</tspan></text>
  <rect x="90" y="57" width="190" height="8" rx="4" fill="${C.bar}"/>
  <rect x="90" y="57" width="${Math.max(8, 190 * progress)}" height="8" rx="4" fill="${C.accent}"/>
  <text x="290" y="66" class="small muted">${Math.round(progress * 100)}% to ${me.level + 1}</text>
  <text x="${W - PAD}" y="66" class="small muted" text-anchor="end">Global <tspan class="value">#${fmt(points.globalPointsRankGlobal)}</tspan> · top ${topPct(points.globalPointsRankGlobal, points.totalCodingamerGlobal.global)}%</text>

  <line x1="${PAD}" y1="80" x2="${W - PAD}" y2="80" stroke="${C.border}"/>
  <text x="${PAD}" y="98" class="section">RANKINGS</text>
  <text x="${COL2}" y="98" class="section">CERTIFICATIONS</text>
  ${rankings.join('')}
  ${right.join('')}
</svg>
`
}
