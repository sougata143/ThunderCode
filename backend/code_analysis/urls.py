from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CodeAnalysisViewSet, CodeMetricsViewSet

router = DefaultRouter()
router.register(r'analysis', CodeAnalysisViewSet)
router.register(r'metrics', CodeMetricsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
