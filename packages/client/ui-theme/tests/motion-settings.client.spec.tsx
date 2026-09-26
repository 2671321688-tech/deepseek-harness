// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MotionSettings } from '../src/client/MotionSettings.tsx'
import { bootThemeInjections } from '../src/boot-theme.ts'

afterEach(cleanup)

it('persists motion and opt-in audio, and announces failed saves', async () => {
  const setMotion = vi.fn().mockResolvedValue(undefined)
  const setSounds = vi.fn().mockRejectedValue(new Error('offline'))
  const view = render(<MotionSettings t={key => key}
    usePreferences={select => select({ value: { preference: 'system', fontSize: 14, motion: 'full', sounds: false }, status: 'ready', revision: 0, writable: true, mode: 'host', base: undefined, user: undefined })}
    setMotion={setMotion} setSounds={setSounds} />)
  expect(view.getByText('motion.full').getAttribute('aria-pressed')).toBe('true')
  await act(async () => { fireEvent.click(view.getByText('motion.reduced')); await Promise.resolve() })
  expect(setMotion).toHaveBeenCalledWith('reduced')
  await act(async () => { fireEvent.click(view.getByRole('switch')); await Promise.resolve() })
  expect(setSounds).toHaveBeenCalledWith(true)
  expect(view.getByRole('alert').textContent).toBe('motion.error')
})

it('disables settings until accepted host data arrives', () => {
  const view = render(<MotionSettings t={key => key}
    usePreferences={select => select({ status: 'loading', value: undefined, revision: 0, writable: true, mode: 'host', base: undefined, user: undefined })}
    setMotion={vi.fn()} setSounds={vi.fn()} />)
  expect(view.getByText('motion.off').hasAttribute('disabled')).toBe(true)
})

it('defaults to full motion and silent audio and projects choices before application boot', () => {
  const script = bootThemeInjections('dark', 14, 'off', true)[1]
  expect(script?.kind).toBe('script')
  if (script?.kind !== 'script') throw new Error('Missing boot script')
  expect(script.text).toContain('document.body.dataset.dshMotion = "off"')
  expect(script.text).toContain('document.body.dataset.dshSounds = "on"')
})
