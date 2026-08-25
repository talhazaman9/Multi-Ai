import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from schemas import VideoGenRequest
from services.gemini_service import gemini_service
from config import settings

router = APIRouter(prefix="/api/video", tags=["Video Generation"])

@router.post("/generate")
async def generate_video(req: VideoGenRequest):
    return gemini_service.generate_video(prompt=req.prompt)

@router.get("/file/{filename}")
async def get_video_file(filename: str):
    file_path = os.path.join(settings.UPLOADS_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="video/mp4")
    raise HTTPException(status_code=404, detail="Video file not found")
