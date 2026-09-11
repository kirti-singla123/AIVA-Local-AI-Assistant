from pypdf import PdfReader
from chat.memory_rag.vector_db import SimpleVectorDB


model = None


def get_model():
    global model

    if model is None:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")

    return model


def read_pdf(filepath):
    reader = PdfReader(filepath)
    full_text = ""

    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    return full_text


def chunk_text(text, lines_per_chunk=5):
    lines = [line.strip() for line in text.split("\n") if line.strip() != ""]
    chunks = []

    for i in range(0, len(lines), lines_per_chunk):
        chunk = " ".join(lines[i:i + lines_per_chunk])
        chunks.append(chunk)

    return chunks


def get_embedding(text):
    return get_model().encode(text).tolist()


if __name__ == "__main__":
    text = read_pdf("chat/memory_rag/data/Kirti_FullStack_Developer_N.pdf")
    chunks = chunk_text(text)

    print(f"Total chunks: {len(chunks)}")

    db = SimpleVectorDB()

    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        db.add(doc_id=str(i), text=chunk, vector=embedding)
        print(f"Embedded chunk {i + 1}/{len(chunks)}")

    print(f"\nTotal items stored in vector DB: {len(db)}")

    db.save("chat/memory_rag/vector_store.json")
    print("Saved to disk: vector_store.json")
