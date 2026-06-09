from django.db import models

KIND_CHOICES = [
    ("lead", "Заявка с формы"),
    ("application", "Отклик на вакансию"),
]


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
