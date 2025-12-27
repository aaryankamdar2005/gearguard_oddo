import requests
import sys

BACKEND_URL = "http://127.0.0.1:8000/api"

def seed_data():
    print("Starting GearGuard data seeding...")
    
    users_data = [
        {"email": "admin@gearguard.com", "password": "admin123", "name": "Admin User", "role": "manager"},
        {"email": "john@gearguard.com", "password": "tech123", "name": "John Smith", "role": "technician"},
        {"email": "sarah@gearguard.com", "password": "tech123", "name": "Sarah Johnson", "role": "technician"},
        {"email": "mike@gearguard.com", "password": "tech123", "name": "Mike Williams", "role": "technician"},
    ]
    
    print("\n1. Creating users...")
    tokens = {}
    user_ids = {}
    for user_data in users_data:
        try:
            response = requests.post(f"{BACKEND_URL}/auth/register", json=user_data)
            if response.status_code == 200:
                result = response.json()
                tokens[user_data["email"]] = result["token"]
                user_ids[user_data["email"]] = result["user"]["id"]
                print(f"   ✓ Created user: {user_data['name']}")
            else:
                print(f"   ✗ Failed to create {user_data['name']}: {response.text}")
        except Exception as e:
            print(f"   ✗ Error creating {user_data['name']}: {str(e)}")
    
    if not tokens:
        print("Failed to create users. Exiting.")
        return
    
    admin_token = tokens.get("admin@gearguard.com")
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    print("\n2. Creating maintenance teams...")
    teams_data = [
        {
            "name": "Mechanics Team",
            "description": "Handles machinery and vehicle repairs",
            "member_ids": [user_ids.get("john@gearguard.com"), user_ids.get("sarah@gearguard.com")]
        },
        {
            "name": "IT Support",
            "description": "Computer and network equipment maintenance",
            "member_ids": [user_ids.get("mike@gearguard.com")]
        },
        {
            "name": "Electricians",
            "description": "Electrical systems and equipment",
            "member_ids": [user_ids.get("sarah@gearguard.com"), user_ids.get("mike@gearguard.com")]
        },
    ]
    
    team_ids = {}
    for team_data in teams_data:
        try:
            response = requests.post(f"{BACKEND_URL}/teams", json=team_data, headers=headers)
            if response.status_code == 200:
                team = response.json()
                team_ids[team_data["name"]] = team["id"]
                print(f"   ✓ Created team: {team_data['name']}")
            else:
                print(f"   ✗ Failed to create {team_data['name']}: {response.text}")
        except Exception as e:
            print(f"   ✗ Error creating {team_data['name']}: {str(e)}")
    
    print("\n3. Creating equipment...")
    equipment_data = [
        {
            "name": "CNC Machine 01",
            "serial_number": "CNC-2023-001",
            "category": "Machinery",
            "department": "Production",
            "assigned_employee": "Production Manager",
            "team_id": team_ids.get("Mechanics Team"),
            "location": "Building A, Floor 2",
            "purchase_date": "2023-01-15",
            "warranty_expiry": "2026-01-15"
        },
        {
            "name": "Forklift FL-05",
            "serial_number": "FL-2022-005",
            "category": "Vehicle",
            "department": "Logistics",
            "assigned_employee": "Warehouse Lead",
            "team_id": team_ids.get("Mechanics Team"),
            "location": "Warehouse B",
            "purchase_date": "2022-06-10",
            "warranty_expiry": "2025-06-10"
        },
        {
            "name": "Desktop PC-42",
            "serial_number": "PC-2024-042",
            "category": "Computer",
            "department": "IT",
            "assigned_employee": "Jane Doe",
            "team_id": team_ids.get("IT Support"),
            "location": "Office Building, Floor 3",
            "purchase_date": "2024-02-01",
            "warranty_expiry": "2027-02-01"
        },
        {
            "name": "Laser Cutter LC-12",
            "serial_number": "LC-2023-012",
            "category": "Machinery",
            "department": "Production",
            "assigned_employee": "Production Team",
            "team_id": team_ids.get("Mechanics Team"),
            "location": "Building A, Floor 1",
            "purchase_date": "2023-08-20",
            "warranty_expiry": "2026-08-20"
        },
        {
            "name": "Air Compressor AC-03",
            "serial_number": "AC-2021-003",
            "category": "Machinery",
            "department": "Production",
            "assigned_employee": "",
            "team_id": team_ids.get("Electricians"),
            "location": "Building A, Basement",
            "purchase_date": "2021-05-12",
            "warranty_expiry": "2024-05-12"
        },
    ]
    
    equipment_ids = {}
    for eq_data in equipment_data:
        try:
            response = requests.post(f"{BACKEND_URL}/equipment", json=eq_data, headers=headers)
            if response.status_code == 200:
                equipment = response.json()
                equipment_ids[eq_data["name"]] = equipment["id"]
                print(f"   ✓ Created equipment: {eq_data['name']}")
            else:
                print(f"   ✗ Failed to create {eq_data['name']}: {response.text}")
        except Exception as e:
            print(f"   ✗ Error creating {eq_data['name']}: {str(e)}")
    
    print("\n4. Creating maintenance requests...")
    requests_data = [
        {
            "subject": "Oil Leak Detected",
            "description": "CNC machine showing signs of hydraulic oil leakage. Requires immediate attention.",
            "equipment_id": equipment_ids.get("CNC Machine 01"),
            "request_type": "corrective",
            "scheduled_date": None
        },
        {
            "subject": "Routine Checkup",
            "description": "Monthly preventive maintenance for forklift",
            "equipment_id": equipment_ids.get("Forklift FL-05"),
            "request_type": "preventive",
            "scheduled_date": "2025-01-15"
        },
        {
            "subject": "Software Update Required",
            "description": "Desktop PC needs security updates and software patches",
            "equipment_id": equipment_ids.get("Desktop PC-42"),
            "request_type": "corrective",
            "scheduled_date": None
        },
        {
            "subject": "Laser Alignment Check",
            "description": "Quarterly preventive maintenance - laser alignment verification",
            "equipment_id": equipment_ids.get("Laser Cutter LC-12"),
            "request_type": "preventive",
            "scheduled_date": "2025-01-20"
        },
        {
            "subject": "Compressor Filter Replacement",
            "description": "Air filter needs replacement - scheduled maintenance",
            "equipment_id": equipment_ids.get("Air Compressor AC-03"),
            "request_type": "preventive",
            "scheduled_date": "2025-01-18"
        },
    ]
    
    for req_data in requests_data:
        try:
            response = requests.post(f"{BACKEND_URL}/requests", json=req_data, headers=headers)
            if response.status_code == 200:
                print(f"   ✓ Created request: {req_data['subject']}")
            else:
                print(f"   ✗ Failed to create {req_data['subject']}: {response.text}")
        except Exception as e:
            print(f"   ✗ Error creating {req_data['subject']}: {str(e)}")
    
    print("\n✅ Data seeding completed!")
    print("\nLogin credentials:")
    print("  Email: admin@gearguard.com")
    print("  Password: admin123")
    print("\nOr use any technician account:")
    print("  Email: john@gearguard.com | Password: tech123")
    print("  Email: sarah@gearguard.com | Password: tech123")
    print("  Email: mike@gearguard.com | Password: tech123")

if __name__ == "__main__":
    seed_data()
