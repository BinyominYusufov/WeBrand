import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  DollarSign,
  Eye,
  GitBranch,
  Handshake,
  Heart,
  Layers,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Palette,
  Phone,
  Search,
  ShoppingBag,
  Stethoscope,
  ThumbsUp,
  Truck,
  User,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { InstagramData } from '../data/content'

const ICONS: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  DollarSign,
  Eye,
  GitBranch,
  Handshake,
  Heart,
  Layers,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Palette,
  Phone,
  Search,
  ShoppingBag,
  Stethoscope,
  ThumbsUp,
  Truck,
  User,
  Users,
  UtensilsCrossed,
}

export default function InstagramPreview({ data }: { data: InstagramData }) {
  return (
    <div className="absolute inset-0 bg-neutral-950 text-white overflow-hidden flex flex-col">
      {/* Subtle gradient glow accent */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: data.accent }}
      />

      {/* Top section: avatar + meta */}
      <div className="relative p-3.5 sm:p-4 flex gap-3 items-start">
        <Avatar data={data} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] sm:text-sm font-semibold truncate">
              {data.username}
            </span>
            <span className="text-neutral-400 text-xs leading-none">···</span>
          </div>

          {data.bioTitle && (
            <div className="text-[10px] sm:text-[11px] font-medium mt-1 text-neutral-100 line-clamp-1">
              {data.bioTitle}
            </div>
          )}

          <div className="flex gap-3 mt-1.5 text-[9px] sm:text-[10px] text-neutral-400 whitespace-nowrap">
            <Stat value={data.posts} label="публ." />
            <Stat value={data.followers} label="подп." />
            <Stat value={data.following} label="подписк." />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="relative px-3.5 sm:px-4 -mt-1 space-y-0.5">
        {data.category && (
          <div className="text-[9px] sm:text-[10px] text-neutral-500">{data.category}</div>
        )}
        {data.bio.slice(0, 2).map((line, i) => (
          <div
            key={i}
            className="text-[9px] sm:text-[10px] text-neutral-300 line-clamp-1 leading-snug"
          >
            {line}
          </div>
        ))}
        {data.link && (
          <div
            className="text-[9px] sm:text-[10px] font-medium pt-0.5"
            style={{ color: '#60A5FA' }}
          >
            🔗 {data.link}
          </div>
        )}
      </div>

      {/* Mock action buttons */}
      <div className="relative px-3.5 sm:px-4 mt-2 flex gap-1.5">
        <div
          className="flex-1 h-5 sm:h-6 rounded-md flex items-center justify-center text-[8px] sm:text-[9px] font-semibold text-white"
          style={{ background: '#3B82F6' }}
        >
          Подписаться
        </div>
        <div className="flex-1 h-5 sm:h-6 rounded-md bg-neutral-800 flex items-center justify-center text-[8px] sm:text-[9px] font-semibold text-white">
          Сообщение
        </div>
      </div>

      {/* Highlights row */}
      <div className="relative mt-auto pt-2 pb-3 px-3 flex gap-2 overflow-hidden">
        {data.highlights.slice(0, 6).map((h, i) => {
          const Icon = ICONS[h.icon] ?? Award
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="flex flex-col items-center shrink-0 min-w-0"
            >
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-neutral-950 flex items-center justify-center shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${data.accent} 0%, ${shade(data.accent, -20)} 100%)`,
                }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[7px] sm:text-[8px] text-neutral-400 mt-1 max-w-[44px] truncate">
                {h.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="leading-tight">
      <span className="font-semibold text-white">{value}</span> {label}
    </div>
  )
}

function Avatar({ data }: { data: InstagramData }) {
  const inner = data.avatar ? (
    <img
      src={data.avatar}
      alt={data.username}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  ) : (
    <div
      className="w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-xl"
      style={{ background: data.avatarBg ?? data.accent }}
    >
      {data.avatarLetter ?? data.username.charAt(0).toUpperCase()}
    </div>
  )

  if (data.ring === 'gradient') {
    return (
      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-[conic-gradient(from_180deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)]">
        <div className="w-full h-full rounded-full p-0.5 bg-neutral-950">
          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
            {inner}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-neutral-900 ring-2 ring-neutral-800">
      {inner}
    </div>
  )
}

// Helper to darken a hex color by N% for gradient shading
function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + (percent * 2.55)))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + (percent * 2.55)))
  const b = Math.max(0, Math.min(255, (num & 0xff) + (percent * 2.55)))
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}
