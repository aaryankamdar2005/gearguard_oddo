import requests
import os

backend_url = os.popen("grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2").read().strip()
API_URL = "http://127.0.0.1:8000/api"

print(f"Using API URL: {API_URL}")

login_response = requests.post(f"{API_URL}/auth/login", json={
    "email": "admin@gearguard.com",
    "password": "admin123"
})

if login_response.status_code != 200:
    print("Login failed!")
    exit(1)

token = login_response.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

teams_response = requests.get(f"{API_URL}/teams", headers=headers)
teams = teams_response.json()
print(f"Found {len(teams)} teams")

team_map = {t["name"]: t["id"] for t in teams}

equipment_data = [
    {
        "name": "CNC Machine 01",
        "serial_number": "CNC-2023-001",
        "category": "Machinery",
        "department": "Production",
        "assigned_employee": "Production Manager",
        "team_id": team_map.get("Mechanics Team", ""),
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
        "team_id": team_map.get("Mechanics Team", ""),
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
        "team_id": team_map.get("IT Support", ""),
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
        "team_id": team_map.get("Mechanics Team", ""),
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
        "team_id": team_map.get("Electricians", ""),
        "location": "Building A, Basement",
        "purchase_date": "2021-05-12",
        "warranty_expiry": "2024-05-12"
    }
]

equipment_ids = {}
print("\nCreating equipment...")
for eq in equipment_data:
    resp = requests.post(f"{API_URL}/equipment", json=eq, headers=headers)
    if resp.status_code == 200:
        eq_data = resp.json()
        equipment_ids[eq["name"]] = eq_data["id"]
        print(f"  ✓ {eq['name']}")
    else:
        print(f"  ✗ Failed to create {eq['name']}: {resp.text}")

requests_data = [
    {
        "subject": "Oil Leak Detected",
        "description": "CNC machine showing signs of hydraulic oil leakage. Requires immediate attention.",
        "equipment_id": equipment_ids.get("CNC Machine 01", ""),
        "request_type": "corrective"
    },
    {
        "subject": "Routine Checkup",
        "description": "Monthly preventive maintenance for forklift",
        "equipment_id": equipment_ids.get("Forklift FL-05", ""),
        "request_type": "preventive",
        "scheduled_date": "2025-01-15"
    },
    {
        "subject": "Software Update Required",
        "description": "Desktop PC needs security updates and software patches",
        "equipment_id": equipment_ids.get("Desktop PC-42", ""),
        "request_type": "corrective"
    },
    {
        "subject": "Laser Alignment Check",
        "description": "Quarterly preventive maintenance - laser alignment verification",
        "equipment_id": equipment_ids.get("Laser Cutter LC-12", ""),
        "request_type": "preventive",
        "scheduled_date": "2025-01-20"
    },
    {
        "subject": "Compressor Filter Replacement",
        "description": "Air filter needs replacement - scheduled maintenance",
        "equipment_id": equipment_ids.get("Air Compressor AC-03", ""),
        "request_type": "preventive",
        "scheduled_date": "2025-01-18"
    }
]

print("\nCreating maintenance requests...")
for req in requests_data:
    if not req["equipment_id"]:
        continue
    resp = requests.post(f"{API_URL}/requests", json=req, headers=headers)
    if resp.status_code == 200:
        print(f"  ✓ {req['subject']}")
    else:
        print(f"  ✗ Failed to create {req['subject']}: {resp.text}")

print("\n✅ Seeding complete!")
