# ThunderCode

ThunderCode is an AI-powered Integrated Development Environment (IDE) that enhances developer productivity through intelligent code generation and development tools. It combines the power of local Large Language Models (LLMs) with a modern, intuitive interface to provide a seamless coding experience.

## Features

### 🤖 Local LLM Integration
- Run AI models locally for code generation
- Support for multiple models:
  - CodeLlama (7B and 13B variants)
  - StarCoder (7B)
- Model management interface for downloading and activating models
- Offline code generation capabilities

### 🎨 Modern UI/UX
- Clean, intuitive interface built with Material-UI
- Dark/Light theme support
- Customizable editor settings
- Responsive layout with collapsible sidebar

### 💻 Development Tools
- File explorer with project navigation
- Integrated source control
- Code search functionality
- Debug panel
- Extensions support
- AI-powered code assistant

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+ (for ML service)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thundercode.git
cd thundercode
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend/ml_service
pip install -r requirements.txt
```

### Running the Application

1. Start the frontend development server:
```bash
cd frontend
npm start
```

2. Start the ML service:
```bash
cd backend/ml_service
uvicorn api:app --reload
```

The application will be available at `http://localhost:3000`

## Architecture

### Frontend
- React with TypeScript
- Material-UI for components
- Zustand for state management
- Monaco Editor for code editing
- Notistack for notifications

### Backend ML Service
- FastAPI server
- Hugging Face Transformers
- PyTorch for model inference
- Local model management

## Development

### Project Structure
```
thundercode/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
└── backend/
    └── ml_service/
        ├── api.py
        ├── model_service.py
        └── requirements.txt
```

### Key Components
- `LocalLLMManager`: Handles local model management
- `AIAssistant`: Provides AI-powered code generation
- `Editor`: Monaco-based code editor
- `Sidebar`: Navigation and tool access
- `Settings`: Application configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for transformer models
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Material-UI](https://mui.com/)
- All contributors who have helped shape ThunderCode
