'use client'

import { PeleDiagram } from '../../diagram/pele-diagram'

/** Lexical Mermaid node, rendered by Pele on every host. */
export const Mermaid = ({ content }: { content: string }) => (
  <PeleDiagram content={content} />
)
