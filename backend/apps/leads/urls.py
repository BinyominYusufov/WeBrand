from django.urls import path

from .views import LeadCreateView, LeadJournalView

urlpatterns = [
    path("leads/", LeadCreateView.as_view(), name="lead-create"),
    path("leads/journal/", LeadJournalView.as_view(), name="lead-journal"),
]
