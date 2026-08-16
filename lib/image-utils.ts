/** Resize/compress image for localStorage persistence. */
export async function persistImageFile(
  file: File,
  maxBytes = 400_000,
): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null
  if (file.size <= maxBytes) {
    return readDataUrl(file)
  }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return readDataUrl(file)
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  let quality = 0.85
  let dataUrl = canvas.toDataURL("image/jpeg", quality)
  while (dataUrl.length > maxBytes * 1.37 && quality > 0.4) {
    quality -= 0.1
    dataUrl = canvas.toDataURL("image/jpeg", quality)
  }
  return dataUrl.length <= maxBytes * 1.37 ? dataUrl : null
}

function readDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
