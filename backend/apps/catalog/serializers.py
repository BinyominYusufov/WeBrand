from rest_framework import serializers

from .models import Project, Vacancy


class VacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = [
            "slug",
            "title",
            "tagline",
            "type",
            "tags",
            "icon",
            "accent",
            "sort_order",
            "is_published",
            "experience_required",
            "age_min",
            "age_max",
            "resume_required",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    # Writable on input (multipart file upload); rewritten to an absolute URL
    # on output via to_representation below.
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "legacy_id",
            "name",
            "subtitle",
            "description",
            "category",
            "tags",
            "accent",
            "logo",
            "url",
            "initials",
            "sort_order",
            "is_published",
        ]

    def to_representation(self, instance):
        """Serialize logo back as an absolute URL so the frontend gets a ready link."""
        rep = super().to_representation(instance)
        if instance.logo:
            request = self.context.get("request")
            url = instance.logo.url
            rep["logo"] = request.build_absolute_uri(url) if request else url
        else:
            rep["logo"] = None
        return rep
