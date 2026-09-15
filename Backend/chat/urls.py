from django.urls import path

from .views import chat_view, home, transcribe_view


urlpatterns = [
    path("chat/", chat_view, name="chat"),
    path("transcribe/", transcribe_view, name="transcribe"),
    path("", home),
]