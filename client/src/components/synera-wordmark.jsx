export default function SyneraWordmark({ light = false, className = "" }) {
  const textColor = light ? "text-white" : "text-ink"
  const mutedColor = light ? "text-white/68" : "text-muted-foreground"
  const markTone = light ? "text-white" : "text-brand-700"

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative grid size-12 place-items-center rounded-[1rem] border ${light ? "border-white/20 bg-white/10" : "border-brand-100 bg-brand-50"}`}>
        <svg viewBox="0 0 40 40" className={`size-8 ${markTone}`} aria-hidden="true">
          <rect x="7" y="21" width="5" height="12" rx="2.5" fill="currentColor" opacity="0.36" />
          <rect x="15" y="14" width="5" height="19" rx="2.5" fill="currentColor" opacity="0.58" />
          <rect x="23" y="8" width="5" height="25" rx="2.5" fill="currentColor" />
          <path d="M26 10.5l3.1 3.2 5.9-6.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </svg>
      </div>
      <div className="leading-none">
        <span className={`block font-heading text-[2rem] font-semibold lowercase leading-[0.9] ${textColor}`}>
          synera
        </span>
        <span className={`mt-1 block text-[0.48rem] font-semibold uppercase ${mutedColor}`}>
          Business Admin Dashboard
        </span>
      </div>
    </div>
  )
}
