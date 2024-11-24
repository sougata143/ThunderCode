from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import openai

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
