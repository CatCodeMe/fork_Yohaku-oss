import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core'
import type { ComponentType } from 'react'
import type { NativeSyntheticEvent, ViewProps } from 'react-native'

export type DuoPosture = {
  angle: number
  divisionMaxX?: number
  divisionMinX?: number
  safeLeft: number
  safeRight: number
  status: 'closed' | 'fullyOpen' | 'none' | 'partiallyOpen' | 'unknown'
  width: number
}

export type DuoBarItem = {
  id: string
  label: string
  menu: { group?: string; id: string; systemImage?: string; title: string }[]
  systemImage: string
}

export const isDuo: boolean =
  requireNativeModule<{ isDuo: boolean }>('YohakuDuoShell').isDuo

export type DuoImageSource = {
  height?: number
  scale: number
  uri: string
  width?: number
}

export const NativeDuoTabs: ComponentType<
  ViewProps & {
    activeTintColor?: string
    inactiveTintColor?: string
    onTabSelect?: (event: NativeSyntheticEvent<{ index: number }>) => void
    selectedIndex: number
  }
> = requireNativeViewManager('YohakuDuoShell', 'DuoTabs')

export const NativeDuoTab: ComponentType<
  ViewProps & {
    icon?: DuoImageSource
    iconRenderingMode?: 'original' | 'template'
    selectedIcon?: DuoImageSource
    selectedSystemImage?: string
    systemImage?: string
    title: string
  }
> = requireNativeViewManager('YohakuDuoShell', 'DuoTab')

export type DuoTransitionEvent = {
  closing: boolean
  key: string
  phase: 'end' | 'start'
}

export const NativeDuoStack: ComponentType<
  ViewProps & {
    onNativePop?: (event: NativeSyntheticEvent<{ count: number }>) => void
    onTransition?: (event: NativeSyntheticEvent<DuoTransitionEvent>) => void
  }
> = requireNativeViewManager('YohakuDuoShell', 'DuoStack')

export const NativeDuoScreen: ComponentType<
  ViewProps & {
    animation?: 'default' | 'fade' | 'none'
    barItems: DuoBarItem[]
    headerShown?: boolean
    onBarItem?: (event: NativeSyntheticEvent<{ id: string }>) => void
    presentation?: 'formSheet' | 'fullScreenModal' | 'modal' | 'push'
    routeKey: string
    sheetDetents?: number[]
    sheetGrabberVisible?: boolean
    sheetLargestUndimmedDetentIndex?: number
    title: string
    titleHidden?: boolean
  }
> = requireNativeViewManager('YohakuDuoShell', 'DuoScreen')

export const NativeDuoReadable: ComponentType<
  ViewProps & {
    columnMaxWidth: number
    onPosture?: (event: NativeSyntheticEvent<DuoPosture>) => void
    startAngle?: number
  }
> = requireNativeViewManager('YohakuDuoShell', 'DuoReadable')

export const NativeDuoColumn: ComponentType<ViewProps> =
  requireNativeViewManager('YohakuDuoShell', 'DuoColumn')
