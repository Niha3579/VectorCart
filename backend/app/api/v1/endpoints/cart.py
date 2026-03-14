from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.db.mongodb import db_instance
from app.models.cart import CartItem, CartUpdate
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db_instance.db["carts"].find_one({"user_id": str(current_user["_id"])})
    if not cart:
        return {"user_id": str(current_user["_id"]), "items": [], "total_price": 0.0}
    return cart

@router.post("/add")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Check if product exists and has stock
    product = await db_instance.db["products"].find_one({"_id": ObjectId(item.product_id)})
    if not product or product["stock"] < item.quantity:
        raise HTTPException(status_code=400, detail="Product unavailable or insufficient stock")

    # Atomic update: Add item or update quantity if exists
    await db_instance.db["carts"].update_one(
        {"user_id": user_id},
        {"$pull": {"items": {"product_id": item.product_id}}}, # Remove old if exists
        upsert=True
    )
    await db_instance.db["carts"].update_one(
        {"user_id": user_id},
        {"$push": {"items": item.dict()}}
    )
    return {"message": "Cart updated"}