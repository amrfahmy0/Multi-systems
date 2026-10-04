import requests
import json
import os

SUPABASE_URL = "https://qemnkhawfjholkszxwlv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbW5raGF3Zmpob2xrc3p4d2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTM4NDMsImV4cCI6MjEwNjQyOTg0M30.tOJozEkZWrht9ysfrr0gzyuS3vUVDJ6yGgxTos824uw"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

EXPENSE_MAPPINGS = {
    "materials": "مواد بناء",
    "labor": "عمالة",
    "transport": "نقل",
    "equipment": "معدات",
    "permits": "تراخيص",
    "utilities": "مرافق",
    "supervisor_wage": "يوميات المشرف",
    "other": "أخرى"
}

PROCUREMENT_MAPPINGS = {
    "electrical": "كهرباء",
    "plumbing": "سباكة",
    "paint": "دهانات",
    "tiles": "بلاط وسيراميك",
    "wood": "أخشاب",
    "aluminum": "ألومنيوم",
    "gypsum": "جبس",
    "hardware": "خردوات",
    "sanitary": "أدوات صحية",
    "other": "أخرى"
}

def migrate_table(table_name, mappings):
    for old_val, new_val in mappings.items():
        url = f"{SUPABASE_URL}/rest/v1/{table_name}?category=eq.{old_val}"
        payload = {"category": new_val}
        response = requests.patch(url, headers=HEADERS, json=payload)
        if response.status_code in (200, 204):
            print(f"Updated {table_name}: '{old_val}' successfully")
        else:
            print(f"Failed to update {table_name}: '{old_val}'. Error: {response.text}")

print("Starting migration...")
migrate_table("general_expenses", EXPENSE_MAPPINGS)
migrate_table("procurement_log", PROCUREMENT_MAPPINGS)
print("Migration complete.")
