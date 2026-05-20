import re
import time
from pathlib import Path
from typing import List, Tuple

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
VECTOR_STORE_DIR = Path(__file__).resolve().parent.parent / "vector_store"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

_faiss_index = None
_chunk_texts: List[str] = []
_index_embeddings = None


def _token_approx(text: str) -> int:
    return len(text.split()) * 2


def _chunk_text(text: str) -> List[str]:
    paragraphs = re.split(r"\n\s*\n", text)
    chunks = []
    current = []
    current_tokens = 0
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        t = _token_approx(p)
        if current_tokens + t > CHUNK_SIZE and current:
            chunks.append("\n\n".join(current))
            overlap = []
            overlap_tokens = 0
            for x in reversed(current):
                if overlap_tokens >= CHUNK_OVERLAP:
                    break
                overlap.insert(0, x)
                overlap_tokens += _token_approx(x)
            current = overlap
            current_tokens = overlap_tokens
        current.append(p)
        current_tokens += t
    if current:
        chunks.append("\n\n".join(current))
    return chunks


def _read_all_txt_files() -> List[Tuple[str, str]]:
    out = []
    if not DATA_DIR.exists():
        return out
    for path in DATA_DIR.rglob("*.txt"):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
            if text.strip():
                out.append((str(path.relative_to(DATA_DIR)), text))
        except Exception:
            continue
    return out


def _get_embeddings(client, texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    out = []
    batch_size = 20
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        r = client.embeddings.create(
            model="text-embedding-3-small",
            input=batch,
        )
        for d in r.data:
            out.append(d.embedding)
    return out


def build_index(openai_client):
    global _chunk_texts, _faiss_index, _index_embeddings
    files = _read_all_txt_files()
    all_chunks = []
    for _path, text in files:
        for c in _chunk_text(text):
            all_chunks.append(c)
    _chunk_texts = all_chunks
    if not all_chunks:
        _index_embeddings = None
        _faiss_index = None
        return
    embeddings = _get_embeddings(openai_client, all_chunks)
    _index_embeddings = embeddings
    try:
        import faiss
        dim = len(embeddings[0])
        index = faiss.IndexFlatIP(dim)
        import numpy as np
        matrix = np.array(embeddings, dtype="float32")
        faiss.normalize_L2(matrix)
        index.add(matrix)
        _faiss_index = index
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(VECTOR_STORE_DIR / "index.faiss"))
        save_chunks_for_reload()
    except Exception:
        _faiss_index = None


def load_index():
    global _faiss_index, _chunk_texts
    path = VECTOR_STORE_DIR / "index.faiss"
    if not path.exists():
        return
    try:
        import faiss
        _faiss_index = faiss.read_index(str(path))
        chunks_file = VECTOR_STORE_DIR / "chunks.json"
        if chunks_file.exists():
            import json
            with open(chunks_file, "r", encoding="utf-8") as f:
                _chunk_texts = json.load(f)
    except Exception:
        pass


def search_knowledge_base(openai_client, query: str, top_k: int = 3, score_threshold: float = 0.75) -> List[Tuple[str, float]]:
    global _faiss_index, _chunk_texts
    if not _chunk_texts:
        load_index()
    if not _chunk_texts or _faiss_index is None:
        q_emb = _get_embeddings(openai_client, [query])
        if not q_emb:
            return []
        build_index(openai_client)
        if not _chunk_texts:
            return []
    q_emb = _get_embeddings(openai_client, [query])
    if not q_emb:
        return []
    import numpy as np
    import faiss
    qv = np.array(q_emb, dtype="float32")
    faiss.normalize_L2(qv)
    scores, indices = _faiss_index.search(qv, min(top_k, len(_chunk_texts)))
    results = []
    for i, s in zip(indices[0], scores[0]):
        if i < 0 or i >= len(_chunk_texts):
            continue
        if float(s) >= score_threshold:
            results.append((_chunk_texts[i], float(s)))
    return results


def save_chunks_for_reload():
    if not _chunk_texts:
        return
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    import json
    with open(VECTOR_STORE_DIR / "chunks.json", "w", encoding="utf-8") as f:
        json.dump(_chunk_texts, f, ensure_ascii=False)
