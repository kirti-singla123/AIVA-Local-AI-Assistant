from django.urls import path
from .views import chat_view, home


urlpatterns = [
    path('chat/', chat_view, name='chat'),
    path('', home),  # <-- root URL

]
