from fastapi import APIRouter
from app.services.vertex_service import get_text_embedding

router = APIRouter(prefix="/vertex")


@router.get("/embedding")
def embedding(text: str):

    vector = get_text_embedding(text)

    return {"dimensions": len(vector), "sample": vector[:5]}
