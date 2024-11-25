import os
from pathlib import Path
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LocalLLM:
    """Local LLM for code generation using GPT2-small"""
    
    def __init__(self):
        self.model_name = "distilgpt2"  # Much smaller model
        self.device = torch.device("cpu")
        self.response_cache = {}
        self.is_loaded = False
        logger.info(f"Initialized LocalLLM with device: {self.device}")
        
        # Preload model in background
        import threading
        threading.Thread(target=self._preload_model, daemon=True).start()
    
    def _preload_model(self):
        """Preload model in background"""
        try:
            logger.info("Preloading model in background...")
            import torch
            
            # Maximum optimization
            torch.set_grad_enabled(False)
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            # Load minimal tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                model_max_length=32,
                padding_side='left'
            )
            
            # Set special tokens
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load minimal model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True
            )
            
            # Optimize model
            self.model.eval()
            for param in self.model.parameters():
                param.requires_grad_(False)
            
            # Quick test
            with torch.inference_mode():
                input_text = "def test():"
                input_ids = self.tokenizer.encode(input_text, return_tensors="pt")
                attention_mask = torch.ones_like(input_ids)
                outputs = self.model.generate(
                    input_ids,
                    attention_mask=attention_mask,
                    max_new_tokens=2,
                    pad_token_id=self.tokenizer.eos_token_id
                )
                result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                logger.info(f"Test generation: {result}")
            
            self.is_loaded = True
            logger.info("Model preloaded successfully")
            
        except Exception as e:
            logger.error(f"Error preloading model: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
    
    async def generate_code_async(self, prompt, max_length=200, temperature=0.7):
        """Async code generation"""
        try:
            # Check cache
            cache_key = f"{prompt}_{max_length}_{temperature}"
            if cache_key in self.response_cache:
                logger.info("Using cached response")
                return self.response_cache[cache_key]
            
            # Quick model check
            if not self.is_loaded:
                raise Exception("Model not loaded")
            
            # Minimal prompt
            full_prompt = f"# Python code to {prompt}:\ndef"
            logger.info(f"Using prompt: {full_prompt}")
            
            logger.info("Generating code...")
            
            # Efficient tokenization
            input_ids = self.tokenizer.encode(
                full_prompt, 
                return_tensors="pt",
                max_length=24,
                truncation=True,
                padding=False
            )
            
            # Create attention mask
            attention_mask = torch.ones_like(input_ids)
            
            # Generate with minimal settings
            with torch.inference_mode():
                outputs = self.model.generate(
                    input_ids,
                    attention_mask=attention_mask,
                    max_new_tokens=16,
                    do_sample=False,
                    num_return_sequences=1,
                    pad_token_id=self.tokenizer.eos_token_id,
                    use_cache=True,
                    temperature=1.0,  # Pure greedy
                    top_p=0.0,       # No sampling
                    top_k=1          # Single token
                )
            
            # Quick decode
            generated_text = self.tokenizer.decode(
                outputs[0],
                skip_special_tokens=True,
                clean_up_tokenization_spaces=False
            )
            
            # Clean up the code
            code = generated_text[len(full_prompt):].strip()
            if not code:
                code = "# No code generated"
            
            logger.info(f"Generated code: {code}")
            
            # Cache response
            self.response_cache[cache_key] = code
            
            logger.info("Code generation completed")
            return code

        except Exception as e:
            logger.error(f"Error generating code: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise
    
    def generate_code(self, prompt, max_length=200, temperature=0.7):
        """Sync wrapper for async generation"""
        import asyncio
        return asyncio.run(self.generate_code_async(prompt, max_length, temperature))

# Create singleton instance
llm = LocalLLM()
