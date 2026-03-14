from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db_instance
from app.models.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketStatus
from app.api.deps import get_current_user, allow_admin

router = APIRouter()

# 1. Create a Ticket (Customer or AI Agent)
@router.post("/", response_model=TicketResponse)
async def create_ticket(ticket_in: TicketCreate, current_user: dict = Depends(get_current_user)):
    ticket_dict = ticket_in.dict()
    ticket_dict.update({
        "user_id": str(current_user["_id"]),
        "ticket_status": TicketStatus.OPEN,
        "created_at": datetime.utcnow()
    })
    
    result = await db_instance.db["tickets"].insert_one(ticket_dict)
    ticket_dict["_id"] = str(result.inserted_id)
    return ticket_dict

# 2. View My Tickets (Customer)
@router.get("/my-tickets", response_model=List[TicketResponse])
async def get_my_tickets(current_user: dict = Depends(get_current_user)):
    tickets = await db_instance.db["tickets"].find({"user_id": str(current_user["_id"])}).to_list(100)
    for t in tickets: t["_id"] = str(t["_id"])
    return tickets

# 3. View All Tickets (Admin Only)
@router.get("/admin/all", response_model=List[TicketResponse], dependencies=[Depends(allow_admin)])
async def get_all_tickets():
    tickets = await db_instance.db["tickets"].find().to_list(100)
    for t in tickets: t["_id"] = str(t["_id"])
    return tickets

# 4. Update Ticket Status (Admin Only)
@router.patch("/{ticket_id}/status", dependencies=[Depends(allow_admin)])
async def update_ticket_status(ticket_id: str, status_update: TicketUpdate):
    result = await db_instance.db["tickets"].update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"ticket_status": status_update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": f"Ticket updated to {status_update.status}"}