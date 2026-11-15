import type { ReactNode } from 'react'
import type { DeskDocument } from '../engine/desk'
import { findCountry, purposes, rules } from '../engine/rules'
import type { LocalizedText, Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import Avatar from './Avatar'
import Flag from './Flag'

const f = rules.ui.game.fields

/** Header strip colour + icon per document type. Fictional designs, not real ID layouts. */
const STYLE: Record<string, { strip: string; icon: string }> = {
  passport: { strip: '#1e3a8a', icon: '🛂' },
  tdac: { strip: '#0284c7', icon: '📱' },
  return_ticket: { strip: '#7c3aed', icon: '🎫' },
  tourist_visa: { strip: '#ea580c', icon: '🏖️' },
  student_visa: { strip: '#4f46e5', icon: '🎓' },
  work_visa: { strip: '#475569', icon: '💼' },
  yellow_fever_cert: { strip: '#ca8a04', icon: '💉' },
  school_letter: { strip: '#9a3412', icon: '🏫' },
}

function Field({ label, value, wrap = false }: { label: LocalizedText; value: ReactNode; wrap?: boolean }) {
  const { t } = useText()
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium text-muted">{t(label)}</div>
      <div className={`${wrap ? 'break-words' : 'truncate'} text-xl leading-tight font-semibold text-ink`}>{value}</div>
    </div>
  )
}

function useCountryName() {
  const { t } = useText()
  return (code: string | null) => {
    if (!code) return t(f.none)
    const c = findCountry(code)
    return c ? (
      <span className="inline-flex items-center gap-1.5">
        <Flag code={c.code} className="h-4" />
        {t(c)}
      </span>
    ) : (
      code
    )
  }
}

function Fields({ traveller, doc }: { traveller: Traveller; doc: DeskDocument }) {
  const { t, date } = useText()
  const country = useCountryName()
  const d = traveller.documents

  switch (doc.slot) {
    case 'passport': {
      const p = d.passport
      return (
        <div className="flex gap-4">
          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-canvas">
            <Avatar seed={traveller.avatarSeed} purpose={traveller.purpose} className="-mt-1 h-44 w-auto -translate-x-3" />
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-2">
            <div className="col-span-2">
              <Field label={f.name} value={p.name} />
            </div>
            <Field label={f.nationality} value={country(p.nationality)} />
            <Field label={f.passportNo} value={<span className="font-mono">{p.number}</span>} />
            <Field label={f.dateOfBirth} value={date(p.dateOfBirth)} />
            <Field label={f.expiry} value={date(p.expiry)} />
          </div>
        </div>
      )
    }
    case 'tdac': {
      const x = d.tdac!
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="col-span-2">
            <Field label={f.name} value={x.name} />
          </div>
          <Field label={f.nationality} value={country(x.nationality)} />
          <Field label={f.arrivalDate} value={date(x.arrivalDate)} />
          <Field label={f.purpose} value={t(purposes[x.purpose])} />
          <Field label={f.stayDays} value={t(f.days, { days: x.stayDays })} />
          <Field label={f.flightFrom} value={country(x.flightFrom)} />
          <Field label={f.transit} value={country(x.transit)} />
        </div>
      )
    }
    case 'return_ticket': {
      const x = d.return_ticket!
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="col-span-2">
            <Field label={f.name} value={x.name} />
          </div>
          <Field label={f.departureDate} value={date(x.departureDate)} />
          <Field label={f.destination} value={<>✈ {country(x.destination)}</>} />
        </div>
      )
    }
    case 'visa': {
      const x = d.visa!
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="col-span-2">
            <Field label={f.name} value={x.name} />
          </div>
          <Field label={f.visaType} value={t(rules.documents[x.type])} />
          <Field label={f.validUntil} value={date(x.validUntil)} />
        </div>
      )
    }
    case 'school_letter': {
      const x = d.school_letter!
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="col-span-2">
            <Field label={f.university} value={x.university} wrap />
          </div>
          <div className="col-span-2">
            <Field label={f.name} value={x.name} />
          </div>
          <Field label={f.startDate} value={date(x.startDate)} />
        </div>
      )
    }
    case 'yellow_fever_cert': {
      const x = d.yellow_fever_cert!
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="col-span-2">
            <Field label={f.name} value={x.name} />
          </div>
          <Field label={f.vaccinationDate} value={date(x.vaccinationDate)} />
        </div>
      )
    }
  }
}

/** Full-size document as a clean ID card, used in the zoom view and under the stamp. */
export default function DocumentCard({ traveller, doc, children }: { traveller: Traveller; doc: DeskDocument; children?: ReactNode }) {
  const { t } = useText()
  const style = STYLE[doc.docId]
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-lift">
      <div className="flex items-center gap-2 px-5 py-3 text-lg font-bold text-white" style={{ background: style.strip }}>
        <span className="text-2xl">{style.icon}</span>
        {t(rules.documents[doc.docId])}
      </div>
      <div className="p-5">
        <Fields traveller={traveller} doc={doc} />
      </div>
      {children}
    </div>
  )
}

/** Small ID card on the desk. */
export function DocumentThumb({ traveller, doc, hint }: { traveller: Traveller; doc: DeskDocument; hint?: string }) {
  const { t } = useText()
  const style = STYLE[doc.docId]
  const name = doc.slot === 'passport' ? traveller.documents.passport.name : traveller.documents[doc.slot]?.name
  return (
    <div className="relative h-full w-full">
      {/* "Tap me" hint floats above the card so it never squeezes the card content */}
      {hint && (
        <span className="absolute -top-3 left-2 z-10 rounded-full bg-brand px-2.5 py-0.5 text-[11px] leading-snug font-semibold whitespace-nowrap text-white shadow-soft">
          👆 {hint}
        </span>
      )}
      <div className={`flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-soft ${hint ? 'animate-hint-glow' : ''}`}>
        <div className="flex min-h-11 items-center gap-1.5 px-2.5 py-1.5 text-[11px] leading-tight font-bold text-white" style={{ background: style.strip }}>
          <span className="shrink-0 text-base">{style.icon}</span>
          <span>{t(rules.documents[doc.docId])}</span>
        </div>
        <div className="flex flex-1 items-end px-3 pb-2.5">
          <span className="text-sm leading-tight font-semibold break-words text-ink">{name}</span>
        </div>
      </div>
    </div>
  )
}
