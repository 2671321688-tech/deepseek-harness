// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BootPage } from '../src/boot-page.ts'
import { SIGNATURE_DRAW_MS } from '../src/signature.ts'
import css from '../src/boot-page.module.css'

/** Two animation frames plus the settle pause before the pen starts. */
const SHOWN = 16 * 2 + 120

const pages: BootPage[] = []

function mount() {
  const container = document.createElement('div')
  document.body.append(container)
  const page = new BootPage(container)
  pages.push(page)
  return { page, container }
}

const overlay = () => document.querySelector<HTMLElement>('[data-dsh-boot]')

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height, toJSON: () => ({}) }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => { callback(0) }, 16))
})

afterEach(() => {
  for (const page of pages.splice(0)) page.dispose()
  document.body.innerHTML = ''
  delete document.body.dataset.dshMotion
  Reflect.deleteProperty(document, 'readyState')
  Reflect.deleteProperty(document, 'visibilityState')
  Reflect.deleteProperty(window, 'matchMedia')
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('BootPage hand-off', () => {
  it('writes the strokes one after another once shown, holds, then leaves', () => {
    const { page, container } = mount()
    const delays = [...document.querySelectorAll(`.${css.signatureCore} path`)]
      .map(path => Number.parseInt((path as HTMLElement).style.getPropertyValue('--dsh-stroke-delay'), 10))
    expect(delays[0]).toBe(700)
    expect(delays.every((delay, index) => index === 0 || delay > delays[index - 1]!)).toBe(true)
    // React replacing the mount point does not take the overlay with it.
    container.replaceChildren(document.createElement('main'))
    page.finish()
    vi.advanceTimersByTime(SHOWN - 1)
    expect(overlay()?.dataset.drawing).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(overlay()?.dataset.drawing).toBe('')
    vi.advanceTimersByTime(SIGNATURE_DRAW_MS - 1)
    expect(overlay()?.dataset.drawn).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(overlay()?.dataset.drawn).toBe('')
    vi.advanceTimersByTime(349)
    expect(overlay()?.dataset.leaving).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(overlay()?.dataset.leaving).toBe('full')
    page.finish()
    vi.advanceTimersByTime(599)
    expect(overlay()).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(overlay()).toBeNull()
  })

  it('waits for the document to load and the window to become visible', () => {
    let readyState: DocumentReadyState = 'loading'
    let visibility: DocumentVisibilityState = 'hidden'
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => readyState })
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
    mount()
    vi.advanceTimersByTime(1000)
    readyState = 'complete'
    window.dispatchEvent(new Event('load'))
    vi.advanceTimersByTime(1000)
    expect(overlay()?.dataset.drawing).toBeUndefined()
    visibility = 'visible'
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(SHOWN)
    expect(overlay()?.dataset.drawing).toBe('')
  })

  it('stops waiting for a window that is never reported as shown', () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    const { page } = mount()
    page.finish()
    vi.advanceTimersByTime(2999)
    expect(overlay()?.dataset.skipped).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(overlay()?.dataset.leaving).toBe('full')
  })

  it('sinks the signature into the depth mark', () => {
    const mark = document.createElement('div')
    mark.dataset.dshDepthMark = ''
    mark.getBoundingClientRect = () => rect(100, 200, 155, 100)
    document.body.append(mark)
    const { page } = mount()
    const signature = document.querySelector<HTMLElement>(`.${css.signature}`)!
    signature.getBoundingClientRect = () => rect(0, 0, 310, 118)
    page.finish()
    vi.advanceTimersByTime(SHOWN + SIGNATURE_DRAW_MS + 350)
    expect(signature.style.transform).toBe('translate(22.5px, 191px) scale(0.5)')
  })

  it('does not move the signature toward a depth mark that has no layout', () => {
    const mark = document.createElement('div')
    mark.dataset.dshDepthMark = ''
    document.body.append(mark)
    const { page } = mount()
    page.finish()
    vi.advanceTimersByTime(SHOWN + SIGNATURE_DRAW_MS + 350)
    expect(overlay()?.dataset.leaving).toBe('full')
    expect(document.querySelector<HTMLElement>(`.${css.signature}`)!.style.transform).toBe('')
  })

  it('completes the signature on a key or click and leaves without holding', () => {
    const { page } = mount()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(overlay()?.dataset.skipped).toBe('')
    expect(overlay()?.dataset.drawn).toBe('')
    overlay()?.click()
    vi.advanceTimersByTime(SHOWN)
    expect(overlay()?.dataset.drawing).toBeUndefined()
    page.finish()
    vi.advanceTimersByTime(0)
    expect(overlay()?.dataset.leaving).toBe('full')
    vi.advanceTimersByTime(600)
    expect(overlay()).toBeNull()
  })

  it('shows the signature at rest and fades out when motion is reduced', () => {
    document.body.dataset.dshMotion = 'reduced'
    const { page } = mount()
    vi.advanceTimersByTime(SHOWN)
    expect(overlay()?.dataset.drawing).toBeUndefined()
    expect(overlay()?.dataset.drawn).toBe('')
    page.finish()
    vi.advanceTimersByTime(0)
    expect(overlay()?.dataset.leaving).toBe('reduced')
    vi.advanceTimersByTime(200)
    expect(overlay()).toBeNull()
  })

  it('follows the system reduced-motion preference', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: true }) })
    const { page } = mount()
    page.finish()
    vi.advanceTimersByTime(SHOWN)
    expect(overlay()?.dataset.leaving).toBe('reduced')
  })

  it('removes the page at once when animations are off', () => {
    document.body.dataset.dshMotion = 'off'
    const { page } = mount()
    page.finish()
    vi.advanceTimersByTime(SHOWN)
    expect(overlay()).toBeNull()
  })

  it('keeps failure reports on screen', () => {
    const { page } = mount()
    page.finish()
    vi.advanceTimersByTime(SHOWN + SIGNATURE_DRAW_MS + 350)
    expect(overlay()?.dataset.leaving).toBe('full')
    page.setState('broken', 'failed')
    expect(overlay()?.dataset.leaving).toBeUndefined()
    vi.advanceTimersByTime(10_000)
    expect(document.body.textContent).toContain('broken')
    const failed = mount().page
    failed.fail('Unable to load module')
    failed.finish()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    vi.runAllTimers()
    expect(document.body.textContent).toContain('Unable to load module')
  })

  it('schedules nothing after disposal', () => {
    const { page } = mount()
    vi.advanceTimersByTime(16)
    page.dispose()
    vi.runAllTimers()
    page.finish()
    expect(vi.getTimerCount()).toBe(0)
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    mount().page.dispose()
    window.dispatchEvent(new Event('load'))
    expect(vi.getTimerCount()).toBe(0)
  })
})
