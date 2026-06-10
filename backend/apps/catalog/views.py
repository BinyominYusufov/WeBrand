from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Project, Vacancy
from .serializers import ProjectSerializer, VacancySerializer


class ReadOnlyOrAdmin(BasePermission):
    """Public reads (GET/HEAD/OPTIONS); writes require a staff/superuser.

    Pairs with JWTAuthentication: only a token for an is_staff user may
    create/update/delete. Anonymous and non-staff get 401/403 on writes.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class VacancyViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write.

    Single source of truth for vacancy order: the queryset is ordered by
    ``sort_order`` (then ``slug`` for stable tie-breaks). Admin (drag-and-drop
    reorder, which PATCHes ``sort_order``) and the public site consume this same
    order — neither frontend re-sorts.
    """

    serializer_class = VacancySerializer
    lookup_field = "slug"
    permission_classes = [ReadOnlyOrAdmin]

    def get_queryset(self):
        qs = Vacancy.objects.all().order_by("sort_order", "slug")
        # Anonymous/public visitors only ever see published vacancies; staff
        # (admin panel) see everything so they can manage drafts.
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_published=True)
        return qs


class ProjectViewSet(viewsets.ModelViewSet):
    """Public read; admin-only write. Filterable by ?category=.

    Accepts multipart uploads so the logo can be sent as a file on
    create/update; JSON bodies (no file) still work too.
    """

    serializer_class = ProjectSerializer
    permission_classes = [ReadOnlyOrAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Project.objects.all().order_by("sort_order", "id")
        user = self.request.user
        if not (user and user.is_staff):
            qs = qs.filter(is_published=True)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs
