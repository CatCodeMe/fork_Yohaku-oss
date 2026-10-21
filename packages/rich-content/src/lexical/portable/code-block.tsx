'use client'

import { useEffect, useState } from 'react'

import { CodeShell } from './code-shell'

function useHighlightedHtml(code: string, language?: string): string | null {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setHtml(null)
    import('./code-highlighter')
      .then(({ highlightToHtml }) => {
        if (!cancelled) setHtml(highlightToHtml(code, language))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [code, language])

  return html
}

export function PortableCodeBlock({
  code,
  fold = true,
  language,
}: {
  code: string
  fold?: boolean
  language?: string
}) {
  const html = useHighlightedHtml(code, language)

  return (
    <CodeShell code={code} fold={fold} language={language}>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </CodeShell>
  )
}
