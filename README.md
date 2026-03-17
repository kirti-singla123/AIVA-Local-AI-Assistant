# 🤖 AIVA – Local AI Virtual Assistant

**AIVA (Artificial Intelligence Virtual Assistant)** is a locally running AI chatbot designed to demonstrate how modern **Large Language Models (LLMs)** can be integrated into a full-stack web application.

The project combines a **React-based chat interface**, a **Django backend**, and a **local AI model powered by Ollama** to allow users to interact with an AI assistant directly from their system.

Unlike cloud-based AI tools, AIVA runs **entirely on a local environment**, making it suitable for experimentation, learning, and private AI deployments.

---

## 🚀 Features

- ✅ Interactive AI chatbot interface  
- ✅ Local LLM integration using **Ollama**  
- ✅ Powered by **Gemma 3.4B model**  
- ✅ Full-stack architecture with **React + Django**  
- ✅ Real-time question and answer interaction  
- ✅ Local AI processing without external AI services  

---

## 🧠 Technologies Used

### Frontend
- React.js
- JavaScript
- HTML
- CSS

### Backend
- Python
- Django
- Django REST Framework

### AI / LLM
- Ollama
- Gemma 3.4B Model

### Tools
- Git
- GitHub
- REST APIs

---

## 🏷️ Keywords & Technologies

**AI**, **Chatbot**, **LLM**, **Local AI**, **Ollama**, **Gemma 3.4B**, **Django**, **React**, **Python**, **Full-Stack**

## ⚙️ System Architecture

```
User
 ↓
React Frontend (Chat Interface)
 ↓
Django Backend (API Layer)
 ↓
Ollama Runtime
 ↓
Gemma 3.4B Language Model
 ↓
AI Response
```

The **React frontend** captures user input and sends it to the **Django backend API**.  
The backend communicates with the **Ollama runtime**, which processes the request using the **Gemma 3.4B model** and returns the generated response back to the user interface.

---

## 📁 Project Structure

```
AIVA
│
├── backend
│   ├── Django project
│   └── chat application
│
├── frontend
│   └── React chat interface
│
├── .gitignore
└── README.md
```

---

## 🎯 Project Goal

This project explores how **locally hosted AI models** can be integrated into modern web applications using a **full-stack architecture**.

The project demonstrates:

- Integration of **local LLMs** with web applications  
- Building a **chat-based AI interface**  
- API communication between **frontend and backend systems**  
- Combining **AI with full-stack web development**

---

## 🚀 How to Run Locally

1. Clone this repo:


git clone https://github.com/kirti-singla123/AIVA-Local-AI-Assistant


2. Install dependencies:


pip install -r requirements.txt


3. Make sure you have **Ollama installed** and **Gemma 3.4B model downloaded**.

4. Run the backend and frontend:


Backend/manage.py runserver
Frontend/npm start


5. Open the chat in your browser and interact with AIVA!

---

### Screenshots

#### Chat Interface
![Chat Interface](Screenshots/Aiva_chatbot.PNG)

#### Example Conversation
![Example Conversation](Screenshots/Conversation.PNG)

#### Another Example
![Conversation 1](Screenshots/conversation1.PNG)

---

## 👩‍💻 Author

**Kirti Singla**

Full Stack Developer  
Python • Django • React • AI Integration
