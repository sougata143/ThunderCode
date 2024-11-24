import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CodeGenerationService:
    def __init__(self, model_name: str = "codellama/CodeLlama-7b-hf"):
        self.model_name = model_name
        self.device = "cpu"  # Using CPU for local development
        logger.info(f"Using device: {self.device}")
        
        logger.info("Loading tokenizer...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        logger.info("Loading model...")
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            device_map=self.device,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        
        logger.info("Model loaded successfully!")

    def generate_code(
        self,
        prompt: str,
        max_length: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.95,
        top_k: int = 50,
        num_return_sequences: int = 1,
    ) -> str:
        """Generate code based on the given prompt."""
        try:
            # Prepare the prompt
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
            
            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    num_return_sequences=num_return_sequences,
                    pad_token_id=self.tokenizer.eos_token_id,
                    do_sample=True,
                )
            
            # Decode and return the generated code
            generated_code = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return generated_code.strip()
            
        except Exception as e:
            logger.error(f"Error generating code: {str(e)}")
            raise
