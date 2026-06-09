from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet, VacancyViewSet

router = DefaultRouter()
router.register(r"vacancies", VacancyViewSet, basename="vacancy")
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = router.urls
