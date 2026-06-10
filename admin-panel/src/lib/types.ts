// Shapes mirror the Django API serializers.

export type Vacancy = {
  slug: string
  title: string
  tagline: string
  type: string
  tags: string[]
  icon: string
  accent: string
  sort_order: number
  is_published: boolean
  // Applicant requirements (all optional)
  experience_required: string
  age_min: number | null
  age_max: number | null
  resume_required: boolean
}

export type Project = {
  id: number
  legacy_id: number | null
  name: string
  subtitle: string
  description: string
  category: 'Разработка' | 'SMM'
  tags: string[]
  accent: string
  logo: string | null
  url: string | null
  initials: string | null
  sort_order: number
  is_published: boolean
}

export type Lead = {
  id: number
  kind: 'lead' | 'application'
  kind_display: string
  role: string | null
  name: string
  contact: string
  phone: string
  message: string
  // Applicant fields (only kind=application populates them)
  experience: string
  age: number | null
  resume: string | null // absolute URL or null
  selected: string[]
  answers: Record<string, unknown>
  is_sent_to_telegram: boolean
  created_at: string
}
