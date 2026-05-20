import os
import sys
from pathlib import Path

# Ensure backend directory is on path when running as uvicorn main:app from backend/
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from dotenv import load_dotenv
load_dotenv(_backend_dir / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from routers import chat, analytics, settings, history
from services.config_loader import get_config
from services.file_indexer import build_index

app = FastAPI(title="AOL Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(history.router)


class DataFolderHandler(FileSystemEventHandler):
    def __init__(self, openai_client):
        self.openai_client = openai_client

    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".txt"):
            try:
                build_index(self.openai_client)
            except Exception:
                pass


@app.on_event("startup")
async def startup():
    get_config()
    key = os.environ.get("OPENAI_API_KEY")
    if key:
        client = OpenAI(api_key=key)
        try:
            build_index(client)
        except Exception:
            pass
        data_dir = Path(__file__).resolve().parent / "data"
        if data_dir.exists():
            try:
                observer = Observer()
                observer.schedule(DataFolderHandler(client), str(data_dir), recursive=True)
                observer.start()
            except Exception:
                pass


@app.get("/api/health")
def health():
    return {"status": "ok"}
