from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class ProductBase(BaseModel):
    name: str = Field(..., example="Wireless Noise Cancelling Headphones")
    description: str = Field(..., example="High-quality over-ear headphones with 30-hour battery life.")
    category: str = Field(..., example="Electronics")
    price: float = Field(..., gt=0, example=299.99)
    stock: int = Field(..., ge=0, example=50)
    images: List[str] = Field(default=[], example=["https://example.com/image1.jpg"])

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None

class ProductResponse(ProductBase):
    id: str = Field(..., alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True