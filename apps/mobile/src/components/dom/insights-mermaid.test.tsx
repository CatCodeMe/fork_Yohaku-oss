import { type HostCapabilities, HostProvider } from '@yohaku/rich-content/host'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InsightsPre } from './insights-code'

const mountAsync = vi.hoisted(() =>
  vi.fn(async (element: HTMLElement, text: string) => {
    if (text === 'not mermaid') throw new Error('bad fence')
    element.innerHTML = `<svg viewBox="0 0 80 40"><text>${text}</text></svg>`
    return { destroy: vi.fn(), update: vi.fn() }
  }),
)

vi.mock('pele/lazy', () => ({ mountAsync }))

const host: HostCapabilities = {
  apiBase: 'https://example.com/api',
  diagramPreview: 'openImage',
  fetchJSON: async () => ({}) as never,
  labels: {
    nestedDocCollapse: '收起',
    nestedDocExpand: '展开',
    nestedDocLabel: '嵌套文档',
  },
  nestedDocPresentation: 'inline',
  openImage: () => {},
  openLink: () => {},
  scrollToAnchor: () => {},
  theme: 'light',
  webOrigin: 'https://example.com',
}

const mermaidFence = (text: string) => (
  <InsightsPre>
    <code className="language-mermaid">{text}</code>
  </InsightsPre>
)

describe('InsightsPre mermaid fences (Pele)', () => {
  let mountEl: HTMLDivElement
  let root: Root

  beforeEach(() => {
    mountAsync.mockClear()
    mountEl = document.createElement('div')
    document.body.append(mountEl)
    root = createRoot(mountEl)
  })

  afterEach(() => {
    act(() => root.unmount())
    mountEl.remove()
    vi.restoreAllMocks()
  })

  it('mounts the fence with Pele, without in-place zoom', async () => {
    await act(async () => {
      root.render(
        <HostProvider host={host}>
          {mermaidFence('graph TD; A-->B;')}
        </HostProvider>,
      )
    })

    expect(mountAsync).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'graph TD; A-->B;',
      expect.objectContaining({ zoom: false }),
    )
    expect(
      mountEl.querySelector('.insights-mermaid .yohaku-pele svg'),
    ).not.toBeNull()
    expect(mountEl.querySelector('pre.insights-pre')).toBeNull()
  })

  it('opens a snapshot in the native viewer on tap', async () => {
    const openImage = vi.fn()
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockResolvedValue()
    await act(async () => {
      root.render(
        <HostProvider host={{ ...host, openImage }}>
          {mermaidFence('graph TD; A-->B;')}
        </HostProvider>,
      )
    })

    await act(async () => {
      mountEl
        .querySelector('.yohaku-pele svg')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(openImage).toHaveBeenCalledTimes(1)
    const payload = openImage.mock.calls[0]?.[0] as {
      images: string[]
      src: string
    }
    expect(payload.src).toMatch(/^data:image\//)
    expect(payload.images).toEqual([payload.src])
  })

  it('shows the Pele error and the source text', async () => {
    await act(async () => {
      root.render(
        <HostProvider host={host}>{mermaidFence('not mermaid')}</HostProvider>,
      )
    })

    expect(mountEl.querySelector('[role="alert"]')?.textContent).toContain(
      'bad fence',
    )
    expect(mountEl.textContent).toContain('not mermaid')
  })

  it('keeps a plain pre for non-mermaid fences', async () => {
    await act(async () => {
      root.render(
        <HostProvider host={host}>
          <InsightsPre>
            <code className="language-ts">{'const x = 1'}</code>
          </InsightsPre>
        </HostProvider>,
      )
    })

    expect(mountEl.querySelector('pre.insights-pre')).not.toBeNull()
    expect(mountAsync).not.toHaveBeenCalled()
  })
})
