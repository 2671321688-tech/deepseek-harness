/** Host-backed animation and sound preferences, including live document projection. */
import { useState } from 'react'
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ThemeSettings } from '../theme-settings.ts'
import css from './MotionSettings.module.css'

/** Shared accepted settings and serialized write operations. */
export interface MotionSettingsInjected {
  hooks: { preferences: ConfigForm<ThemeSettings> }
  setMotion(value: ThemeSettings['motion']): Promise<void>
  setSounds(value: boolean): Promise<void>
}

/** Render animation choices and the opt-in sound switch.
 * @param props - Framework settings hooks, writers and translated labels.
 * @returns Two settings rows with save-failure feedback.
 */
export function MotionSettings({ usePreferences, setMotion, setSounds, t }:
  InjectFace<MotionSettingsInjected> & PropsLocale<'settings.theme'>) {
  const value = usePreferences(snapshot => snapshot.value)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const save = (operation: Promise<void>): void => {
    setBusy(true)
    setFailed(false)
    void operation.catch(() => { setFailed(true) }).finally(() => { setBusy(false) })
  }
  return <div className={css.group}>
    <div className={css.row}>
      <div><div className={css.title}>{t('motion.title')}</div><p>{t('motion.description')}</p></div>
      <div className={css.choices}>
        {(['full', 'reduced', 'off'] as const).map(motion => <button type="button" key={motion}
          disabled={busy || value === undefined} aria-pressed={value?.motion === motion}
          onClick={() => { save(setMotion(motion)) }}>{t(`motion.${motion}`)}</button>)}
      </div>
    </div>
    <div className={css.row}>
      <div><div className={css.title}>{t('sounds.title')}</div><p>{t('sounds.description')}</p></div>
      <Switch checked={value?.sounds === true} disabled={busy || value === undefined}
        label={t('sounds.title')} onChange={(next) => { save(setSounds(next)) }} />
    </div>
    {failed && <div role="alert">{t('motion.error')}</div>}
  </div>
}
