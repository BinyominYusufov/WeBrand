"""Shared vocab contracts used by more than one app.

EXPERIENCE is a small enum collected on applications (Lead.experience) and set as
a requirement on vacancies (Vacancy.experience_required). It is a cross-app
contract: keep it in sync with
  - admin-panel/src/lib/options.ts  (EXPERIENCE_OPTIONS)
  - frontend/src/data/content.ts    (EXPERIENCE_OPTIONS)
"""

# Order matters (least → most experience); values are stored verbatim.
EXPERIENCE_VALUES = [
    "без опыта",
    "до 1 года",
    "1–3 года",
    "3–5 лет",
    "5+ лет",
]

# (value, label) pairs for Django model `choices=`.
EXPERIENCE_CHOICES = [(v, v) for v in EXPERIENCE_VALUES]

# Sane bounds for an applicant's age (also mirrored on the clients).
AGE_MIN = 14
AGE_MAX = 80
