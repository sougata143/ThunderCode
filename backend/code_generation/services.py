import openai
from django.conf import settings
from typing import Dict, List, Optional, Tuple
import json
import os
import re

class AICodeGenerator:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4"

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
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )

            # Parse the response
            content = response.choices[0].message.content
            structure = json.loads(content)

            return (
                structure["files"],
                structure["dependencies"],
                structure["setup_instructions"]
            )
        except Exception as e:
            raise Exception(f"Failed to generate project structure: {str(e)}")

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
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            generated_code = response.choices[0].message.content
            return self._clean_code_block(generated_code)
        except Exception as e:
            raise Exception(f"Failed to generate code: {str(e)}")

    async def generate_from_template(
        self, template_code: str, variables: Dict[str, any]
    ) -> str:
        """Generate code by filling template with variables."""
        try:
            # First, validate the template with AI
            validation_prompt = f"""Validate this template code and fill in the variables with appropriate values:
            Template Code:
            {template_code}
            
            Variables to replace:
            {json.dumps(variables, indent=2)}
            
            Return only the final code with variables replaced."""

            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a template processing expert. Fill in template variables and validate the resulting code."},
                    {"role": "user", "content": validation_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )

            generated_code = response.choices[0].message.content
            return self._clean_code_block(generated_code)
        except Exception as e:
            raise Exception(f"Failed to generate from template: {str(e)}")

    async def analyze_code_quality(self, code: str, language: str) -> Dict[str, any]:
        """Analyze code quality and provide suggestions."""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a code quality expert. Analyze this {language} code and provide detailed feedback."},
                    {"role": "user", "content": code}
                ],
                temperature=0.3,
                max_tokens=1000
            )

            analysis = response.choices[0].message.content
            return {
                "analysis": analysis,
                "quality_score": 0.8,  # Placeholder - implement actual scoring
                "suggestions": []  # Placeholder - parse suggestions from analysis
            }
        except Exception as e:
            raise Exception(f"Failed to analyze code: {str(e)}")

code_generator = AICodeGenerator()
