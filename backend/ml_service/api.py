from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model_service import CodeGenerationService
import logging
from typing import Optional

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the model service
model_service = None

class GenerateCodeRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 2048
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95
    top_k: Optional[int] = 50
    num_return_sequences: Optional[int] = 1

@app.on_event("startup")
async def startup_event():
    global model_service
    try:
        logger.info("Initializing model service...")
        model_service = CodeGenerationService()
        logger.info("Model service initialized successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize model service: {str(e)}")
        raise

@app.post("/generate")
async def generate_code(request: GenerateCodeRequest):
    try:
        if not model_service:
            raise HTTPException(status_code=500, detail="Model service not initialized")
        
        generated_code = model_service.generate_code(
            prompt=request.prompt,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            num_return_sequences=request.num_return_sequences
        )
        
        return {"generated_code": generated_code}
    
    except Exception as e:
        logger.error(f"Error generating code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
