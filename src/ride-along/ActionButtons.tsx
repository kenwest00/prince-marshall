import PillButton from '../components/PillButton'
import { rideAlong } from '../data/content'
import { hasPhone, prettyPhone, smsHref, telHref } from './contactLinks'

interface Props {
  /** Show the secondary "Call · Send a note" row. */
  secondary?: boolean
  inverted?: boolean
  className?: string
}

/** The page's one primary action: text Ken. Falls back to the note form until a phone number is set. */
export default function ActionButtons({ secondary = true, inverted = false, className = '' }: Props) {
  const c = rideAlong.cta
  const linkTone = inverted ? 'text-white' : 'text-[#0a0a0a]'

  if (!hasPhone) {
    return (
      <div className={className}>
        <PillButton href="#note" inverted={inverted} className="min-h-[52px] px-8 text-base">
          {c.book}
        </PillButton>
      </div>
    )
  }

  return (
    <div className={className}>
      <PillButton href={smsHref} inverted={inverted} className="min-h-[52px] px-8 text-base">
        {c.text} {prettyPhone}
      </PillButton>
      {secondary && (
        <p className={`type-label mt-4 flex flex-wrap gap-x-3 gap-y-2 ${linkTone}`}>
          <a href={telHref} className="inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
            {c.call} {prettyPhone}
          </a>
          <span aria-hidden="true" className="inline-flex items-center opacity-70">·</span>
          <a href="#note" className="inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
            {c.note}
          </a>
        </p>
      )}
    </div>
  )
}
