"""Telegram Bot API delivery for leads.

Token & chat ids come from env (python-decouple) via settings. If the token is
missing or the API call fails we LOG it but never raise — the Lead is already
saved and the endpoint must still return ok (don't lose the lead).
"""
import html
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

API_URL = "https://api.telegram.org/bot{token}/sendMessage"
TIMEOUT = 10


def _esc(value) -> str:
    return html.escape(str(value if value is not None else ""))


def _role_title(slug) -> str:
    """Human-readable vacancy title for an application; falls back to the slug."""
    if not slug:
        return ""
    # Imported lazily to avoid a hard import cycle at module load.
    from apps.catalog.models import Vacancy

    vac = Vacancy.objects.filter(slug=slug).only("title").first()
    return vac.title if vac else slug


def _build_message(lead) -> str:
    kind_label = "🧩 Отклик на вакансию" if lead.kind == "application" else "📩 Новая заявка"
    lines = [f"<b>{kind_label}</b>"]
    if lead.kind == "application" and lead.role:
        title = _role_title(lead.role)
        lines.append(f"Вакансия: <b>{_esc(title)}</b> ({_esc(lead.role)})")
    lines.append(f"Имя: {_esc(lead.name)}")
    lines.append(f"Контакт: {_esc(lead.contact)}")
    lines.append(f"Телефон: {_esc(lead.phone)}")
    if lead.selected:
        lines.append("Направления: " + _esc(", ".join(lead.selected)))
    if lead.answers:
        lines.append("<b>Ответы:</b>")
        for key, val in lead.answers.items():
            val_str = ", ".join(val) if isinstance(val, list) else str(val)
            lines.append(f"• {_esc(key)}: {_esc(val_str)}")
    if lead.message:
        lines.append(f"<b>Сообщение:</b> {_esc(lead.message)}")
    return "\n".join(lines)


def send_lead_to_telegram(lead) -> bool:
    """Return True on confirmed delivery, False otherwise. Never raises."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set — lead %s saved but not sent.", lead.pk)
        return False

    chat_id = settings.TELEGRAM_CHAT_ID
    if lead.kind == "application" and settings.TELEGRAM_APPLICATIONS_CHAT_ID:
        chat_id = settings.TELEGRAM_APPLICATIONS_CHAT_ID
    if not chat_id:
        logger.warning("No TELEGRAM chat id configured — lead %s saved but not sent.", lead.pk)
        return False

    try:
        resp = requests.post(
            API_URL.format(token=token),
            json={
                "chat_id": chat_id,
                "text": _build_message(lead),
                "parse_mode": "HTML",
                "disable_web_page_preview": True,
            },
            timeout=TIMEOUT,
        )
        if resp.status_code == 200 and resp.json().get("ok"):
            return True
        logger.error("Telegram API error for lead %s: %s %s", lead.pk, resp.status_code, resp.text)
    except requests.RequestException as exc:
        logger.error("Telegram request failed for lead %s: %s", lead.pk, exc)
    return False
