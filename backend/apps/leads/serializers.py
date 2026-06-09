import re

from rest_framework import serializers

from apps.catalog.models import Vacancy

from .models import Lead

# First char a letter, then letters / spaces / apostrophes / hyphens.
# Python re has no \p{L}; [^\W\d_] matches any unicode letter.
NAME_RE = re.compile(r"^[^\W\d_](?:[^\W\d_]|[\s'’-])*$", re.UNICODE)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
TELEGRAM_RE = re.compile(r"^@?[A-Za-z0-9_]{5,32}$")

KIND_VALUES = {"lead", "application"}
# Quiz direction ids — must mirror DIRECTIONS in frontend ContactForm.tsx.
KNOWN_SELECTED = {"smm", "design", "dev", "ads", "unsure"}
MAX_ANSWER_LEN = 500


class LeadListSerializer(serializers.ModelSerializer):
    """Read-only projection for the admin journal (GET /api/leads/journal/)."""

    kind_display = serializers.CharField(source="get_kind_display", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "kind",
            "kind_display",
            "role",
            "name",
            "contact",
            "phone",
            "message",
            "selected",
            "answers",
            "is_sent_to_telegram",
            "created_at",
        ]


class LeadSerializer(serializers.ModelSerializer):
    # Honeypot: not a model field. Bots fill it; humans never see it.
    company = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Lead
        fields = [
            "kind",
            "role",
            "name",
            "contact",
            "phone",
            "message",
            "selected",
            "answers",
            "company",
        ]
        extra_kwargs = {
            "message": {"required": False, "allow_blank": True},
        }

    # --- field-level validation --------------------------------------------
    def validate_kind(self, value):
        if value not in KIND_VALUES:
            raise serializers.ValidationError("kind должен быть lead или application.")
        return value

    def validate_name(self, value):
        value = (value or "").strip()
        if not (2 <= len(value) <= 50):
            raise serializers.ValidationError("Имя должно быть от 2 до 50 символов.")
        if not NAME_RE.match(value):
            raise serializers.ValidationError("Имя содержит недопустимые символы.")
        return value

    def validate_contact(self, value):
        value = (value or "").strip()
        if EMAIL_RE.match(value) or TELEGRAM_RE.match(value):
            return value
        raise serializers.ValidationError(
            "Контакт должен быть email или telegram-ник (@username)."
        )

    def validate_phone(self, value):
        digits = re.sub(r"\D", "", value or "")
        # Drop a leading country code 992.
        if digits.startswith("992"):
            digits = digits[3:]
        if len(digits) != 9:
            raise serializers.ValidationError(
                "Телефон должен содержать 9 цифр (без кода +992)."
            )
        return f"+992{digits}"

    def validate_message(self, value):
        value = (value or "").strip()
        if len(value) > 2000:
            raise serializers.ValidationError("Сообщение слишком длинное (макс. 2000).")
        return value

    def validate_selected(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("selected должен быть непустым списком.")
        unknown = [s for s in value if s not in KNOWN_SELECTED]
        if unknown:
            raise serializers.ValidationError(f"Неизвестные направления: {unknown}.")
        return value

    def validate_answers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("answers должен быть объектом.")
        for v in value.values():
            items = v if isinstance(v, list) else [v]
            for item in items:
                if isinstance(item, str) and len(item) > MAX_ANSWER_LEN:
                    raise serializers.ValidationError("Слишком длинный ответ.")
        return value

    # --- object-level validation -------------------------------------------
    def validate(self, attrs):
        # Honeypot is handled in the view (silent 200) — don't fail here.
        if attrs.get("company"):
            return attrs

        # answers keys must be a subset of selected.
        selected = set(attrs.get("selected", []))
        answers = attrs.get("answers", {})
        extra = set(answers.keys()) - selected
        if extra:
            raise serializers.ValidationError(
                {"answers": f"Ключи не входят в selected: {sorted(extra)}."}
            )

        # application requires an existing vacancy slug.
        if attrs.get("kind") == "application":
            role = attrs.get("role")
            if not role:
                raise serializers.ValidationError(
                    {"role": "role обязателен для отклика на вакансию."}
                )
            if not Vacancy.objects.filter(slug=role).exists():
                raise serializers.ValidationError(
                    {"role": f"Вакансия '{role}' не найдена."}
                )
        return attrs

    def create(self, validated_data):
        validated_data.pop("company", None)
        return Lead.objects.create(**validated_data)
