"""
MindBridge — Notifications Router
Source: Member 1 (base)
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import NotificationRequest
from app.services.fcm_service import send_checkin_notification
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/checkin")
async def send_checkin(req: NotificationRequest):
    """
    Send a proactive check-in push notification to a user's device.
    The FCM device token must be provided by the frontend.
    """
    try:
        result = send_checkin_notification(
            req.fcm_token, req.message_title, req.message_body
        )
        return {"status": "sent", "fcm_response": result}
    except Exception as e:
        logger.error("FCM notification failed: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Notification delivery failed: {str(e)}",
        )
