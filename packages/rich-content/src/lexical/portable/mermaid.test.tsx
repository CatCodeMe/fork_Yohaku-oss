import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type HostCapabilities, HostProvider } from '../../host'
import { Mermaid } from './mermaid'

const mountAsync = vi.hoisted(() =>
  vi.fn(async (element: HTMLElement) => {
    element.innerHTML = '<svg viewBox="0 0 80 40"></svg>'
    return { destroy: vi.fn(), update: vi.fn() }
  }),
)

vi.mock('pele/lazy', () => ({ mountAsync }))

const PNG = 'data:image/png;base64,QQ=='

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

describe('Mermaid (Pele)', () => {
  let mountEl: HTMLDivElement
  let root: Root

  beforeEach(() => {
    mountAsync.mockClear()
    mountEl = document.createElement('div')
    document.body.append(mountEl)
    root = createRoot(mountEl)
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as never
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => PNG)
  })

  afterEach(() => {
    act(() => root.unmount())
    mountEl.remove()
    vi.restoreAllMocks()
  })

  it('zooms in place when the host has no image viewer', async () => {
    await act(async () => {
      root.render(
        <HostProvider host={{ ...host, diagramPreview: 'zoom' }}>
          <Mermaid content="graph TD; A-->B;" />
        </HostProvider>,
      )
    })

    expect(mountAsync).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'graph TD; A-->B;',
      expect.objectContaining({ zoom: 'auto' }),
    )
  })

  it('opens a rasterized png preview in the host viewer', async () => {
    const openImage = vi.fn()
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockResolvedValue()
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
      80,
    )
    vi.spyOn(
      HTMLImageElement.prototype,
      'naturalHeight',
      'get',
    ).mockReturnValue(40)
    await act(async () => {
      root.render(
        <HostProvider host={{ ...host, openImage }}>
          <Mermaid content="graph TD; A-->B;" />
        </HostProvider>,
      )
    })

    expect(mountAsync).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'graph TD; A-->B;',
      expect.objectContaining({ zoom: false }),
    )

    await act(async () => {
      mountEl
        .querySelector('.yohaku-pele svg')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(openImage).toHaveBeenCalledTimes(1)
    const payload = openImage.mock.calls[0]?.[0] as {
      images: string[]
      source?: { currentSrc: string }
      src: string
    }
    expect(payload.src).toBe(PNG)
    expect(payload.images).toEqual([PNG])
    expect(payload.source?.currentSrc).toBe(PNG)
  })
})
