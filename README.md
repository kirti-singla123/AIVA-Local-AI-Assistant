# 🤖 AIVA – AI Virtual Assistant

**AIVA (Artificial Intelligence Virtual Assistant)** is a full-stack AI chatbot application built with **React.js, Django, Python, RAG, vector search, and LLM APIs**.

The project started as a locally running AI assistant using **Ollama and a local LLM** and has evolved into a **Retrieval-Augmented Generation (RAG) based AI assistant** capable of answering questions using information retrieved from documents.

🚀 Live Demo: https://aiva-local-ai-assistant.netlify.app/

---

## 🚀 Features

* ✅ Interactive AI chatbot interface
* ✅ React-based modern chat UI
* ✅ Django REST API backend
* ✅ LLM integration using **Groq**
* ✅ Retrieval-Augmented Generation (RAG)
* ✅ PDF document processing
* ✅ Automatic text extraction from PDFs
* ✅ Text chunking for document processing
* ✅ Semantic embeddings using **FastEmbed**
* ✅ BAAI/bge-small-en-v1.5 embedding model
* ✅ Local vector database implementation
* ✅ Cosine similarity based semantic search
* ✅ Retrieves relevant document chunks before generating an answer
* ✅ Context-aware AI responses
* ✅ Environment variable based API configuration
* ✅ Full-stack React + Django architecture

---

## 🧠 How AIVA Works

AIVA uses a **Retrieval-Augmented Generation (RAG)** pipeline.

Instead of sending the entire document directly to the LLM, the application first converts the document into searchable vector embeddings.

When the user asks a question:

1. The question is converted into an embedding.
2. The vector database searches for the most relevant document chunks.
3. The relevant chunks are added to the prompt as context.
4. Groq's LLM generates an answer using the retrieved context.
5. The answer is returned to the React frontend.

This allows AIVA to answer questions based on the information stored in its documents.

---

# 🔄 RAG Architecture

## 1️⃣ Document Ingestion Pipeline

```text
PDF Document
     ↓
PDF Text Extraction
     ↓
Text Chunking
     ↓
FastEmbed
        ↓
BAAI/bge-small-en-v1.5
        ↓
Vector Embeddings
     ↓
Vector Database
     ↓
vector_store.json
```

The document is processed once and its embeddings are stored in the vector database.

---

## 2️⃣ Question / Query Pipeline

```text
User Question
     ↓
React Frontend
     ↓
Django Backend
     ↓
FastEmbed
        ↓
BAAI/bge-small-en-v1.5
        ↓
Question Embedding
     ↓
Cosine Similarity Search
     ↓
Top Relevant Chunks
     ↓
Context
     ↓
Groq LLM
     ↓
AI Answer
     ↓
React Frontend
```

The **same embedding model** (`BAAI/bge-small-en-v1.5`) is used for both document chunks and user questions so they exist in the same embedding space.

---

# 🧩 Technologies Used

## Frontend

* React.js
* JavaScript
* HTML
* CSS
* npm

## Backend

* Python
* Django
* Django REST Framework
* SQLite
* Gunicorn

## AI / RAG

* Retrieval-Augmented Generation (RAG)
* Groq API
* FastEmbed
* BAAI/bge-small-en-v1.5
* Cosine similarity
* Local vector database
* PDF text extraction using `pypdf`

## Earlier Local AI Implementation

The initial version of AIVA used:

* Ollama
* Local LLM
* Local AI processing

The project was later enhanced to use a RAG architecture with **FastEmbed for embeddings** and **Groq for LLM inference**.

## Tools

* Git
* GitHub
* VS Code
* REST APIs
* Environment variables

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     User / Browser   │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      Chat UI        │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │   Django Backend    │
                    │      REST API       │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │ FastEmbed           │
                    │ BAAI/bge-small-en-v1.5│
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │   Vector Database   │
                    │  Cosine Similarity  │
                    └──────────┬──────────┘
                               │
                         Relevant Context
                               │
                               ↓
                    ┌─────────────────────┐
                    │      Groq LLM       │
                    │   Answer Generation │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │    AI Response      │
                    └─────────────────────┘
```

---

# 📚 RAG Implementation

AIVA contains a simple custom vector database implementation.

The document ingestion pipeline:

```python
PDF
→ Text Extraction
→ Chunking
→ Embedding
→ Vector Storage
```

The application uses:

```text
FastEmbed
        +
BAAI/bge-small-en-v1.5
```

to generate numerical vector representations of text.

The vectors are stored in:

```text
vector_store.json
```

When a user asks a question, the same embedding model converts the question into a vector.

The application then calculates **cosine similarity** between the question vector and stored document vectors.

The most relevant chunks are retrieved and provided to the Groq LLM as context.

---

# 📁 Project Structure

```text
AIVA-Local-AI-Assistant
│
├── backend
│   │
│   ├── aiva_backend
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   │
│   ├── chat
│   │   │
│   │   ├── memory_rag
│   │   │   ├── data
│   │   │   │   └── PDF document
│   │   │   │
│   │   │   ├── pipeline.py
│   │   │   ├── ask.py
│   │   │   ├── vector_db.py
│   │   │   └── vector_store.json
│   │   │
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── ...
│   │
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── .gitignore
│
├── frontend
│   │
│   ├── src
│   │   ├── components
│   │   │   ├── ChatPanel.js
│   │   │   ├── ChatPanel.css
│   │   │   ├── PlanetOrb.jsx
│   │   │   ├── PlanetOrb.css
│   │   │   ├── CallOrb.jsx
│   │   │   └── CallOrb.css
│   │   │
│   │   └── ...
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

# ⚙️ Environment Variables

API credentials are stored using environment variables rather than hardcoded in the source code.

Example:

```text
GROQ_API_KEY=your_api_key_here
```

**Never commit real API keys or secrets to GitHub.**

---

# 🚀 How to Run Locally

## 1. Clone the repository

```bash
git clone https://github.com/kirti-singla123/AIVA-Local-AI-Assistant.git
```

```bash
cd AIVA-Local-AI-Assistant
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the backend directory:

```text
GROQ_API_KEY=your_api_key_here
```

---

## 4. Run Django Backend

```bash
python manage.py runserver
```

The backend will run locally through Django's development server.

---

## 5. Run React Frontend

Open another terminal and navigate to:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start React:

```bash
npm start
```

---

# 🧪 Testing the RAG Pipeline

The RAG pipeline can be tested independently from the command line.

### Document ingestion

```bash
python -m chat.memory_rag.pipeline
```

This:

* Reads the PDF
* Extracts text
* Creates chunks
* Generates embeddings
* Stores vectors
* Saves the vector database

### Question answering

```bash
python -m chat.memory_rag.ask
```

The application then:

* Loads the saved vector database
* Converts the user's question into an embedding
* Searches for relevant chunks
* Sends the retrieved context to Groq
* Generates an AI response

---

# ☁️ Deployment

The deployment architecture is:

```text
React Frontend
      ↓
   Netlify
      ↓
Django Backend
      ↓
   Render
      ↓
FastEmbed
BAAI/bge-small-en-v1.5
      ↓
Vector Database
      ↓
Groq API
```

The React frontend can be deployed separately from the Django backend.

The backend uses `requirements.txt` to install the required Python dependencies, including:

```text
Django
fastembed
pypdf
groq
gunicorn
```

---

# 🎯 Project Goals

AIVA demonstrates how modern AI capabilities can be combined with full-stack development.

The project explores:

* Full-stack AI application development
* React + Django integration
* REST APIs
* LLM integration
* Retrieval-Augmented Generation
* Vector embeddings
* Semantic search
* Document-based question answering
* Local AI experimentation
* AI application architecture

---

# 🔮 Future Improvements

Possible future enhancements include:

* 🔹 Multiple document support
* 🔹 Better document chunking strategies
* 🔹 Persistent production vector database
* 🔹 Conversation memory
* 🔹 Streaming AI responses
* 🔹 User authentication
* 🔹 More advanced RAG pipelines
* 🔹 Reranking of retrieved documents
* 🔹 AI agents and tool calling
* 🔹 MCP integration
* 🔹 Cloud deployment and scaling
* 🔹 Improved RAG evaluation and security

---

# 📸 Screenshots

## 1. Main AIVA Interface

![Main AIVA Interface](Screenshots/1Main%20Chat%20Interface.png)

## 2. General Conversation

![General Conversation](Screenshots/AI%20Capabilities2.png)

## 3. RAG Question Answering

![RAG Question](Screenshots/RAG%20Question.png)

## 4. Voice Interaction

![Voice Interaction](Screenshots/Voice%20Interaction.png)

## RAG Question Answering

Add screenshots showing questions being answered using information retrieved from the document.

---

# 🔄 Evolution of AIVA

AIVA initially used **Ollama with the Gemma 3.4B model** for local LLM inference.

The architecture was later upgraded to use the **Groq API for LLM inference** and **FastEmbed with the BAAI/bge-small-en-v1.5 model for embeddings**.

### Technology Evolution

```text
LLM:
Ollama + Gemma 3.4B
        ↓
Groq API + LLM

Embeddings:
Ollama + Nomic Embedding Model
        ↓
Sentence Transformers + all-MiniLM-L6-v2
        ↓
FastEmbed + BAAI/bge-small-en-v1.5

The embedding system was upgraded from Sentence Transformers to FastEmbed to reduce memory and dependency overhead and make the RAG pipeline more suitable for cloud deployment on limited resources.

This evolution transformed AIVA from a locally hosted AI chatbot into a **RAG-based full-stack AI application**.```


# 👩‍💻 Author

**Kirti Singla**

Full Stack Developer

**Python • Django • React • AI • RAG**

---

## 🏷️ Keywords

**AI, Artificial Intelligence, Chatbot, LLM, RAG, Retrieval-Augmented Generation, Vector Database, Embeddings, Semantic Search, FastEmbed + BAAI/bge-small-en-v1.5, Groq, Django, Django REST Framework, React, Python, Full Stack Development, AI Application, Document Q&A**

---

