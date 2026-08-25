from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: str
    reply: str

class WritingRequest(BaseModel):
    type: str # essay, story, article, summary, rewrite
    prompt: str
    tone: Optional[str] = "professional"
    length: Optional[str] = "medium" # short, medium, long
    options: Optional[Dict[str, Any]] = None

class ImageGenRequest(BaseModel):
    prompt: str
    aspect_ratio: Optional[str] = "1:1"

class VideoGenRequest(BaseModel):
    prompt: str

class RAGQueryRequest(BaseModel):
    question: str
