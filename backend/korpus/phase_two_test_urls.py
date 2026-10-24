"""Exercise retained phase-two code without exposing it in the MVP router."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from turkiy_korpus.urls import urlpatterns as mvp_patterns
from . import mvp_api

router = DefaultRouter()
router.register('books', mvp_api.BookViewSet, basename='book')
router.register('lessons', mvp_api.LessonViewSet, basename='lesson')
router.register('research', mvp_api.ResearchViewSet, basename='research')
urlpatterns = [path('api/v2/', include(router.urls)), *mvp_patterns]
