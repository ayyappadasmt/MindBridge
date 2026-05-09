from fastapi import APIRouter, HTTPException
from app.models.schemas import NotificationRequest
from app.services.fcm_service import send_checkin_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/checkin")
async def send_checkin(req: NotificationRequest):
    """Send a proactive check-in push notification to a user."""
    try:
        result = send_checkin_notification(
            req.fcm_token, req.message_title, req.message_body
        )
        return {"status": "sent", "fcm_response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notification failed: {str(e)}")
