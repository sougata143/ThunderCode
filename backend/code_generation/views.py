from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CodeGeneration, CodeTemplate
from .serializers import CodeGenerationSerializer, CodeTemplateSerializer
from .services import code_generator
import json
from asgiref.sync import async_to_sync

class CodeGenerationViewSet(viewsets.ModelViewSet):
    queryset = CodeGeneration.objects.all()
    serializer_class = CodeGenerationSerializer

    @action(detail=False, methods=['post'])
    def generate_code(self, request):
        prompt = request.data.get('prompt')
        language = request.data.get('language')
        
        if not prompt or not language:
            return Response(
                {'error': 'Both prompt and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use AI service for code generation
            generated_code = async_to_sync(code_generator.generate_code)(prompt, language)
            
            # Create generation record
            serializer = self.get_serializer(data={
                'prompt': prompt,
                'language': language,
                'generated_code': generated_code,
                'model_used': 'gpt-4'
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

    @action(detail=False, methods=['post'])
    def generate_project(self, request):
        prompt = request.data.get('prompt')
        language = request.data.get('language')
        
        if not prompt or not language:
            return Response(
                {'error': 'Both prompt and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate project structure using AI service
            files, dependencies, setup_instructions = async_to_sync(code_generator.generate_project_structure)(
                prompt, language
            )
            
            return Response({
                'files': files,
                'dependencies': dependencies,
                'setup_instructions': setup_instructions
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def provide_feedback(self, request, pk=None):
        generation = self.get_object()
        rating = request.data.get('rating')
        comment = request.data.get('comment')
        
        if rating is None:
            return Response(
                {'error': 'Rating is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        generation.feedback_rating = rating
        generation.feedback_comment = comment
        generation.save()
        
        return Response({'status': 'Feedback recorded'})

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
            analysis = async_to_sync(code_generator.analyze_code_quality)(code, language)
            return Response(analysis, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CodeTemplateViewSet(viewsets.ModelViewSet):
    queryset = CodeTemplate.objects.all()
    serializer_class = CodeTemplateSerializer

    @action(detail=True, methods=['post'])
    def generate_from_template(self, request, pk=None):
        template = self.get_object()
        variables = request.data.get('variables', {})
        
        try:
            # Generate code from template using AI service
            generated_code = async_to_sync(code_generator.generate_from_template)(
                template.template_code, variables
            )
            
            # Create generation record
            generation_serializer = CodeGenerationSerializer(data={
                'prompt': f"Generated from template: {template.name}",
                'language': template.language,
                'generated_code': generated_code,
                'model_used': 'template'
            })
            
            if generation_serializer.is_valid():
                generation_serializer.save()
                return Response(generation_serializer.data, status=status.HTTP_201_CREATED)
            return Response(generation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
