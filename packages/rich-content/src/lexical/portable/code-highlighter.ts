import type { Lang } from '@pierre/highlights'
import { codeToHtml, isSupportedLanguage } from '@pierre/highlights'
import githubDark from '@pierre/highlights/themes/github-dark'
import githubLight from '@pierre/highlights/themes/github-light'

const themes = { light: githubLight, dark: githubDark }
const fallbackLanguages: Record<string, Lang> = {
  ini: 'toml',
  properties: 'toml',
}
const decoder = new TextDecoder()

export function resolveLanguage(language: string | undefined): Lang | null {
  if (!language) return null
  const id = language.toLowerCase()
  const lang = fallbackLanguages[id] ?? id
  return isSupportedLanguage(lang) ? lang : null
}

export function highlightToHtml(code: string, language?: string): string {
  return decoder.decode(
    codeToHtml(code, { lang: resolveLanguage(language) ?? 'text', themes }),
  )
}
