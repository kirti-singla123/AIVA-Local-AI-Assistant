from vector_db import SimpleVectorDB
from pipeline import get_embedding
from groq import Groq

# Load the saved vector DB (no re-embedding needed!)
db = SimpleVectorDB()
db.load("chat/memory_rag/vector_store.json")
print(f"Loaded {len(db)} chunks from disk.")

# Ask a question
question = input("\nAsk something about the resume: ")

# Convert question to embedding
question_embedding = get_embedding(question)

# Search vector DB for top 3 relevant chunks
results = db.search(question_embedding, top_k=10)

print("\n--- Top matching chunks ---")
for score, text in results:
    print(f"Score: {score:.4f} | Text: {text}")

# Build context from top chunks
context = "\n".join([text for score, text in results])

# Ask Groq to answer using this context
groq_client = Groq(api_key=settings.GROQ_API_KEY)

prompt = f"""Answer the question using only the context below.

Context:
{context}

Question: {question}
"""

response = groq_client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[{"role": "user", "content": prompt}]
)

print("\n--- Answer ---")
print(response.choices[0].message.content)