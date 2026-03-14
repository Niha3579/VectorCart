import uuid
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone
from app.core.config import settings
from app.db.mongodb import db_instance

# Initialize Pinecone
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index("ecommerce-knowledge-base")

class IngestionService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )

    async def process_file(self, file_path: str, filename: str, file_type: str):
        # 1. Load Document
        if file_type == "pdf":
            loader = PyPDFLoader(file_path)
        elif file_type == "docx":
            loader = Docx2txtLoader(file_path)
        else:
            loader = TextLoader(file_path)
            
        docs = loader.load()

        # 2. Chunk Text
        chunks = self.text_splitter.split_documents(docs)

        # 3. Prepare for Pinecone
        vectors = []
        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            embedding = self.embeddings.embed_query(chunk.page_content)
            
            vectors.append({
                "id": chunk_id,
                "values": embedding,
                "metadata": {
                    "text": chunk.page_content,
                    "filename": filename,
                    "source": "company_knowledge"
                }
            })

        # 4. Upsert to Pinecone
        index.upsert(vectors=vectors)

        # 5. Save Metadata Record in MongoDB
        await db_instance.db["knowledge_base"].insert_one({
            "filename": filename,
            "chunk_count": len(chunks),
            "upload_date": uuid.datetime.utcnow()
        })

        return len(chunks)