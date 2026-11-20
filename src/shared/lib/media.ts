// A Payload upload reduced to what <Image> needs. Null when the upload is missing or not populated.
export type ImageData = { url: string; width: number; height: number; alt: string }

type Upload = { url?: string | null; width?: number | null; height?: number | null; alt?: string | null }

export function toImage(upload: number | Upload | null | undefined): ImageData | null {
  if (!upload || typeof upload === 'number' || !upload.url || !upload.width || !upload.height) return null
  return { url: upload.url, width: upload.width, height: upload.height, alt: upload.alt ?? '' }
}
