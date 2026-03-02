from typing import Optional, Any
from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client, Client
import os

router = APIRouter(prefix="/api", tags=["settings"])

_supabase: Optional[Client] = None


def get_supabase() -> Optional[Client]:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            _supabase = create_client(url, key)
    return _supabase


class SettingsBody(BaseModel):
    session_id: str
    preferences: Optional[dict] = None


@router.get("/settings")
async def get_settings(session_id: str):
    sb = get_supabase()
    if not sb:
        return {"preferences": {}}
    try:
        r = sb.table("users").select("preferences").eq("session_id", session_id).execute()
        if r.data and len(r.data) > 0 and r.data[0].get("preferences"):
            return {"preferences": r.data[0]["preferences"]}
    except Exception:
        pass
    return {"preferences": {}}


@router.post("/settings")
async def save_settings(body: SettingsBody):
    sb = get_supabase()
    if not sb:
        return {"success": True}
    try:
        r = sb.table("users").select("id").eq("session_id", body.session_id).execute()
        prefs = body.preferences or {}
        if r.data and len(r.data) > 0:
            sb.table("users").update({"preferences": prefs, "last_active": "now()"}).eq("id", r.data[0]["id"]).execute()
        else:
            sb.table("users").insert({"session_id": body.session_id, "preferences": prefs}).execute()
    except Exception:
        pass
    return {"success": True}
