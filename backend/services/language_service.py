import re
from typing import Optional

try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0
    _LANGDETECT_AVAILABLE = True
except Exception:
    _LANGDECT_AVAILABLE = False

# Common Hindi words in Roman script (subset for Hinglish detection)
HINDI_ROMAN_WORDS = {
    "hai", "ho", "main", "mera", "meri", "apna", "kya", "ki", "ke", "ka", "ko",
    "mein", "se", "par", "aur", "bhi", "nahi", "haan", "ab", "kyun", "jab",
    "toh", "tha", "the", "thi", "hum", "tum", "aap", "namaste", "gurudev",
    "jai", "kripa", "dhanyavaad", "shukriya", "achha", "theek", "sahi",
}

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "bn": "Bengali",
    "mr": "Marathi",
}


def detect_language(text: str) -> str:
    if not text or not text.strip():
        return "en"
    if not _LANGDETECT_AVAILABLE:
        return "en"
    try:
        lang = detect(text.strip())
        if lang in ("hi", "en", "ta", "te", "kn", "bn", "mr"):
            return lang
        if lang == "ur":
            return "hi"
        return "en"
    except Exception:
        return "en"


def is_hinglish(text: str) -> bool:
    if not text or len(text) < 10:
        return False
    words = set(re.findall(r"[a-zA-Z]+", text.lower()))
    if not words:
        return False
    hindi_count = sum(1 for w in words if w in HINDI_ROMAN_WORDS)
    return (hindi_count / len(words)) > 0.3


def get_language_name(code: str) -> str:
    return LANGUAGE_NAMES.get(code, "English")
