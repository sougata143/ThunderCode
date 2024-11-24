# ThunderCode

An AI-powered Integrated Development Environment (IDE) that enhances developer productivity through intelligent code generation and development tools.

## 🌟 Features

### 🤖 AI-Powered Code Generation
- Multiple AI model support for diverse coding needs:
  - **GPT-4**: Most capable model for complex projects and advanced code generation
  - **GPT-3.5 Turbo**: Fast and cost-effective for simpler projects
  - **CodeLlama 34B**: Specialized in code generation and completion
  - **Claude 2**: Advanced reasoning and code understanding
  - **Qwen 72B**: Multilingual code generation with strong performance in Asian languages
- Contextual code suggestions
- Project structure generation
- Code template customization
- Intelligent code completion

### 💻 Supported Programming Languages
| Language   | AI Code Generation | Project Templates | Testing Framework | Documentation |
|------------|-------------------|-------------------|-------------------|---------------|
| Python     | All Models        | ✅                | pytest           | Sphinx        |
| JavaScript | All Models        | ✅                | Jest             | JSDoc         |
| TypeScript | All Models        | ✅                | Jest             | TypeDoc       |
| Java       | All Models        | ✅                | JUnit            | JavaDoc       |
| C++        | All Models        | ✅                | Google Test      | Doxygen       |
| Go         | All Models        | ✅                | Go Test          | Go Doc        |
| Rust       | All Models        | ✅                | Cargo Test       | Rust Doc      |

## 🏗️ Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for components
- Redux for state management
- Monaco Editor for code editing

### Backend
- Django REST Framework
- Multiple AI Model Integration:
  - OpenAI API (GPT-4, GPT-3.5)
  - CodeLlama API
  - Anthropic API (Claude)
  - Qwen API
- MongoDB for data storage
- Redis for caching

### DevOps
- Docker containerization
- AWS deployment (ECS, ECR)
- GitHub Actions for CI/CD
- CloudFormation for infrastructure

## 🔧 Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- Docker and Docker Compose (optional, for containerized setup)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/thundercode.git
cd thundercode
```

### 2. Environment Setup

#### Backend Configuration
```bash
# Create and configure backend environment
cp backend/.env.example backend/.env

# Required environment variables in backend/.env:
DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
SECRET_KEY=your-secret-key-here

# AI API Keys
OPENAI_API_KEY=your_openai_key
CODELLAMA_API_KEY=your_codellama_key
ANTHROPIC_API_KEY=your_anthropic_key
QWEN_API_KEY=your_qwen_key
QWEN_API_BASE=your_qwen_api_base

# Database Configuration
DB_NAME=thundercode
DB_USER=thundercode
DB_PASSWORD=thundercode
DB_HOST=localhost
DB_PORT=5432
```

#### Frontend Configuration
```bash
# Create and configure frontend environment
cp frontend/.env.example frontend/.env

# Required environment variables in frontend/.env:
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws/
REACT_APP_ENV=development
```

### 3. Running the Application

#### Option 1: Using Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Access the application:
# Frontend: http://localhost:80
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/api/docs/
```

#### Option 2: Local Development Setup

1. Backend Setup:
```bash
# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

2. Frontend Setup:
```bash
# Install dependencies
cd frontend
npm install

# Start frontend development server
npm start
```

3. Access the Application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs/

### 4. Development Features
- Hot reloading enabled for both frontend and backend
- Debug mode active in development
- API documentation available
- Automatic code formatting
- TypeScript type checking

## 🔍 API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔐 Security

- Secure API key management
- Encrypted data transmission
- Role-based access control
- Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Backend API Connection Failed**
   - Check if backend server is running
   - Verify API URL in frontend .env file
   - Ensure all required environment variables are set

2. **AI Model Errors**
   - Verify API keys are correctly set in backend .env
   - Check API rate limits
   - Ensure proper network connectivity

3. **Docker Issues**
   - Ensure Docker daemon is running
   - Check port availability (80 and 8000)
   - Verify Docker Compose installation

For more issues and solutions, please check our [Wiki](wiki) or open an issue.
