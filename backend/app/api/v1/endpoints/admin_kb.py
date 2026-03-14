import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.api.deps import allow_admin
from app.services.ai.ingestion import IngestionService

router = APIRouter()
ingestion_service = IngestionService()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", dependencies=[Depends(allow_admin)])
async def upload_knowledge_document(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save file temporarily
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run Ingestion Pipeline
        chunk_count = await ingestion_service.process_file(file_path, file.filename, file_ext)
        return {
            "message": f"Successfully indexed {file.filename}",
            "chunks_created": chunk_count
        }
    finally:
        # Clean up local file
        if os.path.exists(file_path):
            os.remove(file_path)