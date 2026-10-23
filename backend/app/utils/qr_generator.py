"""
QR code generator — produces PNG images for gate check-in and help-point URLs.
"""

from __future__ import annotations

import io
from typing import Optional

import qrcode  # type: ignore
from qrcode.constants import ERROR_CORRECT_M  # type: ignore

from app.config import FRONTEND_URL


def generate_qr_bytes(
    event_id: str,
    zone_name: str,
    help_point: bool = False,
) -> bytes:
    """
    Build a QR code PNG in-memory and return raw bytes.

    Encoded URL examples:
      Gate:       http://localhost:5173/e/{event_id}?zone=gate-1
      Help point: http://localhost:5173/e/{event_id}?zone=restroom-a&helppoint=1
    """
    slug = zone_name.lower().replace(" ", "-")
    url = f"{FRONTEND_URL}/e/{event_id}?zone={slug}"
    if help_point:
        url += "&helppoint=1"

    qr = qrcode.QRCode(
        version=1,
        error_correction=ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()
