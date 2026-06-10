from django.core.validators import RegexValidator
from django.db import models

from apps.choices import EXPERIENCE_CHOICES

# lucide-react icon names supported by the ICONS map in Careers.tsx.
# Anything outside this set falls back to Briefcase on the frontend.
ICON_CHOICES = [
    ("Palette", "Palette"),
    ("Megaphone", "Megaphone"),
    ("Handshake", "Handshake"),
    ("Code2", "Code2"),
    ("Target", "Target"),
    ("Clapperboard", "Clapperboard"),
]

# brand-scale tokens understood by the ACCENT_TEXT map on the frontend.
ACCENT_CHOICES = [
    ("brand-500", "brand-500"),
    ("brand-600", "brand-600"),
    ("brand-700", "brand-700"),
]

# Category is a contract with Portfolio.tsx (hard-coded filters).
CATEGORY_CHOICES = [
    ("Разработка", "Разработка"),
    ("SMM", "SMM"),
]

hex_color_validator = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Цвет должен быть в формате HEX, напр. #14B8A6",
)


class Vacancy(models.Model):
    slug = models.SlugField(
        unique=True,
        max_length=60,
        help_text="Стабильный id: designer, smm, frontend …",
    )
    title = models.CharField(max_length=120)
    tagline = models.CharField(max_length=255)
    type = models.CharField(
        max_length=120,
        help_text="Напр. «Полная занятость · Душанбе» (свободный текст)",
    )
    tags = models.JSONField(default=list, blank=True)
    icon = models.CharField(max_length=20, choices=ICON_CHOICES)
    accent = models.CharField(max_length=10, choices=ACCENT_CHOICES)
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    # --- Applicant requirements (all optional; shown to candidates) ---
    experience_required = models.CharField(
        max_length=20, choices=EXPERIENCE_CHOICES, blank=True, default=""
    )
    age_min = models.PositiveSmallIntegerField(null=True, blank=True)
    age_max = models.PositiveSmallIntegerField(null=True, blank=True)
    resume_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Вакансия"
        verbose_name_plural = "Вакансии"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.title} ({self.slug})"


class Project(models.Model):
    legacy_id = models.IntegerField(
        null=True, blank=True, help_text="Прежний числовой id из content.ts"
    )
    name = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=160)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tags = models.JSONField(default=list, blank=True)
    accent = models.CharField(
        max_length=7,
        validators=[hex_color_validator],
        help_text="HEX, напр. #14B8A6",
    )
    logo = models.ImageField(upload_to="logos/", null=True, blank=True)
    url = models.URLField(
        null=True, blank=True, help_text="Внешняя ссылка кейса; пусто → «Кейс скоро»"
    )
    initials = models.CharField(
        max_length=4,
        null=True,
        blank=True,
        help_text="Ручной fallback («IC»); пусто → берётся из name",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Проект"
        verbose_name_plural = "Проекты"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.name} [{self.category}]"
