from typing import Optional, List, Tuple
from openai import OpenAI
from services.config_loader import get_config
from services.language_service import detect_language, is_hinglish
from services.file_indexer import search_knowledge_base, build_index
from services.scraper import scrape_artofliving, scrape_external_links, search_scraped_content

GREETINGS = {
    "hello": "Hello! 😊 How can I assist you today?",
    "hi": "Hello! 😊 How can I assist you today?",
    "hey": "Hello! 😊 How can I assist you today?",
    "namaste": "Namaste 🙏 Jai Gurudev! How may I help you?",
    "namaskar": "Namaste 🙏 Jai Gurudev! How may I help you?",
    "jai gurudev": "Jai Gurudev! 🙏 How can I serve you today?",
    "good morning": "Good morning! ☀️ How can I help you today?",
    "good evening": "Good evening! 🌙 How can I help you today?",
    "good night": "Good night! 🌙 Is there anything you need before you go?",
}
_website_content: Optional[List[dict]] = None


def _is_greeting(text: str) -> Optional[str]:
    t = text.strip().lower()
    for key, reply in GREETINGS.items():
        if key in t and len(t) < 50:
            return reply
    return None


async def get_platform_answer(openai_client: OpenAI, query: str, language: str) -> dict:
    global _website_content
    cfg = get_config()
    lang_name = "English" if language == "en" else "Hindi"
    sys_prompt = (
        f"You are AOL Assistant for Art of Living. Answer ONLY using the provided context. "
        f"Do not use general knowledge. If context is insufficient, say so. "
        f"Always respond in {lang_name}. Use Markdown formatting (bold, lists, arrows). "
        f"Keep answers concise and helpful."
    )

    reply = _is_greeting(query)
    if reply:
        return {"answer": reply, "source": "greeting", "confidence": 1.0}

    if _website_content is None:
        _website_content = await scrape_artofliving()
    step1 = search_scraped_content(query, _website_content)
    if step1 and step1[0][1] > 0.3:
        context = "\n\n---\n\n".join([s[0] for s in step1[:3]])
        try:
            r = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
                ],
                max_tokens=1024,
            )
            answer = (r.choices[0].message.content or "").strip()
            if answer:
                return {"answer": answer, "source": "website", "confidence": step1[0][1]}
        except Exception:
            pass
        return {"answer": context[:1500], "source": "website", "confidence": step1[0][1]}

    kb = search_knowledge_base(openai_client, query, top_k=3, score_threshold=0.5)
    if kb:
        context = "\n\n".join([c[0] for c in kb])
        try:
            r = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
                ],
                max_tokens=1024,
            )
            answer = (r.choices[0].message.content or "").strip()
            if answer:
                return {"answer": answer, "source": "text_file", "confidence": float(kb[0][1])}
        except Exception:
            pass
        return {"answer": kb[0][0][:1500], "source": "text_file", "confidence": float(kb[0][1])}

    external = await scrape_external_links()
    step3 = search_scraped_content(query, external) if external else []
    if step3 and step3[0][1] > 0.3:
        context = "\n\n---\n\n".join([s[0] for s in step3[:3]])
        try:
            r = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
                ],
                max_tokens=1024,
            )
            answer = (r.choices[0].message.content or "").strip()
            if answer:
                return {"answer": answer, "source": "external_link", "confidence": step3[0][1]}
        except Exception:
            pass
        return {"answer": context[:1500], "source": "external_link", "confidence": step3[0][1]}

    fallback = (
        "Namaste 🙏 I don't have specific information about this in my current knowledge base.\n\n"
        f"📧 Email: {cfg.get('contact_email', 'info@artofliving.org')}\n"
        f"🌐 Website: {cfg.get('website', 'https://www.artofliving.org')}\n"
        f"📞 Phone: {cfg.get('contact_phone', '')}\n\n"
        "Please reach out to our team — we'll personally assist you!"
    )
    return {"answer": fallback, "source": "fallback", "confidence": 0.0}
