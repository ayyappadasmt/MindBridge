from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import pathway, safety_plan, notifications, insights

app = FastAPI(
    title="MindBridge Backend API",
    description="Privacy-first distress triage and community support platform.",
    version="1.0.0",
)

# Allow Member 3's frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(pathway.router)
app.include_router(safety_plan.router)
app.include_router(notifications.router)
app.include_router(insights.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MindBridge Backend"}
