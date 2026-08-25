import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from config import settings
from schemas import RAGQueryRequest
from services.document_processor import document_processor
from services.rag_service import rag_service
from services.db_service import db_service

router = APIRouter(prefix="/api/rag", tags=["RAG"])

@router.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    results = []
    allowed_exts = {".pdf", ".docx", ".doc", ".txt", ".md", ".csv", ".tsv", ".xlsx", ".xls"}

    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: PDF, DOCX, TXT, MD, CSV, TSV, XLSX, XLS.")

        doc_id = str(uuid.uuid4())
        file_path = os.path.join(settings.UPLOADS_DIR, f"{doc_id}_{file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)

        try:
            # Process & chunk document
            docs = document_processor.process_file(file_path, file.filename)
            # Add to vector store
            rag_service.add_documents(docs)
            # Record in DB
            db_service.add_document_record(
                doc_id=doc_id,
                filename=file.filename,
                file_path=file_path,
                file_type=ext,
                file_size=file_size,
                chunks_count=len(docs)
            )
            results.append({
                "id": doc_id,
                "filename": file.filename,
                "chunks": len(docs),
                "status": "indexed"
            })
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Error processing {file.filename}: {str(e)}")

    return {"uploaded": results}

@router.get("/documents")
async def list_documents():
    return db_service.list_documents()

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    db_service.delete_document_record(doc_id)
    return {"success": True, "message": "Document record deleted"}

@router.post("/query")
async def query_rag(req: RAGQueryRequest):
    return rag_service.query(req.question)
