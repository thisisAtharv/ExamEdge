import os
import json
import random
import re

# --- CONFIGURATION ---
BASE_DIR = r"C:\MERN_B1\examedge\exam-edge"
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
RESOURCES_FOLDER = os.path.join(PUBLIC_DIR, 'resources')
OUTPUT_FILE = os.path.join(BASE_DIR, 'src', 'data', 'resources.json')
# --------------------

def main():
    if not os.path.isdir(RESOURCES_FOLDER):
        print(f"Error: Directory '{RESOURCES_FOLDER}' not found. Please create it and add your PDF files.")
        return

    resources_list = []
    resource_id = 1
    
    print(f"Scanning for PDFs in '{RESOURCES_FOLDER}'...")

    for root, dirs, files in os.walk(RESOURCES_FOLDER):
        if 'Practice Questions' in dirs:
            dirs.remove('Practice Questions') # Skip quiz folders

        for filename in files:
            if filename.lower().endswith(".pdf"):
                try:
                    relative_path = os.path.relpath(root, RESOURCES_FOLDER)
                    path_parts = relative_path.split(os.sep)
                    
                    subject = path_parts[0] if len(path_parts) > 0 else "General"
                    topic = path_parts[1] if len(path_parts) > 1 else "General"
                    
                    title = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
                    title = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', title).strip()

                    url_path = os.path.join('/resources', relative_path, filename).replace('\\', '/')

                    resource_data = {
                        "id": resource_id,
                        "title": title,
                        "subject": subject,
                        "topic": topic,
                        "duration": f"{random.randint(15, 75)} mins",
                        "type": "Notes",
                        "url": url_path
                    }
                    
                    resources_list.append(resource_data)
                    resource_id += 1
                    
                except Exception as e:
                    print(f"  - Could not process {filename}. Error: {e}")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(resources_list, f, indent=2)

    print(f"\nSuccessfully generated '{OUTPUT_FILE}' with {len(resources_list)} resources.")

if __name__ == "__main__":
    main()