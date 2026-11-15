import type { ReactNode } from 'react'
import type { DeskDocument } from '../engine/desk'
import { findCountry, purposes, rules } from '../engine/rules'
import type { LocalizedText, Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import Avatar from './Avatar'

const f = rules.ui.game.fields

/** Card colours per document type. Fictional designs, not real ID layouts. */
const STYLE: Record<string, { card: string; title: string; icon: string }> = {
  passport: { card: 'bg-[linear-gradient(135deg,#1e2a78,#2b1660)] text-white ring-neon-amber/60', title: 'text-neon-amber', icon: '🛂' },
  tdac: { card: 'bg-[linear-gradient(135deg,#e0fbff,#b8f1ff)] text-slate-900 ring-neon-cyan', title: 'text-cyan-700', icon: '📱' },
  return_ticket: { card: 'bg-white text-slate-900 ring-slate-300', title: 'text-pink-600', icon: '🎫' },
  tourist_visa: { card: 'bg-[linear-gradient(135deg,#dcfce7,#bbf7d0)] text-slate-900 ring-emerald-400', title: 'text-emerald-700', icon: '🏖️' },
  student_visa: { card: 'bg-[linear-gradient(135deg,#ede9fe,#ddd6fe)] text-slate-900 ring-violet-400', title: 'text-violet-700', icon: '🎓' },
  work_visa: { card: 'bg-[linear-gradient(135deg,#ffedd5,#fed7aa)] text-slate-900 ring-orange-400', title: 'text-orange-700', icon: '💼' },
  yellow_fever_cert: { card: 'bg-[linear-gradient(135deg,#fef9c3,#fde047)] text-slate-900 ring-yellow-500', title: 'text-yellow-800', icon: '💉' },
}

function Field({ label, value }: { label: LocalizedText; value: ReactNode }) {
  const { t } = useText()
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold tracking-wider uppercase opacity-60">{t(label)}</div>
      <div className="truncate text-lg leading-tight font-semibold">{value}</div>
    </div>
  )
}

function useCountryName() {
  const { t } = useText()
  return (code: string | null) => {
    if (!code) return t(f.none)
    const c = findCountry(code)
    return c ? `${c.flag} ${t(c)}` : code
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
          <div className="h-28 w-22 shrink-0 overflow-hidden rounded-md bg-slate-200 ring-2 ring-white/40">
            <Avatar seed={traveller.avatarSeed} purpose={traveller.purpose} className="-mt-1 h-40 w-auto -translate-x-3" />
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t-2 border-dashed border-slate-300 pt-2">
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

/** Full-size document, used in the zoom view (and later under the stamp). */
export default function DocumentCard({ traveller, doc, children }: { traveller: Traveller; doc: DeskDocument; children?: ReactNode }) {
  const { t } = useText()
  const style = STYLE[doc.docId]
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl p-5 shadow-2xl ring-2 ${style.card}`}>
      <div className={`mb-3 flex items-center gap-2 text-lg font-extrabold tracking-wide uppercase ${style.title}`}>
        <span className="text-2xl">{style.icon}</span>
        {t(rules.documents[doc.docId])}
      </div>
      <Fields traveller={traveller} doc={doc} />
      {children}
    </div>
  )
}

/** Small card on the desk. */
export function DocumentThumb({ traveller, doc }: { traveller: Traveller; doc: DeskDocument }) {
  const { t } = useText()
  const style = STYLE[doc.docId]
  const name = doc.slot === 'passport' ? traveller.documents.passport.name : traveller.documents[doc.slot]?.name
  return (
    <div className={`flex h-full w-full flex-col justify-between rounded-xl p-3 text-left shadow-lg ring-2 ${style.card}`}>
      <div className={`flex items-center gap-1.5 text-xs font-extrabold leading-tight uppercase ${style.title}`}>
        <span className="text-xl">{style.icon}</span>
        <span className="line-clamp-2">{t(rules.documents[doc.docId])}</span>
      </div>
      <div className="truncate text-sm font-semibold">{name}</div>
    </div>
  )
}
