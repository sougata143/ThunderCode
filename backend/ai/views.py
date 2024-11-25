from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .llm_utils import llm
import openai
import asyncio
from functools import wraps
from asgiref.sync import async_to_sync

# Create your views here.

def async_api_view(methods):
    """Decorator for async API views"""
    def decorator(func):
        @api_view(methods)
        @wraps(func)
        def wrapped(*args, **kwargs):
            return async_to_sync(func)(*args, **kwargs)
        return wrapped
    return decorator

@api_view(['POST'])
def chat(request):
    """
    Handle AI chat messages and return responses
    """
    try:
        message = request.data.get('message')
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == 'your_openai_key':
            return Response(
                {'error': 'OpenAI API key not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Initialize OpenAI client
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        # Create chat completion
        response = client.chat.completions.create(
            model="gpt-4",  # or your preferred model
            messages=[
                {"role": "system", "content": "You are a helpful AI coding assistant."},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Extract the response
        ai_response = response.choices[0].message.content

        return Response({
            'response': ai_response
        })

    except openai.error.OpenAIError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


async def generate_code(prompt, max_length, temperature):
    try:
        result = llm.generate_code(
            prompt=prompt,
            max_length=max_length,
            temperature=temperature
        )
        return result
    except Exception as e:
        raise Exception(str(e))


@async_api_view(['POST'])
async def generate(request):
    """
    Handle AI code generation requests and return responses using local LLM
    """
    try:
        prompt = request.data.get('prompt')
        if not prompt:
            return Response(
                {'error': 'Prompt is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get optional parameters with minimal defaults
        max_length = min(request.data.get('max_length', 16), 24)  # Strict cap
        temperature = min(max(request.data.get('temperature', 0.7), 0.1), 1.0)

        try:
            # Generate code with timeout
            result = await asyncio.wait_for(
                llm.generate_code_async(prompt, max_length, temperature),
                timeout=1.0
            )
            return Response({
                'generated_code': result
            })
        except asyncio.TimeoutError:
            return Response(
                {'error': 'Code generation timed out. Please try again with a simpler prompt.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in code generation: {error_details}")
        return Response(
            {
                'error': str(e),
                'details': error_details if settings.DEBUG else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
