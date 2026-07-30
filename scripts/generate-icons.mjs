import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const publicDir = path.resolve(process.cwd(), 'public')
mkdirSync(publicDir, { recursive: true })

function pentagonCoords(cx, cy, r) {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return {
      x: Number((cx + r * Math.cos(angle)).toFixed(2)),
      y: Number((cy + r * Math.sin(angle)).toFixed(2))
    }
  })
}

function pentagonPoints(cx, cy, r) {
  return pentagonCoords(cx, cy, r).map(p => `${p.x},${p.y}`).join(' ')
}

function gradientDef(id = 'g') {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#EC4899"/></linearGradient></defs>`
}

function logoA(size, maskable = false) {
  const r = maskable ? 18 : 34
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" fill="#F3F4F6"/>${gradientDef()}<polygon points="${pentagonPoints(50, 50, r)}" fill="url(#g)"/></svg>`
}

function logoB(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" fill="#F3F4F6"/>${gradientDef()}<path d="M30 25 H70 L30 45 H70 L30 65 H70" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

function logoC(size) {
  const dots = pentagonCoords(50, 50, 30)
    .map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${i % 2 ? '#EC4899' : '#8B5CF6'}"/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" fill="#F3F4F6"/>${gradientDef()}<circle cx="50" cy="50" r="30" fill="none" stroke="url(#g)" stroke-width="6"/>${dots}</svg>`
}

writeFileSync(path.join(publicDir, 'favicon.svg'), logoA(100))
writeFileSync(path.join(publicDir, 'logo-a.svg'), logoA(512))
writeFileSync(path.join(publicDir, 'logo-b.svg'), logoB(512))
writeFileSync(path.join(publicDir, 'logo-c.svg'), logoC(512))

const icons = [
  { file: 'icon-192.png', svg: logoA(192) },
  { file: 'icon-512.png', svg: logoA(512) },
  { file: 'apple-touch-icon.png', svg: logoA(180) },
  { file: 'icon-512-maskable.png', svg: logoA(512, true) }
]

await Promise.all(
  icons.map(async icon => {
    await sharp(Buffer.from(icon.svg), { density: 300 })
      .png()
      .toFile(path.join(publicDir, icon.file))
  })
)