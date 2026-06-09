import logging

from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Lead
from .serializers import LeadListSerializer, LeadSerializer
from .telegram import send_lead_to_telegram

logger = logging.getLogger(__name__)


class LeadsThrottle(AnonRateThrottle):
    scope = "leads"


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class LeadCreateView(CreateAPIView):
    """POST /api/leads/ — public lead intake. Honeypot + throttle + Telegram."""

    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LeadsThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Honeypot: a filled 'company' field means a bot. Silently accept,
        # but do NOT save or notify.
        if serializer.validated_data.get("company"):
            logger.info("Honeypot tripped from %s — silently dropped.", _client_ip(request))
            return Response({"ok": True}, status=status.HTTP_200_OK)

        lead = serializer.save(ip=_client_ip(request))

        sent = send_lead_to_telegram(lead)
        if sent and not lead.is_sent_to_telegram:
            lead.is_sent_to_telegram = True
            lead.save(update_fields=["is_sent_to_telegram"])

        return Response({"ok": True, "id": lead.id}, status=status.HTTP_201_CREATED)


class LeadJournalView(ListAPIView):
    """GET /api/leads/journal/ — admin-only read journal of all leads.

    Additive read endpoint for the admin panel; does not change the public
    POST intake above. Protected by IsAdminUser (JWT/session staff only).
    """

    serializer_class = LeadListSerializer
    permission_classes = [IsAdminUser]
    queryset = Lead.objects.all().order_by("-created_at")
