"""
NotificationService — mock SMS / WhatsApp notifications.

In production this would integrate with Twilio, MSG91, etc.
For the MVP we print formatted messages to the console and keep an
in-memory ring buffer the frontend can poll.
"""

from __future__ import annotations

import threading
from collections import deque
from datetime import datetime, timezone
from typing import Optional


# Thread-safe ring buffer for recent notifications (max 200)
_lock = threading.Lock()
_recent: deque[dict] = deque(maxlen=200)


class NotificationService:
    """Static helper — no instances needed."""

    # ── public API ──────────────────────────────────────────────

    @staticmethod
    def send_sms(
        to_name: str,
        alert_id: str,
        zone_name: str,
        message: str,
    ) -> dict:
        """Simulate an SMS send."""
        entry = NotificationService._build(
            channel="SMS",
            to=to_name,
            alert_id=alert_id,
            zone_name=zone_name,
            message=message,
        )
        print(f'[SMS SENT] To: {to_name} | Alert #{alert_id[:8]} in Zone: {zone_name} | "{message}"')
        return entry

    @staticmethod
    def send_whatsapp(
        to_name: str,
        message: str,
        alert_id: Optional[str] = None,
        zone_name: Optional[str] = None,
    ) -> dict:
        """Simulate a WhatsApp send."""
        entry = NotificationService._build(
            channel="WHATSAPP",
            to=to_name,
            alert_id=alert_id or "",
            zone_name=zone_name or "",
            message=message,
        )
        print(f'[WHATSAPP SENT] To: {to_name} | "{message}"')
        return entry

    @staticmethod
    def get_recent(limit: int = 50) -> list[dict]:
        """Return the most recent notifications (newest first)."""
        with _lock:
            items = list(_recent)
        items.reverse()
        return items[:limit]

    # ── internal ────────────────────────────────────────────────

    @staticmethod
    def _build(
        channel: str,
        to: str,
        alert_id: str,
        zone_name: str,
        message: str,
    ) -> dict:
        entry = {
            "channel": channel,
            "to": to,
            "alert_id": alert_id,
            "zone_name": zone_name,
            "message": message,
            "sent_at": datetime.now(timezone.utc).isoformat(),
        }
        with _lock:
            _recent.append(entry)
        return entry
