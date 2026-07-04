import { prisma } from '@/lib/db/prisma'
import { simpleEmbed } from '@/lib/utils/embeddings'

export async function uploadKnowledgeDocument(
  title: string,
  content: string,
  source: string,
  category?: string
) {
  const doc = await prisma.knowledgeDocument.create({
    data: {
      title,
      content,
      source,
      category,
      embedding: JSON.stringify(simpleEmbed(content)),
    },
  })
  return doc
}

export async function uploadFromCSV(
  records: { title: string; content: string; source: string; category?: string }[]
) {
  const docs = []
  for (const record of records) {
    const doc = await uploadKnowledgeDocument(
      record.title,
      record.content,
      record.source,
      record.category
    )
    docs.push(doc)
  }
  return docs
}

export async function uploadFromJSON(
  records: { title: string; content: string; source: string; category?: string }[]
) {
  return uploadFromCSV(records)
}

export async function getAllKnowledgeDocuments(category?: string) {
  return prisma.knowledgeDocument.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteKnowledgeDocument(id: string) {
  return prisma.knowledgeDocument.delete({ where: { id } })
}

export async function getPolicies(category?: string) {
  return prisma.policy.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFAQs(category?: string) {
  return prisma.fAQ.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}
