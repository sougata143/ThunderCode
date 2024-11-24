from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from .services import AICodeGenerator, AIModel
from .serializers import (
    CodeGenerationSerializer,
    CodeTemplateSerializer,
)
from .models import CodeGeneration, CodeTemplate

class CodeGenerationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CodeGenerationSerializer
    queryset = CodeGeneration.objects.all()

    def get_code_generator(self, ai_model: str) -> AICodeGenerator:
        try:
            model_type = AIModel[ai_model.upper().replace('-', '_')]
            return AICodeGenerator(model_type=model_type)
        except KeyError:
            raise ValidationError(f"Invalid AI model: {ai_model}")

    @action(detail=False, methods=['post'])
    async def generate_code(self, request):
        prompt = request.data.get('prompt')
        language = request.data.get('language')
        ai_model = request.data.get('aiModel', 'gpt-4')

        if not prompt or not language:
            return Response(
                {'error': 'Prompt and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            code_generator = self.get_code_generator(ai_model)
            generated_code = await code_generator.generate_code(prompt, language)

            generation = CodeGeneration.objects.create(
                user=request.user,
                prompt=prompt,
                language=language,
                generated_code=generated_code,
                ai_model=ai_model
            )

            serializer = self.get_serializer(generation)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    async def generate_project(self, request):
        prompt = request.data.get('prompt')
        language = request.data.get('language')
        ai_model = request.data.get('aiModel', 'gpt-4')
        
        if not prompt or not language:
            return Response(
                {'error': 'Both prompt and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate project structure using AI service
            code_generator = self.get_code_generator(ai_model)
            files, dependencies, setup_instructions = await code_generator.generate_project_structure(
                prompt, language
            )
            
            return Response({
                'files': files,
                'dependencies': dependencies,
                'setupInstructions': setup_instructions
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    async def provide_feedback(self, request, pk=None):
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
    async def analyze_code(self, request):
        code = request.data.get('code')
        language = request.data.get('language')
        
        if not code or not language:
            return Response(
                {'error': 'Both code and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            analysis = await AICodeGenerator().analyze_code_quality(code, language)
            return Response(analysis, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CodeTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CodeTemplateSerializer
    queryset = CodeTemplate.objects.all()

    def get_code_generator(self, ai_model: str) -> AICodeGenerator:
        try:
            model_type = AIModel[ai_model.upper().replace('-', '_')]
            return AICodeGenerator(model_type=model_type)
        except KeyError:
            raise ValidationError(f"Invalid AI model: {ai_model}")

    @action(detail=True, methods=['post'])
    async def generate_from_template(self, request, pk=None):
        template = self.get_object()
        variables = request.data.get('variables', {})
        ai_model = request.data.get('aiModel', 'gpt-4')
        
        if not variables:
            return Response(
                {'error': 'Variables are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate code from template using AI service
            code_generator = self.get_code_generator(ai_model)
            generated_code = await code_generator.generate_from_template(
                template.template_code, variables
            )
            
            # Create generation record
            generation_serializer = CodeGenerationSerializer(data={
                'prompt': f"Generated from template: {template.name}",
                'language': template.language,
                'generated_code': generated_code,
                'ai_model': ai_model,
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
