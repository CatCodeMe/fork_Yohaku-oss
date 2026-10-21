import {
  isDuo,
  NativeDuoColumn,
  NativeDuoReadable,
} from '@modules/yohaku/duo-shell'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'

import { usePalette } from '@/theme/palette'

export function DuoReadable({
  children,
  maxWidth,
}: {
  children: ReactNode
  maxWidth: number
}) {
  const palette = usePalette()
  return (
    <NativeDuoReadable
      columnMaxWidth={maxWidth}
      style={[styles.fill, { backgroundColor: palette.surface.desk }]}
    >
      <NativeDuoColumn style={styles.column}>{children}</NativeDuoColumn>
    </NativeDuoReadable>
  )
}

export function DuoReadableFrame({
  children,
  maxWidth,
}: {
  children: ReactNode
  maxWidth: number
}) {
  return isDuo ? (
    <DuoReadable maxWidth={maxWidth}>{children}</DuoReadable>
  ) : (
    children
  )
}

const DUO_ARTICLE_MAX_WIDTH = 600

export const duoArticleColumn = isDuo
  ? StyleSheet.create({
      column: {
        alignSelf: 'center',
        maxWidth: DUO_ARTICLE_MAX_WIDTH,
        width: '100%',
      },
    }).column
  : null

const styles = StyleSheet.create({
  column: { bottom: 0, left: 0, position: 'absolute', top: 0, width: '100%' },
  fill: { flex: 1 },
})
