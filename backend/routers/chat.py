import time
import os
from typing import Optional
from openai import OpenAI
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client

from services.config_loader import get_config
from services.language_service import detect_language, is_hinglish, get_language_name
from services.rag_service import get_platform_answer

router = APIRouter(prefix="/api", tags=["chat"])

_openai: Optional[OpenAI] = None
_supabase: Optional[Client] = None


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        key = os.environ.get("OPENAI_API_KEY")
        if not key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
        _openai = OpenAI(api_key=key)
    return _openai


def get_supabase() -> Optional[Client]:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            _supabase = create_client(url, key)
    return _supabase


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    mode: str = "platform"
    session_id: str


class ChatResponse(BaseModel):
    reply: str
    source: str
    suggested_questions: list
    conversation_id: str
    response_time_ms: int


def _ensure_user(session_id: str) -> Optional[str]:
    sb = get_supabase()
    if not sb:
        return None
    try:
        r = sb.table("users").select("id").eq("session_id", session_id).execute()
        if r.data and len(r.data) > 0:
            sb.table("users").update({"last_active": "now()"}).eq("id", r.data[0]["id"]).execute()
            return r.data[0]["id"]
        ins = sb.table("users").insert({"session_id": session_id}).execute()
        if ins.data and len(ins.data) > 0:
            return ins.data[0]["id"]
    except Exception:
        pass
    return None


def _ensure_conversation(user_id: str, mode: str, title: str, lang: str) -> Optional[str]:
    sb = get_supabase()
    if not sb:
        return None
    try:
        ins = sb.table("conversations").insert({
            "user_id": user_id,
            "mode": mode,
            "title": title[:200],
            "language_detected": lang,
        }).execute()
        if ins.data and len(ins.data) > 0:
            return ins.data[0]["id"]
    except Exception:
        pass
    return None


def _get_or_create_conversation(session_id: str, conversation_id: Optional[str], mode: str, title: str, lang: str) -> Optional[str]:
    user_id = _ensure_user(session_id)
    if not user_id:
        return None
    sb = get_supabase()
    if not sb:
        return _ensure_conversation(user_id, mode, title, lang)
    if conversation_id:
        try:
            r = sb.table("conversations").select("id").eq("id", conversation_id).execute()
            if r.data and len(r.data) > 0:
                return conversation_id
        except Exception:
            pass
    return _ensure_conversation(user_id, mode, title, lang)


def _save_messages(sb: Client, conv_id: str, user_content: str, assistant_content: str, source: str, lang: str, response_time_ms: int, suggested: list):
    try:
        sb.table("messages").insert({
            "conversation_id": conv_id,
            "role": "user",
            "content": user_content,
            "language": lang,
        }).execute()
        sb.table("messages").insert({
            "conversation_id": conv_id,
            "role": "assistant",
            "content": assistant_content,
            "data_source": source,
            "language": lang,
            "response_time_ms": response_time_ms,
            "suggested_questions": suggested,
        }).execute()
        r = sb.table("conversations").select("message_count").eq("id", conv_id).execute()
        count = 0
        if r.data and len(r.data) > 0:
            count = r.data[0].get("message_count") or 0
        sb.table("conversations").update({"message_count": count + 2}).eq("id", conv_id).execute()
    except Exception:
        pass


def _suggest_followups(openai_client: OpenAI, question: str, answer: str, lang: str) -> list:
    try:
        r = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Given this Q&A, suggest exactly 3 short follow-up questions. Return only the questions, one per line, no numbering."},
                {"role": "user", "content": f"Q: {question}\nA: {answer[:500]}"},
            ],
            max_tokens=100,
        )
        text = (r.choices[0].message.content or "").strip()
        lines = [l.strip() for l in text.splitlines() if l.strip()][:3]
        return lines
    except Exception:
        return []


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    start = time.time()
    message = (req.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    mode = "global" if req.mode == "global" else "platform"
    lang = detect_language(message)
    if is_hinglish(message):
        lang = "hi"
    openai_client = get_openai()
    cfg = get_config()

    if mode == "platform":
        result = await get_platform_answer(openai_client, message, lang)
        reply = result["answer"]
        source = result["source"]
    else:
        sys_prompt = (
            "You are a helpful assistant for the Art of Living website. "
            "Answer in the same language the user wrote in. Use Markdown (bold, lists, tables). "
            "Support calculations, translations, general knowledge, and current events."
        )
        r = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": message},
            ],
            max_tokens=1024,
        )
        reply = (r.choices[0].message.content or "").strip()
        source = "global"

    response_time_ms = int((time.time() - start) * 1000)
    suggested = _suggest_followups(openai_client, message, reply, lang)

    conv_id = _get_or_create_conversation(req.session_id, req.conversation_id, mode, message, lang)
    if conv_id:
        sb = get_supabase()
        if sb:
            _save_messages(sb, conv_id, message, reply, source, lang, response_time_ms, suggested)
    else:
        conv_id = "local-" + str(int(start * 1000))

    return ChatResponse(
        reply=reply,
        source=source,
        suggested_questions=suggested,
        conversation_id=conv_id,
        response_time_ms=response_time_ms,
    )
