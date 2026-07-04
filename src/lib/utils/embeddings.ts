export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (normA * normB)
}

export function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/)
  const vocab = new Map<string, number>()
  let idx = 0
  for (const w of words) {
    if (!vocab.has(w)) vocab.set(w, idx++)
  }
  const vec = new Array(100).fill(0)
  for (const w of words) {
    const i = vocab.get(w) ?? 0
    vec[i % 100] += 1
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0))
  return norm > 0 ? vec.map(v => v / norm) : vec
}

export function chunkText(text: string, maxChunkSize = 500): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]
  const chunks: string[] = []
  let current = ''
  for (const s of sentences) {
    if ((current + s).length > maxChunkSize && current) {
      chunks.push(current.trim())
      current = s
    } else {
      current += s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}
