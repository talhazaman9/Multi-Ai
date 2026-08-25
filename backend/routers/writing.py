from fastapi import APIRouter
from schemas import WritingRequest
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/writing", tags=["AI Writing"])

PROMPT_TEMPLATES = {
    "essay": "Write a well-structured, compelling essay about: '{prompt}'. Tone: {tone}. Length: {length}.",
    "story": "Write a creative and engaging story about: '{prompt}'. Tone: {tone}. Length: {length}.",
    "article": "Write a professional, SEO-friendly blog article or news post about: '{prompt}'. Tone: {tone}. Length: {length}.",
    "summary": "Summarize the following text accurately and concisely:\n\n{prompt}\n\nTone: {tone}.",
    "rewrite": "Rewrite and improve the following text for clarity, grammar, and impact:\n\n{prompt}\n\nTone: {tone}."
}

@router.post("/generate")
async def generate_writing(req: WritingRequest):
    template = PROMPT_TEMPLATES.get(req.type, "Write content for: '{prompt}'. Tone: {tone}. Length: {length}.")
    formatted_prompt = template.format(
        prompt=req.prompt,
        tone=req.tone or "professional",
        length=req.length or "medium"
    )

    result = gemini_service.chat(prompt=formatted_prompt)
    return {"type": req.type, "content": result}
