from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int

class OrderResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    products: List[OrderItem]
    total_price: float
    order_status: OrderStatus
    payment_status: str
    created_at: datetime