from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, pdfplumber, docx, urllib.parse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "Upload successful", "filename": file.filename, "name": file.filename}


@app.get("/resumes")
def get_resumes():
    resumes = []
    for filename in os.listdir(UPLOAD_DIR):
        resumes.append({
            "name": filename,
            "filename": filename
        })
    return resumes


@app.get("/resume/{filename}")
def read_resume(filename: str):
    filename = urllib.parse.unquote(filename)
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    text = ""
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join([p.extract_text() or "" for p in pdf.pages])
    elif filename.lower().endswith((".docx", ".doc")):
        doc = docx.Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs if p.text])
    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

    skills = []
    for skill in ["Python", "Java", "SQL", "FastAPI", "React", "Node", "Django", "AWS", "Docker", "Kubernetes"]:
        if skill.lower() in text.lower():
            skills.append(skill)

    return {"name": filename, "content": text, "skills": skills or ["Not Extracted"]}


@app.delete("/delete/{filename}")
def delete_resume(filename: str):
    filename = urllib.parse.unquote(filename)
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(file_path)
    return {"message": f"{filename} deleted successfully"}


@app.post("/match")
async def match_resume_to_job(description: str = Form(...)):
    matches = []
    skills = ["Python", "Java", "SQL", "FastAPI", "React", "Node", "Django", "AWS", "Docker", "Kubernetes"]
    job_skills = [s for s in skills if s.lower() in description.lower()]

    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        text = ""
        if filename.lower().endswith(".pdf"):
            with pdfplumber.open(file_path) as pdf:
                text = "\n".join([p.extract_text() or "" for p in pdf.pages])
        elif filename.lower().endswith((".docx", ".doc")):
            doc = docx.Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs if p.text])
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

        matched = [s for s in job_skills if s.lower() in text.lower()]
        score = round(len(matched) / len(job_skills) * 100, 2) if job_skills else 0

        matches.append({
            "filename": filename,
            "matched_skills": matched,
            "match_score": score
        })

    return {"job_skills": job_skills, "matches": sorted(matches, key=lambda x: x["match_score"], reverse=True)}

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

frontend_dir = os.path.join(os.path.dirname(__file__), "../frontend/build")

if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(frontend_dir, "index.html"))
