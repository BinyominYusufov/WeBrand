import uuid
from pathlib import Path

from django.db import models

from apps.choices import EXPERIENCE_CHOICES

KIND_CHOICES = [
    ("lead", "Заявка с формы"),
    ("application", "Отклик на вакансию"),
]


def resume_upload_path(instance, filename):
    """Store resumes under an unguessable random name.

    The original filename is attacker-controlled and was previously kept
    verbatim, which made stored CVs enumerable/overwritable. We keep only the
    (validated) ``.pdf`` suffix and randomise the stem so files can't be guessed
    or collided. Access is additionally gated by a signed URL (see views.py).
    """
    suffix = Path(filename or "").suffix.lower()
    if suffix != ".pdf":
        suffix = ".pdf"
    return f"resumes/{uuid.uuid4().hex}{suffix}"


class Lead(models.Model):
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default="lead")
    role = models.CharField(
        max_length=60,
        null=True,
        blank=True,
        help_text="slug вакансии, если kind=application",
    )
    name = models.CharField(max_length=50)
    contact = models.CharField(max_length=60, help_text="email или @telegram")
    phone = models.CharField(max_length=20)
    message = models.TextField(
        blank=True, default="", help_text="Необязательное сообщение (отклик на вакансию)"
    )
    # --- Applicant fields (only kind=application uses them) ---
    experience = models.CharField(
        max_length=20, choices=EXPERIENCE_CHOICES, blank=True, default=""
    )
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    resume = models.FileField(upload_to=resume_upload_path, null=True, blank=True)
    selected = models.JSONField(default=list, blank=True)
    answers = models.JSONField(default=dict, blank=True)
    is_sent_to_telegram = models.BooleanField(default=False)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_kind_display()}: {self.name} ({self.created_at:%Y-%m-%d %H:%M})"
