from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 1. Configuration & Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Email Settings
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# 2. Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "technician"
    team_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "technician"

class UserLogin(BaseModel):
    email: str
    password: str

class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    serial_number: str
    category: str
    department: Optional[str] = None
    assigned_employee: Optional[str] = None
    team_id: Optional[str] = None
    location: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_expiry: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EquipmentCreate(BaseModel):
    name: str
    serial_number: str
    category: str
    department: Optional[str] = None
    assigned_employee: Optional[str] = None
    team_id: Optional[str] = None
    location: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_expiry: Optional[str] = None

class MaintenanceTeam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    member_ids: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MaintenanceTeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    member_ids: List[str] = []

class MaintenanceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject: str
    description: Optional[str] = None
    equipment_id: str
    equipment_name: Optional[str] = None
    equipment_category: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    assigned_to: Optional[str] = None
    request_type: str
    stage: str = "new"
    scheduled_date: Optional[str] = None
    duration: Optional[float] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MaintenanceRequestCreate(BaseModel):
    subject: str
    description: Optional[str] = None
    equipment_id: str
    request_type: str
    scheduled_date: Optional[str] = None

class MaintenanceRequestUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    assigned_to: Optional[str] = None
    duration: Optional[float] = None
    scheduled_date: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_id: str
    message: str
    request_id: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# 3. Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str, email: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({"user_id": user_id, "email": email, "exp": expiration}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==============================================================================
# DEBUG: Send Email Function
# ==============================================================================
def send_email_notification(recipients: List[str], subject: str, body: str):
    """
    Sends an email to a list of recipients.
    """
    print(f"\n[EMAIL DEBUG] Starting background email task...")
    print(f"[EMAIL DEBUG] Recipients: {recipients}")
    print(f"[EMAIL DEBUG] Subject: {subject}")
    
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EMAIL DEBUG] ERROR: SMTP_USER or SMTP_PASSWORD not set in .env file.")
        return

    print(f"[EMAIL DEBUG] SMTP Config: Server={SMTP_SERVER}, Port={SMTP_PORT}, User={SMTP_USER}")

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['Subject'] = subject
    msg['To'] = ", ".join(recipients)
    msg.attach(MIMEText(body, 'plain'))

    try:
        print("[EMAIL DEBUG] Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        
        print("[EMAIL DEBUG] Logging in...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        print(f"[EMAIL DEBUG] Sending email to {len(recipients)} recipients...")
        server.sendmail(SMTP_USER, recipients, msg.as_string())
        
        server.quit()
        print(f"[EMAIL DEBUG] SUCCESS: Email sent successfully!\n")
    except Exception as e:
        print(f"[EMAIL DEBUG] FAILURE: Failed to send email.")
        print(f"[EMAIL DEBUG] Exception Error: {e}\n")
# ==============================================================================

# 4. Auth Routes
@api_router.post("/auth/register")
async def register(user_create: UserCreate):
    existing = await db.users.find_one({"email": user_create.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=user_create.email, name=user_create.name, role=user_create.role)
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_create.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    token = create_token(user.id, user.email)
    
    return {"user": user.model_dump(), "token": token}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc or not verify_password(login_data.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    token = create_token(user.id, user.email)
    
    return {"user": user.model_dump(), "token": token}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# 5. Equipment Routes
@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(equipment_data: EquipmentCreate, current_user: User = Depends(get_current_user)):
    equipment = Equipment(**equipment_data.model_dump())
    equipment_dict = equipment.model_dump()
    equipment_dict["created_at"] = equipment_dict["created_at"].isoformat()
    
    await db.equipment.insert_one(equipment_dict)
    return equipment

@api_router.get("/equipment", response_model=List[Equipment])
async def get_equipment(current_user: User = Depends(get_current_user)):
    equipment_list = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    for eq in equipment_list:
        if isinstance(eq.get("created_at"), str):
            eq["created_at"] = datetime.fromisoformat(eq["created_at"])
    return equipment_list

@api_router.get("/equipment/{equipment_id}", response_model=Equipment)
async def get_equipment_by_id(equipment_id: str, current_user: User = Depends(get_current_user)):
    equipment = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if isinstance(equipment.get("created_at"), str):
        equipment["created_at"] = datetime.fromisoformat(equipment["created_at"])
    return Equipment(**equipment)

@api_router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment(equipment_id: str, equipment_data: EquipmentCreate, current_user: User = Depends(get_current_user)):
    existing = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_data = equipment_data.model_dump()
    await db.equipment.update_one({"id": equipment_id}, {"$set": update_data})
    
    updated = await db.equipment.find_one({"id": equipment_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    return Equipment(**updated)

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str, current_user: User = Depends(get_current_user)):
    result = await db.equipment.delete_one({"id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted"}

@api_router.get("/equipment/{equipment_id}/requests", response_model=List[MaintenanceRequest])
async def get_equipment_requests(equipment_id: str, current_user: User = Depends(get_current_user)):
    requests = await db.maintenance_requests.find({"equipment_id": equipment_id}, {"_id": 0}).to_list(1000)
    for req in requests:
        if isinstance(req.get("created_at"), str):
            req["created_at"] = datetime.fromisoformat(req["created_at"])
        if isinstance(req.get("updated_at"), str):
            req["updated_at"] = datetime.fromisoformat(req["updated_at"])
    return requests

# 6. Team Routes
@api_router.post("/teams", response_model=MaintenanceTeam)
async def create_team(team_data: MaintenanceTeamCreate, current_user: User = Depends(get_current_user)):
    team = MaintenanceTeam(**team_data.model_dump())
    team_dict = team.model_dump()
    team_dict["created_at"] = team_dict["created_at"].isoformat()
    
    await db.teams.insert_one(team_dict)
    return team

@api_router.get("/teams", response_model=List[MaintenanceTeam])
async def get_teams(current_user: User = Depends(get_current_user)):
    teams = await db.teams.find({}, {"_id": 0}).to_list(1000)
    for team in teams:
        if isinstance(team.get("created_at"), str):
            team["created_at"] = datetime.fromisoformat(team["created_at"])
    return teams

@api_router.get("/teams/{team_id}", response_model=MaintenanceTeam)
async def get_team_by_id(team_id: str, current_user: User = Depends(get_current_user)):
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if isinstance(team.get("created_at"), str):
        team["created_at"] = datetime.fromisoformat(team["created_at"])
    return MaintenanceTeam(**team)

@api_router.put("/teams/{team_id}", response_model=MaintenanceTeam)
async def update_team(team_id: str, team_data: MaintenanceTeamCreate, current_user: User = Depends(get_current_user)):
    existing = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")
    
    update_data = team_data.model_dump()
    await db.teams.update_one({"id": team_id}, {"$set": update_data})
    
    updated = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    return MaintenanceTeam(**updated)

@api_router.delete("/teams/{team_id}")
async def delete_team(team_id: str, current_user: User = Depends(get_current_user)):
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted"}

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get("created_at"), str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
    return users

# 7. Request Routes
@api_router.post("/requests", response_model=MaintenanceRequest)
async def create_request(
    request_data: MaintenanceRequestCreate, 
    background_tasks: BackgroundTasks, 
    current_user: User = Depends(get_current_user)
):
    print(f"\n[DEBUG] Create Request Triggered by user: {current_user.email}")
    
    equipment = await db.equipment.find_one({"id": request_data.equipment_id}, {"_id": 0})
    if not equipment:
        print("[DEBUG] Error: Equipment not found")
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    request = MaintenanceRequest(
        **request_data.model_dump(),
        created_by=current_user.id,
        equipment_name=equipment.get("name"),
        equipment_category=equipment.get("category"),
        team_id=equipment.get("team_id"),
    )
    
    if request.team_id:
        team = await db.teams.find_one({"id": request.team_id}, {"_id": 0})
        if team:
            request.team_name = team.get("name")
            print(f"[DEBUG] Request assigned to Team: {team.get('name')} (ID: {request.team_id})")
    else:
        print("[DEBUG] No Team assigned to this equipment.")
    
    request_dict = request.model_dump()
    request_dict["created_at"] = request_dict["created_at"].isoformat()
    request_dict["updated_at"] = request_dict["updated_at"].isoformat()
    
    await db.maintenance_requests.insert_one(request_dict)

    # --- Notification Logic (In-App + Email) ---
    if request.team_id:
        team_doc = await db.teams.find_one({"id": request.team_id})
        if team_doc and "member_ids" in team_doc:
            print(f"[DEBUG] Found {len(team_doc['member_ids'])} members in team.")
            
            notifications_to_insert = []
            recipient_emails = [] 
            
            for member_id in team_doc["member_ids"]:
                if member_id == current_user.id:
                    print(f"[DEBUG] Skipping email for user {member_id} (creator of request).")
                    continue 
                
                # Fetch User Details for Email
                member_user = await db.users.find_one({"id": member_id}, {"email": 1, "name": 1})
                if member_user:
                    user_email = member_user.get("email")
                    user_name = member_user.get("name")
                    print(f"[DEBUG] Found team member: {user_name}, Email: {user_email}")
                    
                    if user_email:
                        recipient_emails.append(user_email)
                    
                    # In-App Notification
                    new_notification = Notification(
                        recipient_id=member_id,
                        request_id=request.id,
                        message=f"New maintenance request: {request.subject}",
                    )
                    notif_dict = new_notification.model_dump()
                    notif_dict["created_at"] = notif_dict["created_at"].isoformat()
                    notifications_to_insert.append(notif_dict)
                else:
                    print(f"[DEBUG] Warning: Member ID {member_id} not found in Users collection.")
            
            # DB Insert
            if notifications_to_insert:
                await db.notifications.insert_many(notifications_to_insert)
            
            # Email Background Task
            if recipient_emails:
                print(f"[DEBUG] Queueing background email to {len(recipient_emails)} recipients: {recipient_emails}")
                email_subject = f"Maintenance Request: {request.subject}"
                email_body = (
                    f"Hello Team,\n\n"
                    f"A new maintenance request has been created.\n\n"
                    f"Equipment: {request.equipment_name}\n"
                    f"Issue: {request.subject}\n"
                    f"Priority: {request.request_type}\n\n"
                    f"Please check the dashboard for details."
                )
                background_tasks.add_task(send_email_notification, recipient_emails, email_subject, email_body)
            else:
                print("[DEBUG] No valid emails found to send.")
        else:
            print("[DEBUG] Team document not found or has no members.")
    
    return request

@api_router.get("/requests", response_model=List[MaintenanceRequest])
async def get_requests(current_user: User = Depends(get_current_user)):
    requests = await db.maintenance_requests.find({}, {"_id": 0}).to_list(1000)
    for req in requests:
        if isinstance(req.get("created_at"), str):
            req["created_at"] = datetime.fromisoformat(req["created_at"])
        if isinstance(req.get("updated_at"), str):
            req["updated_at"] = datetime.fromisoformat(req["updated_at"])
    return requests

@api_router.get("/requests/{request_id}", response_model=MaintenanceRequest)
async def get_request_by_id(request_id: str, current_user: User = Depends(get_current_user)):
    request = await db.maintenance_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if isinstance(request.get("created_at"), str):
        request["created_at"] = datetime.fromisoformat(request["created_at"])
    if isinstance(request.get("updated_at"), str):
        request["updated_at"] = datetime.fromisoformat(request["updated_at"])
    return MaintenanceRequest(**request)

# ==============================================================================
# UPDATED FUNCTION: Update Request (Handles Assignment Email with DEBUG)
# ==============================================================================
@api_router.put("/requests/{request_id}", response_model=MaintenanceRequest)
async def update_request(
    request_id: str, 
    request_update: MaintenanceRequestUpdate, 
    background_tasks: BackgroundTasks, 
    current_user: User = Depends(get_current_user)
):
    print(f"\n[DEBUG] Update Request Triggered for ID: {request_id}")
    
    existing = await db.maintenance_requests.find_one({"id": request_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Request not found")
    
    update_data = request_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # -------------------------------------------------------------
    # 1. CHECK FOR NEW ASSIGNMENT AND SEND EMAIL
    # -------------------------------------------------------------
    new_assignee_id = request_update.assigned_to
    old_assignee_id = existing.get("assigned_to")

    if new_assignee_id and new_assignee_id != old_assignee_id:
        print(f"[DEBUG] Assignment Change Detected: {old_assignee_id} -> {new_assignee_id}")
        
        # Fetch the Technician who was assigned
        assignee = await db.users.find_one({"id": new_assignee_id})
        
        if assignee:
            assignee_email = assignee.get("email")
            assignee_name = assignee.get("name")
            print(f"[DEBUG] Assignee Found: Name={assignee_name}, Email={assignee_email}")

            # A. Create In-App Notification
            new_notification = Notification(
                recipient_id=assignee["id"],
                request_id=request_id,
                message=f"You have been assigned to request: {existing.get('subject')}",
            )
            notif_dict = new_notification.model_dump()
            notif_dict["created_at"] = notif_dict["created_at"].isoformat()
            await db.notifications.insert_one(notif_dict)

            # B. Send Email
            if assignee_email:
                print(f"[DEBUG] Queueing assignment email to: {assignee_email}")
                email_subject = f"Assigned to Task: {existing.get('subject')}"
                email_body = (
                    f"Hello {assignee_name},\n\n"
                    f"You have been assigned to a maintenance request.\n\n"
                    f"Task: {existing.get('subject')}\n"
                    f"Equipment: {existing.get('equipment_name')}\n"
                    f"Status: {existing.get('stage')}\n\n"
                    f"Please log in to the dashboard to view details and update progress."
                )
                background_tasks.add_task(send_email_notification, [assignee_email], email_subject, email_body)
            else:
                print(f"[DEBUG] User {assignee_name} has no email address.")
        else:
            print(f"[DEBUG] Error: User ID {new_assignee_id} not found in database.")
    # -------------------------------------------------------------

    # 2. Side Effect: Update Equipment Status on Stage Change
    if request_update.stage:
        equipment_id = existing.get("equipment_id")
        if equipment_id:
            if request_update.stage == "in_progress":
                await db.equipment.update_one({"id": equipment_id}, {"$set": {"status": "maintenance"}})
            elif request_update.stage == "repaired":
                await db.equipment.update_one({"id": equipment_id}, {"$set": {"status": "active"}})
            elif request_update.stage == "scrap":
                await db.equipment.update_one({"id": equipment_id}, {"$set": {"status": "scrapped"}})
    
    await db.maintenance_requests.update_one({"id": request_id}, {"$set": update_data})
    
    updated = await db.maintenance_requests.find_one({"id": request_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    if isinstance(updated.get("updated_at"), str):
        updated["updated_at"] = datetime.fromisoformat(updated["updated_at"])
    return MaintenanceRequest(**updated)
# ==============================================================================

@api_router.delete("/requests/{request_id}")
async def delete_request(request_id: str, current_user: User = Depends(get_current_user)):
    result = await db.maintenance_requests.delete_one({"id": request_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "Request deleted"}

# 8. Notification Routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_my_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"recipient_id": current_user.id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    for note in notifications:
        if isinstance(note.get("created_at"), str):
            note["created_at"] = datetime.fromisoformat(note["created_at"])
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "recipient_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}

# 9. Dashboard Stats Route
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    total_equipment = await db.equipment.count_documents({})
    total_teams = await db.teams.count_documents({})
    total_requests = await db.maintenance_requests.count_documents({})
    
    new_requests = await db.maintenance_requests.count_documents({"stage": "new"})
    in_progress_requests = await db.maintenance_requests.count_documents({"stage": "in_progress"})
    repaired_requests = await db.maintenance_requests.count_documents({"stage": "repaired"})
    
    corrective = await db.maintenance_requests.count_documents({"request_type": "corrective"})
    preventive = await db.maintenance_requests.count_documents({"request_type": "preventive"})
    
    return {
        "total_equipment": total_equipment,
        "total_teams": total_teams,
        "total_requests": total_requests,
        "new_requests": new_requests,
        "in_progress_requests": in_progress_requests,
        "repaired_requests": repaired_requests,
        "corrective_requests": corrective,
        "preventive_requests": preventive
    }

# 10. App Assembly
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()