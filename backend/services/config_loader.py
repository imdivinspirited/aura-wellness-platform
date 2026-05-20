import os
import json
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CONFIG_PATH = DATA_DIR / "config.json"

_config: Optional[dict] = None


def load_config() -> dict:
    global _config
    if _config is not None:
        return _config
    if not CONFIG_PATH.exists():
        _config = {
            "organization": "Art of Living Foundation",
            "website": "https://www.artofliving.org",
            "contact_email": "info@artofliving.org",
            "contact_phone": "+91-80-67262626",
            "fallback_message": "Namaste! I don't have specific information about this query.",
            "primary_domain": "artofliving.org",
            "bot_name": "AOL Assistant",
            "greeting_message": "Namaste! 🙏 I'm your AOL Assistant. How can I help you today?",
        }
        return _config
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        _config = json.load(f)
    return _config


def get_config() -> dict:
    return load_config()
