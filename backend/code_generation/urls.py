from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CodeGenerationViewSet, CodeTemplateViewSet

router = DefaultRouter()
router.register(r'generations', CodeGenerationViewSet)
router.register(r'templates', CodeTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
