/**
 * Framework-free boot page and failure report. It remains available when a
 * client plugin fails because React arrives only with the UI renderer.
 *
 * The page lives in a body-level overlay so React's first commit into the
 * mount point cannot clear it. Once the window is on screen it writes the
 * signature stroke by stroke; after the application has mounted and the
 * drawing is complete it sinks into the empty page's depth mark and leaves.
 * @module @deepseek-ai/dsh-client-web/src/boot-page
 */
import type { LoaderEntryState } from './loader-status.ts'
import css from './boot-page.module.css'
import { SIGNATURE_DRAW_MS, signatureSvg } from './signature.ts'

/** Pause after the window has painted before the pen starts. */
const SETTLE_MS = 120

/** How long the finished signature stays before the page leaves. */
const HOLD_MS = 350

/** Removal delay per motion mode, matching the leave transitions in CSS. */
const LEAVE_MS = { full: 600, reduced: 200, off: 0 } as const

/** Longest wait for the window to be shown once the application is ready. */
const SHOWN_TIMEOUT_MS = 3000

/** Animation preference resolved from settings and the operating system. */
type Motion = keyof typeof LEAVE_MS

/** Create a div with one module class and optional text. */
function div(className: string | undefined, text?: string): HTMLDivElement {
  const el = document.createElement('div')
  el.className = className ?? ''
  if (text !== undefined) el.textContent = text
  return el
}

/** Kernel-owned page drawn above the application's root element. */
export class BootPage {
  private readonly root: HTMLDivElement
  private readonly bg: HTMLDivElement
  private readonly defsSvg: HTMLDivElement
  private readonly card: HTMLDivElement
  private readonly whale: HTMLDivElement
  private readonly signature: HTMLDivElement
  private readonly wordmark: HTMLDivElement
  private readonly spinner: HTMLDivElement
  private readonly hint: HTMLDivElement
  private readonly states = new Map<string, LoaderEntryState>()
  private readonly active = new Set<string>()
  private readonly timers = new Set<ReturnType<typeof setTimeout>>()
  private total = 0
  private failure: string | undefined
  private motion: Motion = 'full'
  private started = false
  private drawn = false
  private ready = false
  private leaving = false
  private disposed = false
  private readonly skip = (): void => {
    if (this.drawn) return
    this.started = true
    this.root.dataset.skipped = ''
    this.markDrawn()
  }

  /**
   * Build and attach the boot page.
   * @param container - Application mount point.
   */
  constructor(container: HTMLElement) {
    const doc = container.ownerDocument
    this.root = div(css.boot)
    this.root.dataset.dshBoot = ''

    this.bg = div(css.bg)
    this.root.append(this.bg)

    this.defsSvg = div('')
    this.defsSvg.innerHTML = `<svg width="0" height="0" style="position:absolute">
  <defs>
    <path id="dsh-whale-path" d="M968.002 326.025C959.5 321.85 955.842 329.804 950.865 333.835C949.162 335.143 947.722 336.834 946.283 338.393C933.859 351.673 919.336 360.407 900.376 359.363C872.649 357.804 848.963 366.525 828.035 387.759C823.586 361.583 808.812 345.951 786.313 335.936C774.536 330.729 762.64 325.51 754.401 314.186C748.645 306.112 747.074 297.127 744.195 288.274C742.36 282.936 740.538 277.465 734.385 276.554C727.718 275.51 725.103 281.112 722.476 285.803C712.006 304.95 707.952 326.039 708.349 347.405C709.26 395.463 729.54 433.742 769.823 460.962C774.404 464.094 775.579 467.212 774.14 471.771C771.394 481.153 768.119 490.257 765.241 499.639C763.406 505.624 760.66 506.933 754.256 504.329C732.154 495.08 713.049 481.417 696.175 464.874C667.524 437.138 641.633 406.536 609.325 382.566C601.733 376.964 594.154 371.758 586.298 366.802C553.33 334.773 590.616 308.464 599.251 305.333C608.282 302.082 602.393 290.877 573.214 291.009C544.048 291.141 517.364 300.906 483.353 313.935C478.389 315.891 473.147 317.318 467.786 318.494C436.917 312.64 404.873 311.332 371.377 315.111C308.332 322.141 257.975 351.964 220.953 402.876C176.471 464.081 166.014 533.624 178.835 606.153C192.302 682.594 231.291 745.887 291.194 795.372C353.328 846.68 424.876 871.813 506.498 866.99C556.076 864.122 611.279 857.489 673.532 804.74C689.23 812.55 705.708 815.681 733.052 818.02C754.111 819.976 774.391 816.976 790.076 813.726C814.674 808.519 812.971 785.726 804.072 781.564C731.995 747.962 747.826 761.638 733.435 750.565C770.06 707.198 825.263 662.139 846.85 516.156C848.553 504.567 847.114 497.273 846.85 487.892C846.718 482.157 848.025 479.95 854.574 479.303C872.623 477.215 890.156 472.273 906.238 463.42C952.938 437.892 971.765 395.965 976.215 345.7C976.875 338.01 976.083 330.069 967.976 326.039Z" pathLength="1"/>
    <clipPath id="dsh-whale-clip"><use href="#dsh-whale-path"/></clipPath>
    <filter id="dsh-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="dsh-glowWide" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <filter id="dsh-soft" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <linearGradient id="dsh-iris-whale" gradientUnits="userSpaceOnUse" x1="170" y1="272" x2="981" y2="871">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.18" stop-color="#9fb4ff"/>
      <stop offset="0.36" stop-color="#f3eaff"/>
      <stop offset="0.52" stop-color="#ffb99a"/>
      <stop offset="0.68" stop-color="#c3a6ff"/>
      <stop offset="0.84" stop-color="#8fd8ff"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="dsh-iris-text" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="620" y2="0">
      <stop offset="0" stop-color="#e9e4f2"/>
      <stop offset="0.2" stop-color="#b8c6ff"/>
      <stop offset="0.4" stop-color="#ffffff"/>
      <stop offset="0.58" stop-color="#f6c2ab"/>
      <stop offset="0.78" stop-color="#cdb8ff"/>
      <stop offset="1" stop-color="#eef3ff"/>
    </linearGradient>
    <radialGradient id="dsh-glass-body" gradientUnits="userSpaceOnUse" cx="560" cy="420" r="620">
      <stop offset="0" stop-color="#2c2030"/>
      <stop offset="0.55" stop-color="#130d15"/>
      <stop offset="1" stop-color="#060407"/>
    </radialGradient>
    <linearGradient id="dsh-streakL" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="640" y2="0">
      <stop offset="0" stop-color="#9fb4ff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#d9ccff" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#ffc7ae" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="dsh-streakR" gradientUnits="userSpaceOnUse" x1="960" y1="0" x2="1600" y2="0">
      <stop offset="0" stop-color="#ffc7ae" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#d9ccff" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#9fb4ff" stop-opacity="0"/>
    </linearGradient>
  </defs>
</svg>`
    this.root.append(this.defsSvg)

    this.whale = div(css.whaleWrap)
    this.whale.innerHTML = `<svg viewBox="170 272 811 599" aria-hidden="true">
  <use href="#dsh-whale-path" class="${css.whaleFill}" />
  <g clip-path="url(#dsh-whale-clip)">
    <use href="#dsh-whale-path" fill="none" stroke="url(#dsh-iris-whale)" class="${css.whaleInner}" vector-effect="non-scaling-stroke" />
  </g>
  <use href="#dsh-whale-path" fill="none" stroke="url(#dsh-iris-whale)" class="${css.whaleGlow}" vector-effect="non-scaling-stroke" />
  <use href="#dsh-whale-path" fill="none" stroke="url(#dsh-iris-whale)" class="${css.whaleRim}" vector-effect="non-scaling-stroke" />
</svg>`

    const scenery = div(css.sceneryWrap)
    scenery.innerHTML = `<svg class="${css.scenery}" overflow="visible" viewBox="0 0 620 136" aria-hidden="true">
  <g transform="translate(310, 136) scale(1.0869) translate(-800, -650)">
    <ellipse cx="800" cy="712" rx="440" ry="2" fill="#d8cce8" class="${css.horizon}" filter="url(#dsh-soft)"/>
    <g class="${css.streaks}" fill="none" stroke-linecap="round">
      <path d="M0 640 C220 650 420 700 640 706" stroke="url(#dsh-streakL)" stroke-width="2" pathLength="1"/>
      <path d="M0 668 C240 672 440 712 660 714" stroke="url(#dsh-streakL)" stroke-width="1.2" pathLength="1"/>
      <path d="M1600 640 C1380 650 1180 700 960 706" stroke="url(#dsh-streakR)" stroke-width="2" pathLength="1"/>
      <path d="M1600 668 C1360 672 1160 712 940 714" stroke="url(#dsh-streakR)" stroke-width="1.2" pathLength="1"/>
    </g>
  </g>
</svg>`

    this.signature = div(css.signature)
    this.signature.append(scenery)

    const signatureCore = div(css.signatureCore)
    signatureCore.innerHTML = signatureSvg(true)
    this.signature.append(signatureCore)

    doc.documentElement.style.setProperty(
      '--dsh-signature-mask', `url("data:image/svg+xml,${encodeURIComponent(signatureSvg())}")`)
    this.card = div(css.card)
    this.wordmark = div(css.wordmark, 'HARNESS')
    this.spinner = div(css.spinner)
    this.spinner.dataset.dshBootSpinner = ''
    this.hint = div(css.hint, 'Loading plugins…')
    this.card.append(this.whale, this.signature, this.wordmark, this.spinner, this.hint)
    this.root.append(this.card)
    doc.body.append(this.root)
    this.root.addEventListener('click', this.skip)
    doc.addEventListener('keydown', this.skip)
    this.updateProgress()
    this.whenShown()
  }
  /**
   * Set the number of loader entries represented by the progress arc.
   * @param total - Complete boot roster size.
   */
  setTotal(total: number): void {
    this.total = total
    this.updateProgress()
  }

  /**
   * Project one loader entry's fiber state.
   * @param id - Loader entry name.
   * @param state - Projected fiber state.
   */
  setState(id: string, state: LoaderEntryState): void {
    this.states.set(id, state)
    if (state === 'active') this.active.add(id)
    this.updateProgress()
    this.render()
  }

  /**
   * Display the boot failure report.
   * @param message - Failure report text.
   */
  fail(message: string): void {
    this.failure = message
    this.render()
  }

  /** Hand the display to the mounted application once the drawing completes. */
  finish(): void {
    if (this.disposed) return
    this.ready = true
    // A window that is never reported as shown must not hold the application back.
    this.later(() => { if (!this.started) this.skip() }, SHOWN_TIMEOUT_MS)
    this.advance()
  }

  /** Detach the page before or after the UI renderer takes the mount point. */
  dispose(): void {
    this.disposed = true
    for (const timer of this.timers) clearTimeout(timer)
    this.timers.clear()
    this.root.ownerDocument.removeEventListener('keydown', this.skip)
    this.root.removeEventListener('click', this.skip)
    this.root.remove()
  }

  /** Start drawing once the document has loaded, is visible, and has painted. */
  private whenShown(): void {
    if (this.disposed) return
    const doc = this.root.ownerDocument
    const retry = (): void => { this.whenShown() }
    if (doc.readyState !== 'complete') {
      doc.defaultView?.addEventListener('load', retry, { once: true })
      return
    }
    if (doc.visibilityState === 'hidden') {
      doc.addEventListener('visibilitychange', retry, { once: true })
      return
    }
    // Hidden windows run no animation frames, so two frames prove a paint.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!this.disposed) this.later(() => { this.draw() }, SETTLE_MS)
    }))
  }

  /** Write the signature, or show it at rest when motion is reduced. */
  private draw(): void {
    if (this.started) return
    this.started = true
    const doc = this.root.ownerDocument
    const setting = doc.body.dataset.dshMotion
    const reduced = typeof doc.defaultView?.matchMedia === 'function'
      && doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.motion = setting === 'off' ? 'off' : setting === 'reduced' || reduced ? 'reduced' : 'full'
    if (this.motion !== 'full') {
      this.markDrawn()
      return
    }
    this.root.dataset.drawing = ''
    this.later(() => { this.markDrawn() }, SIGNATURE_DRAW_MS)
  }

  /** Record that the signature is complete and continue the hand-off. */
  private markDrawn(): void {
    this.drawn = true
    this.root.dataset.drawn = ''
    this.advance()
  }

  /** Leave once the application is ready and the signature is complete. */
  private advance(): void {
    if (!this.ready || !this.drawn || this.leaving || this.failed()) return
    this.leaving = true
    const hold = this.motion === 'full' && this.root.dataset.skipped === undefined ? HOLD_MS : 0
    this.later(() => { this.leave() }, hold)
  }

  /** Sink the signature into the depth mark, fade the overlay, then detach. */
  private leave(): void {
    const target = this.root.ownerDocument.querySelector('[data-dsh-depth-mark]')
    if (this.motion === 'full' && target !== null) {
      const from = this.signature.getBoundingClientRect()
      const to = target.getBoundingClientRect()
      if (from.width > 0 && to.width > 0) {
        const scale = Math.min(to.width / from.width, to.height / from.height)
        const dx = to.left + to.width / 2 - (from.left + from.width / 2)
        const dy = to.top + to.height / 2 - (from.top + from.height / 2)
        this.signature.style.transform = `translate(${String(dx)}px, ${String(dy)}px) scale(${String(scale)})`
      }
    }
    this.root.dataset.leaving = this.motion
    this.later(() => { this.dispose() }, LEAVE_MS[this.motion])
  }

  /** Whether any failure report is on screen. */
  private failed(): boolean {
    return this.failure !== undefined || [...this.states.values()].includes('failed')
  }

  /** Schedule page-owned work that disposal and failure cancel. */
  private later(callback: () => void, ms: number): void {
    // A zero delay continues at once so a skipped or reduced hand-off never waits a turn.
    if (ms === 0) {
      callback()
      return
    }
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      callback()
    }, ms)
    this.timers.add(timer)
  }

  /** Redraw the state-dependent content below the wordmark. */
  private render(): void {
    const failed = [...this.states].filter(([, state]) => state === 'failed').map(([id]) => id)
    if (this.failure === undefined && failed.length === 0) {
      if (this.spinner.parentElement !== this.card) {
        this.card.replaceChildren(this.whale, this.signature, this.wordmark, this.spinner, this.hint)
      }
      return
    }
    // A failure keeps the page: cancel any pending leave and show the report.
    for (const timer of this.timers) clearTimeout(timer)
    this.timers.clear()
    this.leaving = false
    delete this.root.dataset.leaving
    this.root.dataset.failed = ''
    const report = div(css.failed)
    report.append(div(css.failedTitle, 'Failed to load plugins'))
    for (const id of failed) report.append(div(css.failedItem, id))
    if (this.failure !== undefined) report.append(div(css.failedItem, this.failure))
    this.card.replaceChildren(this.wordmark, report)
  }

  /** Grow the rotating arc monotonically as loader entries activate. */
  private updateProgress(): void {
    const ratio = this.total === 0 ? 0 : Math.min(this.active.size / this.total, 1)
    this.spinner.style.setProperty('--dsh-boot-arc', `${String(Math.round(72 + ratio * 216))}deg`)
  }
}
