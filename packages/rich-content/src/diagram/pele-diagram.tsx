'use client'

import './pele-diagram.css'

import type { Mounted } from 'pele/lazy'
import { useEffect, useId, useRef, useState } from 'react'

import { imagePreviewSourceFromElement, useHost } from '../host'
import { rasterizeLoadedImageToPng } from '../lib/rasterize-to-png'

/** Theme variables Pele reads; inlined when the SVG leaves the page. */
const PELE_VARS = [
  '--pele-bg',
  '--pele-fg',
  '--pele-muted',
  '--pele-line',
  '--pele-surface',
  '--pele-surface-alt',
  '--pele-border',
  '--pele-accent',
  '--pele-critical',
  '--pele-error',
  '--pele-font',
  '--pele-font-mono',
  '--pele-radius',
  ...Array.from({ length: 8 }, (_, index) => `--pele-series-${index + 1}`),
]

/**
 * Mermaid-syntax diagram rendered by Pele (https://pele.run), shared by web
 * and the mobile WebView. Only the diagram type in use is loaded
 * (`pele/lazy`). Colors come from the `--pele-*` variables in
 * `pele-diagram.css`, mapped onto the design tokens, so a theme switch needs
 * no re-render.
 *
 * Hosts with `diagramPreview: 'openImage'` (mobile) open a PNG snapshot in
 * the native viewer on tap; others get Pele's in-place pan/zoom.
 */
export const PeleDiagram = ({ content }: { content: string }) => {
  const host = useHost()
  const openImage = host.diagramPreview === 'openImage' ? host.openImage : null
  const id = useId().replaceAll(':', '')
  const hostRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef<Mounted | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = hostRef.current
    if (!element) return
    let cancelled = false

    const run = async () => {
      try {
        const pele = await import('pele/lazy')
        if (cancelled) return
        if (mountedRef.current) {
          // Same element, new source: re-render in place.
          mountedRef.current.update(content)
        } else {
          mountedRef.current = await pele.mountAsync(element, content, {
            idPrefix: `pele-${id}-`,
            watch: true,
            zoom: openImage ? false : 'auto',
          })
        }
        if (cancelled) return
        setError(null)
        setReady(true)
      } catch (error_) {
        if (cancelled) return
        setError(error_ instanceof Error ? error_.message : String(error_))
      }
    }
    void run()

    return () => {
      cancelled = true
    }
  }, [content, id, openImage])

  useEffect(
    () => () => {
      mountedRef.current?.destroy()
      mountedRef.current = null
    },
    [],
  )

  useEffect(() => {
    const element = hostRef.current
    if (!element || !openImage) return

    const onClick = async () => {
      const svg = element.querySelector('svg')
      if (!svg) return
      const src = await snapshotSvg(svg, element)
      if (!src) return
      void openImage({
        images: [src],
        index: 0,
        source: imagePreviewSourceFromElement(element, src),
        src,
      })
    }
    element.addEventListener('click', onClick)
    return () => element.removeEventListener('click', onClick)
  }, [openImage])

  return (
    <figure className="yohaku-pele not-prose">
      <div
        aria-busy={!ready && !error}
        className="yohaku-pele-canvas"
        hidden={!!error}
        ref={hostRef}
      />
      {!ready && !error && (
        <div aria-hidden className="yohaku-pele-placeholder" />
      )}
      {error && (
        // Pele quotes the source in its message: show it as text only.
        <div className="yohaku-pele-error" role="alert">
          <pre className="yohaku-pele-error-message">{error}</pre>
          <pre className="yohaku-pele-error-source">{content}</pre>
        </div>
      )}
    </figure>
  )
}

/**
 * PNG (or SVG data URL when the canvas is unavailable) of a rendered
 * diagram. The SVG styles itself from page CSS variables, so their resolved
 * values are inlined on the copy before it is loaded as a standalone image.
 */
async function snapshotSvg(
  svg: SVGSVGElement,
  themed: HTMLElement,
): Promise<string | null> {
  const computed = getComputedStyle(themed)
  const vars = PELE_VARS.map(
    (name) => `${name}:${computed.getPropertyValue(name).trim()}`,
  )
  const box = svg.getBoundingClientRect()
  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copy.setAttribute('width', String(Math.round(box.width * 2)))
  copy.setAttribute('height', String(Math.round(box.height * 2)))
  copy.setAttribute(
    'style',
    [
      copy.getAttribute('style') ?? '',
      ...vars,
      `background:${computed.backgroundColor}`,
    ].join(';'),
  )
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    new XMLSerializer().serializeToString(copy),
  )}`
  const image = new Image()
  image.src = url
  try {
    await image.decode()
  } catch {
    return null
  }
  return rasterizeLoadedImageToPng(image) ?? url
}
