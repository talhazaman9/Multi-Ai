from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/image-analysis", tags=["Image Analysis"])

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    prompt: str = Form("Analyze this image in detail and describe what you see, including objects, facial expressions, and hands if present.")
):
    contents = await file.read()
    mime_type = file.content_type or "image/jpeg"
    analysis = gemini_service.analyze_image(image_bytes=contents, mime_type=mime_type, prompt=prompt)
    return {"analysis": analysis, "filename": file.filename}
