from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from groq import Groq
import json

from chat.memory_rag.vector_db import SimpleVectorDB
from chat.memory_rag.pipeline import get_embedding

rag_db = SimpleVectorDB()
rag_db.load("chat/memory_rag/vector_store.json")

# Set this to True to use local Ollama, False to use Groq API
USE_LOCAL_OLLAMA = False


@csrf_exempt
def chat_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        question = data.get("message", "")

        client = Groq(api_key=settings.GROQ_API_KEY)

        # Step 1: Classify the question
        classify_prompt = f"""You are a router. Decide if this question is asking about a specific person's resume, background, identity, or professional profile — including things like their name, contact details, work history, education, skills, or certifications.

If the question could reasonably be answered by looking at that person's resume, answer "yes". Otherwise, answer "no".

Answer with only one word: yes or no.

Question: {question}
"""

        classify_response = client.chat.completions.create(
            messages=[{"role": "user", "content": classify_prompt}],
            model="openai/gpt-oss-120b",
        )

        is_resume_related = (
            classify_response.choices[0].message.content.strip().lower()
        )

        # Step 2: Route based on classification
        if "yes" in is_resume_related:
            question_embedding = get_embedding(question)
            results = rag_db.search(question_embedding, top_k=10)
            context = "\n".join([text for score, text in results])

            prompt = f"""Answer the question using only the context below.

Context:
{context}

Question: {question}
"""
        else:
            prompt = f"""
You are AIVA, a helpful AI assistant.
Respond in a clear, natural, and professional tone.
Do NOT use emojis, exclamation marks, or overly casual/affectionate language.
Do NOT mention current date or time unless the user asks.

User: {question}
Assistant:
"""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-120b",
        )

        ai_reply = chat_completion.choices[0].message.content.strip()

        return JsonResponse({"response": ai_reply})

    return JsonResponse({"error": "Only POST allowed"})


# ============================================================
# 🎤 SPEECH-TO-TEXT
# ============================================================

@csrf_exempt
def transcribe_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    if "audio" not in request.FILES:
        return JsonResponse(
            {"error": "No audio file received"},
            status=400,
        )

    audio_file = request.FILES["audio"]

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        transcription = client.audio.transcriptions.create(
            file=(audio_file.name, audio_file.read()),
            model="whisper-large-v3-turbo",
            response_format="json",
            language="en",
        )

        return JsonResponse({
            "text": transcription.text
        })

    except Exception as error:
        print("Speech-to-text error:", error)

        return JsonResponse(
            {"error": "Speech transcription failed"},
            status=500,
        )


def home(request):
    return HttpResponse("""
    <html>
    <head>
        <title>AIVA Backend</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #e0f7fa, #f1f8e9);
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background: #ffffff;
                padding: 40px 60px;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
            }
            h1 {
                color: #0f4c75;
                margin-bottom: 20px;
            }
            p {
                color: #333333;
                margin: 10px 0;
            }
            .highlight {
                color: #3282b8;
                font-weight: bold;
            }
            ul {
                text-align: left;
                padding-left: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>AIVA Backend</h1>
            <p>Welcome to the <span class="highlight">AIVA AI Assistant</span> backend.</p>
            <p>This backend currently handles:</p>
            <ul>
                <li>Chat handling</li>
                <li>Speech-to-text transcription</li>
                <li>API endpoints for connected frontend apps</li>
            </ul>
            <p><span class="highlight">Frontend Connected:</span> React App</p>
            <p><span class="highlight">Developed by:</span> Kirti Singla</p>
            <p><span class="highlight">Status:</span> Active & Running</p>
        </div>
    </body>
    </html>
    """)