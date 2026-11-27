import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

// Rich text as one line of plain text, for structured data and meta descriptions.
export const toPlainText = (data: SerializedEditorState) =>
  convertLexicalToPlaintext({ data }).replace(/\s+/g, ' ').trim()
