from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.services.ai.chatbot import chatbot_service

router = APIRouter()

class ChatQuery(BaseModel):
    message: str

@router.post("/query")
async def ask_chatbot(query: ChatQuery, current_user: dict = Depends(get_current_user)):
    # Bypassing LangGraph agents and calling the service directly
    answer = await chatbot_service.get_response_with_sentiment(
        query.message, 
        current_user
    )
    return {"answer": answer}