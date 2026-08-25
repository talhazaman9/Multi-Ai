from fastapi import APIRouter
from schemas import ImageGenRequest
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/image", tags=["Image Generation"])

@router.post("/generate")
async def generate_image(req: ImageGenRequest):
    return gemini_service.generate_image(prompt=req.prompt, aspect_ratio=req.aspect_ratio or "1:1")
