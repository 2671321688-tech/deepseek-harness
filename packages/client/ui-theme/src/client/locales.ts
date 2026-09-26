/** `settings.theme` namespace dictionaries (the Appearance and font-size rows' copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'motion.title': '动效',
  'motion.description': '减弱只保留淡入淡出；系统开启减少动态效果时也会减弱',
  'motion.full': '完整',
  'motion.reduced': '减弱',
  'motion.off': '关闭',
  'motion.error': '设置未能保存，请重试',
  'sounds.title': '界面音效',
  'sounds.description': '切换模型时播放轻微的刻度声',
  'appearance.title': '外观',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'fontSize.title': '字号大小',
  'fontSize.description': '仅影响会话内容的字号',
  'fontSize.unit': 'px',
  'fontSize.increase': '增大字号',
  'fontSize.decrease': '减小字号',
} satisfies Record<string, string>

/** The settings.theme namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'motion.title': 'Motion',
  'motion.description': 'Reduced keeps fades only and respects system reduced motion.',
  'motion.full': 'Full',
  'motion.reduced': 'Reduced',
  'motion.off': 'Off',
  'motion.error': 'Could not save settings. Try again.',
  'sounds.title': 'Interface sounds',
  'sounds.description': 'Play a quiet tick when switching models.',
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'fontSize.title': 'Font size',
  'fontSize.description': 'Only affects conversation content',
  'fontSize.unit': 'px',
  'fontSize.increase': 'Increase font size',
  'fontSize.decrease': 'Decrease font size',
} satisfies Record<ThemeKey, string>
