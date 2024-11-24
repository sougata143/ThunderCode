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
- Dark theme optimized for coding
- Customizable editor settings
- Responsive layout with collapsible sidebar
- Professional file explorer with file preview
- Side-by-side AI assistant integration

### 💻 Development Tools
- Advanced file explorer with:
  - Local folder browsing
  - File content preview and editing
  - Support for multiple file types (text, images, PDFs)
  - Tree view navigation
- Integrated source control
- Code search functionality
- Debug panel
- Extensions support
- AI-powered code assistant

### 📝 Editor Features
- Syntax highlighting
- Code completion
- Real-time error detection
- Multiple file support
- Dark theme optimized for long coding sessions

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
- File System Access API for local file handling

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
│   │   │   ├── Explorer/      # File explorer components
│   │   │   ├── Editor/        # Code editor components
│   │   │   ├── AIAssistant/   # AI integration components
│   │   │   └── Layout/        # Layout components
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
└── backend/
    └── ml_service/
        ├── api.py
        └── requirements.txt
```

### Key Components

#### File Explorer
- Local folder selection and browsing
- Recursive directory traversal
- File content preview and editing
- Support for various file types
- Professional dark theme UI

#### Code Editor
- Monaco Editor integration
- Syntax highlighting
- Code completion
- Error detection
- Multiple language support

#### AI Assistant
- Real-time code suggestions
- Context-aware completions
- Local model inference
- Offline support

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
