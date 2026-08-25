from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/voice", tags=["Voice Chat"])

@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            user_text = data.get("text", "")
            if user_text:
                # Process speech text through Gemini
                ai_reply = gemini_service.chat(
                    prompt=user_text,
                    system_instruction="You are MultiHubAI Voice Assistant. Keep responses concise, friendly, and ideal for spoken text (avoid bullet points or code blocks unless requested)."
                )
                await websocket.send_json({"text": ai_reply, "user_text": user_text})
    except WebSocketDisconnect:
        pass
