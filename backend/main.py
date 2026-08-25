from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

from routers import chat, rag, writing, image_gen, video_gen, image_analysis, voice, settings as settings_router, health

app = FastAPI(
    title="MultiHubAI Assistant API",
    description="Full-stack AI assistant backend with Generative AI, RAG, Computer Vision, and Voice.",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat.router)
app.include_router(rag.router)
app.include_router(writing.router)
app.include_router(image_gen.router)
app.include_router(video_gen.router)
app.include_router(image_analysis.router)
app.include_router(voice.router)
app.include_router(settings_router.router)
app.include_router(health.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "MultiHubAI Assistant API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
