from fastapi import APIRouter, HTTPException
from app.models.schemas import SafetyPlanItem, SafetyPlanResponse
from app.services import firestore_service as fs

router = APIRouter(prefix="/safety-plan", tags=["Safety Plan"])


@router.post("/", response_model=SafetyPlanResponse)
async def create_plan(plan: SafetyPlanItem):
    created = fs.create_safety_plan(plan.model_dump())
    return SafetyPlanResponse(**created)


@router.get("/{user_id}", response_model=SafetyPlanResponse)
async def get_plan(user_id: str):
    plan = fs.get_safety_plan(user_id)
    if not plan:
        raise HTTPException(
            status_code=404, detail="No safety plan found for this user"
        )
    return SafetyPlanResponse(**plan)


@router.put("/{plan_id}", response_model=dict)
async def update_plan(plan_id: str, updates: dict):
    return fs.update_safety_plan(plan_id, updates)


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str):
    fs.delete_safety_plan(plan_id)
    return {"message": "Safety plan deleted successfully"}
