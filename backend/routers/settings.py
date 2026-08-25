from fastapi import APIRouter
from pydantic import BaseModel
from config import settings
import os

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    gemini_api_key: str

@router.get("")
async def get_settings():
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    # Mask API key for security
    masked = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else ("Configured" if api_key else "Not Configured")
    return {
        "has_api_key": bool(api_key),
        "masked_key": masked
    }

@router.post("")
async def update_settings(update: SettingsUpdate):
    settings.GEMINI_API_KEY = update.gemini_api_key
    os.environ["GEMINI_API_KEY"] = update.gemini_api_key
    return {"success": True, "message": "API key updated successfully"}
