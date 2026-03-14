from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from typing import Optional
from datetime import datetime
from app.db.mongodb import db_instance
from app.models.product import ProductCreate, ProductUpdate, ProductResponse
from app.api.deps import allow_admin
from bson import ObjectId

router = APIRouter()


# 1. Get all products (with optional category filter)
@router.get("/", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None, 
    min_price: Optional[float] = None, 
    max_price: Optional[float] = None
):
    query = {}
    if category:
        query["category"] = category
    if min_price or max_price:
        query["price"] = {}
        if min_price:
            query["price"]["$gte"] = min_price
        if max_price:
            query["price"]["$lte"] = max_price
            
    products = await db_instance.db["products"].find(query).to_list(length=100)
    
    # Convert ObjectId to string for response
    for p in products:
        p["_id"] = str(p["_id"])
    return products

# 2. Get a single product by ID
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID format")
        
    product = await db_instance.db["products"].find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product["_id"] = str(product["_id"])
    return product

# 3. Search products (Basic text search for now)
@router.get("/search/", response_model=List[ProductResponse])
async def search_products(q: str):
    # Case-insensitive search using regex
    query = {"name": {"$regex": q, "$options": "i"}}
    products = await db_instance.db["products"].find(query).to_list(length=20)
    
    for p in products:
        p["_id"] = str(p["_id"])
    return products


@router.post("/", response_model=ProductResponse, dependencies=[Depends(allow_admin)])
async def create_product(product_in: ProductCreate):
    product_dict = product_in.dict()
    product_dict["created_at"] = datetime.utcnow()
    
    result = await db_instance.db["products"].insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    return product_dict

@router.put("/{product_id}", response_model=ProductResponse, dependencies=[Depends(allow_admin)])
async def update_product(product_id: str, product_in: ProductUpdate):
    update_data = {k: v for k, v in product_in.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    result = await db_instance.db["products"].find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
        
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{product_id}", dependencies=[Depends(allow_admin)])
async def delete_product(product_id: str):
    result = await db_instance.db["products"].delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return {"message": "Product deleted successfully"}

# Inventory Management (Specific update for stock)
@router.patch("/{product_id}/stock", dependencies=[Depends(allow_admin)])
async def update_stock(product_id: str, stock_count: int):
    result = await db_instance.db["products"].update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"stock": stock_count}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": f"Stock updated to {stock_count}"}