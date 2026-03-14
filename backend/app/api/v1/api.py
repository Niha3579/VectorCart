from fastapi import APIRouter
from app.api.v1.endpoints import auth, products, cart, orders, admin_kb, chatbot, tickets

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(admin_kb.router, prefix="/admin/kb", tags=["Admin Knowledge Base"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["AI Chatbot"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Support Tickets"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])