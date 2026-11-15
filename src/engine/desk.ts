// Which documents are on the officer's desk. Driven by documents[*].alwaysOnDesk
// and questions[*].reveals in game-rules.json.
import { getQuestion, rules } from './rules.ts'
import type { DocumentId, QuestionId, Traveller, TravellerDocuments } from './types.ts'

export type DeskSlot = keyof TravellerDocuments

export interface DeskDocument {
  slot: DeskSlot
  /** Document type shown on the card (for the visa slot, the visa actually held). */
  docId: DocumentId
}

function slotFor(key: string, t: Traveller): DeskSlot | null {
  return key in t.documents ? (key as DeskSlot) : null
}

function docIdFor(slot: DeskSlot, t: Traveller): DocumentId | null {
  if (slot === 'visa') return t.documents.visa?.type ?? null
  return t.documents[slot] ? (slot as DocumentId) : null
}

/** Documents visible on the desk: always-on-desk ones, then those revealed by asked questions (in asking order). */
export function deskDocuments(t: Traveller, askedQuestionIds: readonly QuestionId[]): DeskDocument[] {
  const out: DeskDocument[] = []
  const add = (slot: DeskSlot | null) => {
    if (!slot || out.some((d) => d.slot === slot)) return
    const docId = docIdFor(slot, t)
    if (docId) out.push({ slot, docId })
  }

  for (const [id, doc] of Object.entries(rules.documents)) if (doc.alwaysOnDesk) add(slotFor(id, t))
  for (const qid of askedQuestionIds) add(slotFor(getQuestion(qid).reveals, t))
  return out
}
