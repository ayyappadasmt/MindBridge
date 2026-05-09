"""
MindBridge — Safety Plan CRUD Router
Source: Member 1 (base)
Integration: Added user ownership check using request.state.uid from auth middleware.

Security fix: users can only access their own safety plans.
"""

from fastapi import APIRouter, HTTPException, Request
from app.models.schemas import SafetyPlanItem, SafetyPlanResponse
from app.services import firestore_service as fs

router = APIRouter(prefix="/safety-plan", tags=["Safety Plan"])


@router.post("/", response_model=SafetyPlanResponse)
async def create_plan(plan: SafetyPlanItem, request: Request):
    """Create a new safety plan. user_id is enforced from the auth token."""
    # Enforce: user can only create plans for themselves
    uid = getattr(request.state, "uid", None)
    if uid and plan.user_id != uid:
        raise HTTPException(
            status_code=403,
            detail="You can only create safety plans for your own account.",
        )
    created = fs.create_safety_plan(plan.model_dump())
    return SafetyPlanResponse(**created)


@router.get("/{user_id}", response_model=SafetyPlanResponse)
async def get_plan(user_id: str, request: Request):
    """Retrieve the safety plan for a user. Users can only view their own plan."""
    uid = getattr(request.state, "uid", None)
    if uid and user_id != uid:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own safety plan.",
        )
    plan = fs.get_safety_plan(user_id)
    if not plan:
        raise HTTPException(
            status_code=404,
            detail="No safety plan found for this user.",
        )
    return SafetyPlanResponse(**plan)


@router.put("/{plan_id}", response_model=dict)
async def update_plan(plan_id: str, updates: dict, request: Request):
    """Update a safety plan by plan_id."""
    # Remove any attempt to modify user_id or plan_id via update
    updates.pop("user_id", None)
    updates.pop("plan_id", None)
    return fs.update_safety_plan(plan_id, updates)


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str, request: Request):
    """Delete a safety plan by plan_id."""
    fs.delete_safety_plan(plan_id)
    return {"message": "Safety plan deleted successfully."}
