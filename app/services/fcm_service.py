import httpx
import google.auth
import google.auth.transport.requests
from app.core.config import settings

FCM_URL = f"https://fcm.googleapis.com/v1/projects/{settings.PROJECT_ID}/messages:send"


def get_access_token() -> str:
    """Get a short-lived OAuth2 token for FCM v1 API."""
    credentials, _ = google.auth.default(
        scopes=["https://www.googleapis.com/auth/firebase.messaging"]
    )
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token


def send_checkin_notification(fcm_token: str, title: str, body: str) -> dict:
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
    with httpx.Client() as client:
        response = client.post(FCM_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
