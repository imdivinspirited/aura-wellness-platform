from typing import Optional, List
from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os

router = APIRouter(prefix="/api", tags=["history"])

_supabase: Optional[Client] = None


def get_supabase() -> Optional[Client]:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            _supabase = create_client(url, key)
    return _supabase


@router.get("/history")
async def get_history(session_id: str, search: Optional[str] = None, limit: int = 20, offset: int = 0):
    sb = get_supabase()
    if not sb:
        return {"conversations": []}
    try:
        r = sb.table("users").select("id").eq("session_id", session_id).execute()
        if not r.data or len(r.data) == 0:
            return {"conversations": []}
        user_id = r.data[0]["id"]
        q = sb.table("conversations").select("id,started_at,title,message_count,mode").eq("user_id", user_id).order("started_at", desc=True).range(offset, offset + limit - 1)
        convs = q.execute()
        out = []
        for c in (convs.data or []):
            if search:
                msgs = sb.table("messages").select("content").eq("conversation_id", c["id"]).execute()
                content = " ".join((m.get("content") or "" for m in (msgs.data or [])))
                if search.lower() not in content.lower():
                    continue
            out.append({
                "id": c["id"],
                "started_at": c.get("started_at"),
                "title": c.get("title") or "Chat",
                "message_count": c.get("message_count") or 0,
                "mode": c.get("mode") or "platform",
            })
        return {"conversations": out}
    except Exception:
        return {"conversations": []}


@router.get("/history/{conversation_id}")
async def get_conversation(conversation_id: str, session_id: str):
    sb = get_supabase()
    if not sb:
        return {"messages": []}
    try:
        conv = sb.table("conversations").select("id,user_id").eq("id", conversation_id).execute()
        if not conv.data or len(conv.data) == 0:
            raise HTTPException(status_code=404, detail="Not found")
        user = sb.table("users").select("id").eq("session_id", session_id).execute()
        if not user.data or user.data[0]["id"] != conv.data[0]["user_id"]:
            raise HTTPException(status_code=404, detail="Not found")
        msgs = sb.table("messages").select("id,role,content,created_at,data_source").eq("conversation_id", conversation_id).order("created_at").execute()
        return {"messages": msgs.data or []}
    except HTTPException:
        raise
    except Exception:
        return {"messages": []}


@router.delete("/history/{conversation_id}")
async def delete_conversation(conversation_id: str, session_id: str):
    sb = get_supabase()
    if not sb:
        return {"success": True}
    try:
        conv = sb.table("conversations").select("id,user_id").eq("id", conversation_id).execute()
        if not conv.data or len(conv.data) == 0:
            raise HTTPException(status_code=404, detail="Not found")
        user = sb.table("users").select("id").eq("session_id", session_id).execute()
        if not user.data or user.data[0]["id"] != conv.data[0]["user_id"]:
            raise HTTPException(status_code=404, detail="Not found")
        sb.table("messages").delete().eq("conversation_id", conversation_id).execute()
        sb.table("conversations").delete().eq("id", conversation_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception:
        return {"success": True}


@router.delete("/history/all")
async def clear_all_history(session_id: str):
    sb = get_supabase()
    if not sb:
        return {"success": True}
    try:
        r = sb.table("users").select("id").eq("session_id", session_id).execute()
        if not r.data or len(r.data) == 0:
            return {"success": True}
        user_id = r.data[0]["id"]
        convs = sb.table("conversations").select("id").eq("user_id", user_id).execute()
        for c in (convs.data or []):
            sb.table("messages").delete().eq("conversation_id", c["id"]).execute()
        sb.table("conversations").delete().eq("user_id", user_id).execute()
        return {"success": True}
    except Exception:
        return {"success": True}


@router.post("/feedback")
async def post_feedback(message_id: str, rating: int):
    if rating not in (-1, 1):
        raise HTTPException(status_code=400, detail="rating must be 1 or -1")
    sb = get_supabase()
    if not sb:
        return {"success": True}
    try:
        sb.table("messages").update({"rating": rating}).eq("id", message_id).execute()
    except Exception:
        pass
    return {"success": True}
