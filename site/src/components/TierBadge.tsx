const TIER_CLASS: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-green-500 text-gray-900',
  2: 'bg-yellow-500 text-gray-900',
  3: 'bg-orange-500 text-gray-900',
  4: 'bg-red-500 text-white',
}

interface TierBadgeProps {
  tier: 1 | 2 | 3 | 4
  className?: string
}

export default function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return (
    <span
      className={`inline-block font-mono text-xs font-bold px-1.5 py-0.5 rounded ${TIER_CLASS[tier]} ${className}`}
    >
      T{tier}
    </span>
  )
}
