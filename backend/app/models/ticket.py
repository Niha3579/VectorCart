from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketBase(BaseModel):
    message: str = Field(..., example="I received a broken product and the AI couldn't help.")
    conversation_history: List[dict] = Field(default=[], description="Store the recent chat logs here")
    sentiment_score: Optional[float] = Field(None, description="Score from -1.0 to 1.0")

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: TicketStatus

class TicketResponse(TicketBase):
    id: str = Field(..., alias="_id")
    user_id: str
    ticket_status: TicketStatus
    created_at: datetime

    class Config:
        populate_by_name = True