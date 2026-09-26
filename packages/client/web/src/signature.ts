/**
 * Single-line "DeepSeek" lettering shared by the boot drawing and the empty
 * conversation's depth mark.
 * @module @deepseek-ai/dsh-client-web/src/signature
 */

/** One pen movement: path data and its measured length in viewBox units. */
interface Stroke {
  readonly d: string
  readonly length: number
}

/** Pen movements in writing order: D, eep, p descender, S, ee, k. */
const STROKES: readonly Stroke[] = [
  { d: 'M10 100 L10 16 L36 16 C64 16 82 34 82 58 C82 82 64 100 36 100 Z', length: 276 }, // D
  { d: 'M98 70 L158 70 A30 30 0 1 0 152 88', length: 229 },                              // e
  { d: 'M172 70 L232 70 A30 30 0 1 0 226 88', length: 229 },                             // e
  { d: 'M250 40 L250 124', length: 84 },                                                 // p stem
  { d: 'M250 70 A30 30 0 1 1 310 70 A30 30 0 1 1 250 70', length: 189 },                 // p bowl
  { d: 'M384 30 C377 20 366 14 353 14 C337 14 326 23 326 36 C326 50 338 55 355 59 C373 63 386 69 386 82 C386 95 373 102 355 102 C339 102 328 96 321 86', length: 238 }, // S
  { d: 'M402 70 L462 70 A30 30 0 1 0 456 88', length: 229 },                             // e
  { d: 'M476 70 L536 70 A30 30 0 1 0 530 88', length: 229 },                             // e
  { d: 'M556 12 L556 100', length: 88 },                                                 // k stem
  { d: 'M600 42 L560 74', length: 51 },                                                  // k arm
  { d: 'M576 62 L604 100', length: 47 },                                                 // k leg
]

/** Time spent moving the pen across all strokes. */
const INK_MS = 1500

/** Pause between two strokes while the pen lifts. */
const LIFT_MS = 45

/** Total drawing time: ink plus the pen lifts between strokes. */
export const SIGNATURE_DRAW_MS = 700 + INK_MS + LIFT_MS * (STROKES.length - 1)

/**
 * Build the signature. With `timed`, every stroke carries its own delay and
 * duration so the strokes are written one after another at a steady pen
 * speed instead of all at once.
 * @param timed - Whether to attach per-stroke drawing times.
 * @returns An inert SVG containing only fixed path data.
 */
export function signatureSvg(timed = false, withGlow = false): string {
  const total = STROKES.reduce((sum, stroke) => sum + stroke.length, 0)
  let at = timed ? 700 : 0
  const paths = STROKES.map(({ d, length }) => {
    const duration = Math.round(INK_MS * length / total)
    const style = timed ? ` style="--dsh-stroke-delay:${String(at)}ms;--dsh-stroke-duration:${String(duration)}ms"` : ''
    at += duration + LIFT_MS
    return `<path d="${d}" pathLength="1"${style}/>`
  })

  let content = paths.join('')
  if (withGlow) {
    content = `<g class="wordGlow" stroke="url(#dsh-iris-text)" stroke-width="15" filter="url(#dsh-glow)" opacity="0.5">${paths.join('')}</g><g class="wordInk" stroke="url(#dsh-iris-text)" stroke-width="10">${paths.join('')}</g>`
  }

  const strokeW = withGlow ? '' : ' stroke-width="8"'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 136" fill="none" stroke="currentColor"${strokeW} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`
}
