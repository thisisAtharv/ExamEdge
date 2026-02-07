import os
import re
import fitz
import firebase_admin
from firebase_admin import credentials, firestore
import random

# --- CONFIGURATION ---
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Firebase: {e}")
    exit()

ROOT_RESOURCES_DIRECTORY = r"C:\MERN\resources"
# --------------------

def extract_mcqs_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n\n"
    except Exception as e:
        print(f"    - Error reading PDF {os.path.basename(pdf_path)}: {e}")
        return []
    
    pattern = re.compile(r'(\d+)\.\s*(.+?)\n[A-Za-z]\)\s*(.+?)\n[A-Za-z]\)\s*(.+?)\n[A-Za-z]\)\s*(.+?)\n[A-Za-z]\)\s*(.+?)\nAnswer:\s*([A-D])', re.DOTALL | re.IGNORECASE)
    
    mcqs = []
    for match in pattern.finditer(text):
        mcqs.append({
            "questionText": match.group(2).strip().replace('\n', ' '),
            "options": [match.group(3).strip(), match.group(4).strip(), match.group(5).strip(), match.group(6).strip()],
            "correctAnswer": ord(match.group(7).strip().upper()) - ord('A')
        })
    return mcqs

def main():
    print(f"🚀 Starting migration from root: '{ROOT_RESOURCES_DIRECTORY}'")
    
    if not os.path.isdir(ROOT_RESOURCES_DIRECTORY):
        print(f"❌ Error: Root directory not found.")
        return

    for root, dirs, files in os.walk(ROOT_RESOURCES_DIRECTORY):
        if os.path.basename(root) == 'Practice Questions':
            try:
                path_parts = root.split(os.sep)
                subject = path_parts[-3]
                topic = path_parts[-2]
            except IndexError:
                continue

            print(f"\n📁 Found folder for Subject: '{subject}', Topic: '{topic}'")

            # --- CORRECTED LOGIC: Process EACH PDF as a separate quiz ---
            for filename in files:
                if filename.lower().endswith(".pdf"):
                    pdf_path = os.path.join(root, filename)
                    print(f"  - Processing PDF: {filename}")
                    
                    questions = extract_mcqs_from_pdf(pdf_path)
                    
                    # Only proceed if questions were actually found in this specific PDF
                    if questions:
                        quiz_title = os.path.splitext(filename)[0]
                        quiz_title = re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', quiz_title)
                        quiz_id = f"{subject.lower()}-{topic.lower()}-{quiz_title}".replace(' ', '-').replace('_', '-')
                        
                        print(f"    - Found {len(questions)} questions. Uploading as quiz '{quiz_id}'...")

                        # Upload questions for THIS quiz
                        for question in questions:
                            question['quizId'] = quiz_id
                            db.collection('questions').add(question)
                        
                        # Set difficulty and time limit
                        difficulty = random.choice(["Easy", "Medium", "Hard"])
                        timeLimit = 0
                        if difficulty == "Hard": timeLimit = 30
                        elif difficulty == "Medium": timeLimit = 20
                        else: timeLimit = 10
                        
                        # Create ONE quiz document for THIS PDF
                        quiz_doc_ref = db.collection('quizzes').document(quiz_id)
                        quiz_doc_ref.set({
                            "title": quiz_title.replace('_', ' ').replace('-', ' '),
                            "subject": subject,
                            "topic": topic,
                            "difficulty": difficulty,
                            "timeLimit": timeLimit,
                            "questionCount": len(questions)
                        })
                        print(f"    - ✅ Successfully created quiz '{quiz_id}' in Firestore.")
                    else:
                        print(f"    - ⚠️ No questions found in {filename}.")

    print("\n\n🎉 Migration complete!")

if __name__ == "__main__":
    main()