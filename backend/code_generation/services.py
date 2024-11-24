import openai
from django.conf import settings
from typing import Dict, List, Optional, Tuple, Any
import json
import os
import re
from enum import Enum
from abc import ABC, abstractmethod
import requests

class AIModel(Enum):
    GPT_4 = "gpt-4"
    GPT_35_TURBO = "gpt-3.5-turbo"
    CODELLAMA = "codellama-34b"
    ANTHROPIC_CLAUDE = "anthropic-claude-2"
    QWEN = "qwen-72b"

class AIModelConfig:
    def __init__(self, model_type: AIModel):
        self.model_type = model_type
        self._configure_model()

    def _configure_model(self):
        if self.model_type in [AIModel.GPT_4, AIModel.GPT_35_TURBO]:
            self.api_key = settings.OPENAI_API_KEY
            self.api_base = "https://api.openai.com/v1"
        elif self.model_type == AIModel.CODELLAMA:
            self.api_key = settings.CODELLAMA_API_KEY
            self.api_base = settings.CODELLAMA_API_BASE
        elif self.model_type == AIModel.ANTHROPIC_CLAUDE:
            self.api_key = settings.ANTHROPIC_API_KEY
            self.api_base = "https://api.anthropic.com"
        elif self.model_type == AIModel.QWEN:
            self.api_key = settings.QWEN_API_KEY
            self.api_base = settings.QWEN_API_BASE

class AIModelInterface(ABC):
    @abstractmethod
    async def generate_completion(self, messages: List[Dict[str, str]]) -> str:
        pass

class OpenAIModel(AIModelInterface):
    def __init__(self, model_config: AIModelConfig):
        self.config = model_config
        openai.api_key = model_config.api_key

    async def generate_completion(self, messages: List[Dict[str, str]]) -> str:
        response = await openai.ChatCompletion.acreate(
            model=self.config.model_type.value,
            messages=messages
        )
        return response.choices[0].message.content

class CodeLLamaModel(AIModelInterface):
    def __init__(self, model_config: AIModelConfig):
        self.config = model_config
        # Initialize CodeLLama client here

    async def generate_completion(self, messages: List[Dict[str, str]]) -> str:
        # Implement CodeLLama API call
        pass

class AnthropicModel(AIModelInterface):
    def __init__(self, model_config: AIModelConfig):
        self.config = model_config
        # Initialize Anthropic client here

    async def generate_completion(self, messages: List[Dict[str, str]]) -> str:
        # Implement Anthropic API call
        pass

class QwenModel(AIModelInterface):
    def __init__(self, model_config: AIModelConfig):
        self.config = model_config
        self.headers = {
            "Authorization": f"Bearer {model_config.api_key}",
            "Content-Type": "application/json"
        }

    async def generate_completion(self, messages: List[Dict[str, str]]) -> str:
        try:
            response = requests.post(
                f"{self.config.api_base}/v1/chat/completions",
                headers=self.headers,
                json={
                    "model": self.config.model_type.value,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            raise Exception(f"Qwen API error: {str(e)}")

class AICodeGenerator:
    def __init__(self, model_type: AIModel = AIModel.GPT_4):
        self.model_config = AIModelConfig(model_type)
        self.model = self._initialize_model()

    def _initialize_model(self) -> AIModelInterface:
        if self.model_config.model_type in [AIModel.GPT_4, AIModel.GPT_35_TURBO]:
            return OpenAIModel(self.model_config)
        elif self.model_config.model_type == AIModel.CODELLAMA:
            return CodeLLamaModel(self.model_config)
        elif self.model_config.model_type == AIModel.ANTHROPIC_CLAUDE:
            return AnthropicModel(self.model_config)
        elif self.model_config.model_type == AIModel.QWEN:
            return QwenModel(self.model_config)
        raise ValueError(f"Unsupported model type: {self.model_config.model_type}")

    def _clean_code_block(self, text: str) -> str:
        """Extract code from markdown code blocks."""
        code_block_pattern = r"```[\w]*\n([\s\S]*?)```"
        matches = re.finditer(code_block_pattern, text)
        code_blocks = [match.group(1).strip() for match in matches]
        return "\n\n".join(code_blocks) if code_blocks else text

    async def generate_project_structure(
        self, prompt: str, language: str
    ) -> Tuple[List[Dict[str, str]], Dict[str, str], List[str]]:
        """Generate project structure including files, dependencies, and setup instructions."""
        
        system_prompt = f"""You are an expert software architect and developer. Create a complete project structure for a {language} project based on the following description. 
        Your response must be in JSON format with the following structure:
        {{
            "files": [
                {{"path": "relative/path/to/file", "content": "file content"}},
                ...
            ],
            "dependencies": {{"package_name": "version"}},
            "setup_instructions": ["instruction1", "instruction2", ...]
        }}
        
        Follow these guidelines:
        1. Include all necessary configuration files (e.g., package.json, requirements.txt)
        2. Create a comprehensive README.md
        3. Follow best practices for {language}
        4. Include appropriate testing setup
        5. Add proper documentation
        6. Set up proper project structure with separate directories for source, tests, etc.
        7. Include basic CI/CD configuration if relevant"""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            response_text = await self.model.generate_completion(messages)
            
            try:
                response_data = json.loads(response_text)
                return (
                    response_data.get("files", []),
                    response_data.get("dependencies", {}),
                    response_data.get("setup_instructions", [])
                )
            except json.JSONDecodeError:
                return [], {}, ["Error: Invalid JSON response from AI model"]
                
        except Exception as e:
            return [], {}, [f"Error: {str(e)}"]

    async def generate_code(self, prompt: str, language: str) -> str:
        """Generate code based on prompt and language."""
        system_prompt = f"""You are an expert {language} developer. Generate clean, efficient, and well-documented code based on the following prompt.
        Follow these guidelines:
        1. Use modern best practices
        2. Include proper error handling
        3. Add comprehensive documentation
        4. Follow {language} style guidelines
        5. Consider performance and security
        Your response should be properly formatted code, wrapped in markdown code blocks."""

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
            response_text = await self.model.generate_completion(messages)
            return self._clean_code_block(response_text)
        except Exception as e:
            raise Exception(f"Failed to generate code: {str(e)}")

    async def generate_from_template(
        self, template_code: str, variables: Dict[str, any]
    ) -> str:
        """Generate code by filling template with variables."""
        try:
            validation_prompt = f"""Validate this template code and fill in the variables with appropriate values:
            Template Code:
            {template_code}
            
            Variables to replace:
            {json.dumps(variables, indent=2)}
            
            Return only the final code with variables replaced."""

            messages = [
                {"role": "system", "content": "You are a template processing expert. Fill in template variables and validate the resulting code."},
                {"role": "user", "content": validation_prompt}
            ]
            response_text = await self.model.generate_completion(messages)
            return self._clean_code_block(response_text)
        except Exception as e:
            raise Exception(f"Failed to generate from template: {str(e)}")

    async def analyze_code_quality(self, code: str, language: str) -> Dict[str, any]:
        """Analyze code quality and provide suggestions."""
        try:
            messages = [
                {"role": "system", "content": f"You are a code quality expert. Analyze this {language} code and provide detailed feedback."},
                {"role": "user", "content": code}
            ]
            response_text = await self.model.generate_completion(messages)
            return {
                "analysis": response_text,
                "quality_score": 0.8,  # Placeholder - implement actual scoring
                "suggestions": []  # Placeholder - parse suggestions from analysis
            }
        except Exception as e:
            raise Exception(f"Failed to analyze code: {str(e)}")

code_generator = AICodeGenerator()
