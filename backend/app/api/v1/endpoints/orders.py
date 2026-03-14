from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.db.mongodb import db_instance
from app.models.order import OrderStatus, OrderResponse
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str


@router.post("/checkout")
async def checkout(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    cart = await db_instance.db["carts"].find_one({"user_id": user_id})
    
    if not cart or not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total_price = 0.0

    # 1. Validate all items and calculate price
    for item in cart["items"]:
        product = await db_instance.db["products"].find_one({"_id": ObjectId(item["product_id"])})
        if not product or product["stock"] < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        order_items.append({
            "product_id": item["product_id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item["quantity"]
        })
        total_price += product["price"] * item["quantity"]

    # 2. Create Order Document
    new_order = {
        "user_id": user_id,
        "products": order_items,
        "total_price": total_price,
        "order_status": OrderStatus.PENDING,
        "payment_status": "paid",  # Simulated payment
        "created_at": datetime.utcnow()
    }
    
    order_result = await db_instance.db["orders"].insert_one(new_order)

    # 3. Atomic Stock Deduction
    for item in order_items:
        await db_instance.db["products"].update_one(
            {"_id": ObjectId(item["product_id"])},
            {"$inc": {"stock": -item["quantity"]}}
        )

    # 4. Clear Cart
    await db_instance.db["carts"].delete_one({"user_id": user_id})

    return {"message": "Order placed successfully", "order_id": str(order_result.inserted_id)}



@router.get("/history")
async def get_order_history(current_user: dict = Depends(get_current_user)):
    orders = await db_instance.db["orders"].find({"user_id": str(current_user["_id"])}).to_list(length=100)
    for o in orders: o["_id"] = str(o["_id"])
    return orders


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, data: StatusUpdate, current_user: dict = Depends(get_current_user)):
    # In a real app, check if current_user["role"] == "admin"
    result = await db_instance.db["orders"].update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"order_status": data.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Status updated successfully"}