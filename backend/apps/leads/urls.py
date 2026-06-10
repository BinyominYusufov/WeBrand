from django.urls import path

from .views import LeadCreateView, LeadDetailView, LeadJournalView

urlpatterns = [
    path("leads/", LeadCreateView.as_view(), name="lead-create"),
    path("leads/journal/", LeadJournalView.as_view(), name="lead-journal"),
    path("leads/journal/<int:pk>/", LeadDetailView.as_view(), name="lead-detail"),
]
