import type { Lead, Project, Vacancy } from '../lib/types'
import { apiJson } from './client'

// ---- Vacancies (JSON) ------------------------------------------------------
export const listVacancies = () => apiJson<Vacancy[]>('/api/vacancies/', { auth: true })

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const createVacancy = (data: Partial<Vacancy>) =>
  apiJson<Vacancy>('/api/vacancies/', jsonInit('POST', data))

// Edit via PATCH (partial) so fields omitted by the form — e.g. accent, which is
// no longer edited in the admin — keep their existing stored value.
export const updateVacancy = (slug: string, data: Partial<Vacancy>) =>
  apiJson<Vacancy>(`/api/vacancies/${slug}/`, jsonInit('PATCH', data))

// Lightweight inline change (e.g. publish toggle) via PATCH.
export const patchVacancy = (slug: string, data: Partial<Vacancy>) =>
  apiJson<Vacancy>(`/api/vacancies/${slug}/`, jsonInit('PATCH', data))

export const deleteVacancy = (slug: string) =>
  apiJson<void>(`/api/vacancies/${slug}/`, { method: 'DELETE' })

// ---- Projects (multipart for logo upload) ----------------------------------
export type ProjectInput = {
  name: string
  subtitle: string
  description: string
  category: string
  tags: string[]
  accent: string
  url: string
  initials: string
  sort_order: number
  is_published: boolean
  logo?: File | null
}

function projectFormData(data: ProjectInput): FormData {
  const fd = new FormData()
  fd.append('name', data.name)
  fd.append('subtitle', data.subtitle)
  fd.append('description', data.description)
  fd.append('category', data.category)
  fd.append('accent', data.accent)
  fd.append('url', data.url)
  fd.append('initials', data.initials)
  fd.append('sort_order', String(data.sort_order))
  fd.append('is_published', String(data.is_published))
  fd.append('tags', JSON.stringify(data.tags)) // JSONField accepts a JSON string
  if (data.logo) fd.append('logo', data.logo)
  return fd
}

export const listProjects = () => apiJson<Project[]>('/api/projects/', { auth: true })

export const createProject = (data: ProjectInput) =>
  apiJson<Project>('/api/projects/', { method: 'POST', body: projectFormData(data) })

// PATCH so an unchanged logo is preserved when no new file is attached.
export const updateProject = (id: number, data: ProjectInput) =>
  apiJson<Project>(`/api/projects/${id}/`, { method: 'PATCH', body: projectFormData(data) })

export const patchProject = (id: number, data: Record<string, unknown>) =>
  apiJson<Project>(`/api/projects/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteProject = (id: number) =>
  apiJson<void>(`/api/projects/${id}/`, { method: 'DELETE' })

// ---- Leads journal (read-only) ---------------------------------------------
export const listLeads = () => apiJson<Lead[]>('/api/leads/journal/', { auth: true })

// Single lead, fetched by id for the detail drawer (admin-only).
export const getLead = (id: number) => apiJson<Lead>(`/api/leads/journal/${id}/`, { auth: true })

// Admin-only delete of a single lead (best-effort resume cleanup is server-side).
export const deleteLead = (id: number) =>
  apiJson<void>(`/api/leads/journal/${id}/`, { method: 'DELETE', auth: true })

// ---- Auth ------------------------------------------------------------------
export const login = (username: string, password: string) =>
  apiJson<{ access: string; refresh: string }>('/api/auth/login/', {
    auth: false,
    ...jsonInit('POST', { username, password }),
  })
