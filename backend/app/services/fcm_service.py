"""
MindBridge — Firebase Cloud Messaging (FCM) Service
Source: Member 1 (uses FCM v1 HTTP API with ADC OAuth2 tokens)

This replaces any legacy Admin SDK messaging calls.
Works with Workload Identity on Cloud Run without any key file.
"""

import httpx
import google.auth
import google.auth.transport.requests
from app.core.config import settings

FCM_URL = f"https://fcm.googleapis.com/v1/projects/{settings.PROJECT_ID}/messages:send"


def get_access_token() -> str:
    """Get a short-lived OAuth2 token for the FCM v1 API via ADC."""
    credentials, _ = google.auth.default(
        scopes=["https://www.googleapis.com/auth/firebase.messaging"]
    )
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token


def send_checkin_notification(fcm_token: str, title: str, body: str) -> dict:
    """
    Send a proactive check-in push notification to a specific device.

    Args:
        fcm_token: Device FCM registration token (from frontend)
        title: Notification title
        body: Notification body text

    Returns:
        FCM API response dict
    """
    token = get_access_token()
    payload = {
        "message": {
            "token": fcm_token,
            "notification": {"title": title, "body": body},
            "data": {"type": "checkin", "source": "mindbridge"},
        }
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=10.0) as client:
        response = client.post(FCM_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
