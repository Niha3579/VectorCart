from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.mongodb import db_instance
from app.models.user import UserCreate, Token

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    user_exists = await db_instance.db["users"].find_one({"email": user_in.email})
    if user_exists:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_in.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    await db_instance.db["users"].insert_one(user_dict)
    
    access_token = create_access_token(user_in.email, user_in.role)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # We search by email using the 'username' field from the form
    user = await db_instance.db["users"].find_one({"email": form_data.username})
    
    # Check if user exists and verify the hashed password
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect email or password"
        )
    
    # Use the email and role from the DB to create the token
    access_token = create_access_token(user["email"], user["role"])
    return {"access_token": access_token, "token_type": "bearer"}