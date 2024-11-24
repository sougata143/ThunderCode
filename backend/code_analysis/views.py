from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CodeAnalysis, CodeMetrics
from .serializers import CodeAnalysisSerializer, CodeMetricsSerializer
import openai
from django.conf import settings

# Create your views here.

class CodeAnalysisViewSet(viewsets.ModelViewSet):
    queryset = CodeAnalysis.objects.all()
    serializer_class = CodeAnalysisSerializer

    @action(detail=False, methods=['post'])
    def analyze_code(self, request):
        code = request.data.get('code')
        language = request.data.get('language')
        
        if not code or not language:
            return Response(
                {'error': 'Both code and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use OpenAI for code analysis
            analysis = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a code analysis expert. Analyze the following code for bugs, security issues, and performance improvements."},
                    {"role": "user", "content": f"Language: {language}\nCode:\n{code}"}
                ]
            )
            
            # Create analysis record
            serializer = self.get_serializer(data={
                'file_path': request.data.get('file_path', 'unknown'),
                'language': language,
                'analysis_type': 'comprehensive',
                'severity': 'medium',
                'line_number': 1,
                'message': analysis.choices[0].message.content,
                'suggestion': analysis.choices[0].message.content
            })
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CodeMetricsViewSet(viewsets.ModelViewSet):
    queryset = CodeMetrics.objects.all()
    serializer_class = CodeMetricsSerializer

    @action(detail=False, methods=['post'])
    def calculate_metrics(self, request):
        code = request.data.get('code')
        language = request.data.get('language')
        
        if not code or not language:
            return Response(
                {'error': 'Both code and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Calculate basic metrics
            lines_of_code = len(code.splitlines())
            
            # Create metrics record
            serializer = self.get_serializer(data={
                'file_path': request.data.get('file_path', 'unknown'),
                'language': language,
                'lines_of_code': lines_of_code,
                'cyclomatic_complexity': 1,  # Placeholder
                'maintainability_index': 100.0  # Placeholder
            })
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
