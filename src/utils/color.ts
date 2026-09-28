export type RGB = { r: number; g: number; b: number }
export type HSL = { h: number; s: number; l: number }

export function hexToRgb(hex: string): RGB {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized
  const value = Number.parseInt(full, 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`
}

export function hslToHex({ h, s, l }: HSL): string {
  const saturation = s / 100
  const lightness = l / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const section = h / 60
  const second = chroma * (1 - Math.abs((section % 2) - 1))
  const [red, green, blue] = section < 1 ? [chroma, second, 0] : section < 2 ? [second, chroma, 0] : section < 3 ? [0, chroma, second] : section < 4 ? [0, second, chroma] : section < 5 ? [second, 0, chroma] : [chroma, 0, second]
  const offset = lightness - chroma / 2
  return rgbToHex({ r: (red + offset) * 255, g: (green + offset) * 255, b: (blue + offset) * 255 })
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex)
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return { h: Math.round(hue), s: Math.round(saturation * 100), l: Math.round(lightness * 100) }
}

function linearize(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex)
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  }
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

export function colorAtHue(hex: string, offset: number): string {
  const hsl = hexToHsl(hex)
  return hslToHex({ ...hsl, h: (hsl.h + offset + 360) % 360 })
}

export function colorScale(hex: string): string[] {
  const base = hexToHsl(hex)
  const levels = [97, 92, 83, 73, 63, base.l, Math.max(30, base.l - 8), Math.max(23, base.l - 17), Math.max(17, base.l - 25), Math.max(12, base.l - 33), Math.max(8, base.l - 40)]
  return levels.map((lightness, index) => hslToHex({ h: base.h, s: Math.min(100, base.s + (index < 5 ? 2 : 0)), l: lightness }))
}