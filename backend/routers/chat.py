from fastapi import APIRouter, HTTPException
from schemas import ChatRequest, ChatResponse
from services.gemini_service import gemini_service
from services.db_service import db_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    conv_id = req.conversation_id
    if not conv_id:
        conv_id = db_service.create_conversation(title=req.message[:30])

    # Add user message to DB
    db_service.add_message(conv_id, "user", req.message)

    # Get conversation history
    history = db_service.get_conversation_messages(conv_id)
    # Exclude the current last message since it's passed as current prompt
    history_prev = history[:-1] if len(history) > 1 else []

    reply = gemini_service.chat(
        prompt=req.message,
        history=history_prev,
        system_instruction=req.system_prompt
    )

    # Add assistant response to DB
    db_service.add_message(conv_id, "assistant", reply)

    return ChatResponse(conversation_id=conv_id, reply=reply)

@router.get("/conversations")
async def list_conversations():
    return db_service.list_conversations()

@router.get("/conversations/{conv_id}")
async def get_conversation(conv_id: str):
    messages = db_service.get_conversation_messages(conv_id)
    return {"id": conv_id, "messages": messages}

@router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str):
    db_service.delete_conversation(conv_id)
    return {"success": True, "message": f"Conversation {conv_id} deleted"}
