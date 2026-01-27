"""
Main FastAPI application.
"""
import time
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
from app.routers import auth, users, processes, activities

# Note: Database tables are created via Alembic migrations
# Run: alembic upgrade head


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logar todas as requisições HTTP."""
    
    async def dispatch(self, request: Request, call_next):
        # Capturar tempo de início
        start_time = time.time()
        
        # Processar requisição
        response = await call_next(request)
        
        # Calcular tempo de resposta em milissegundos
        process_time = (time.time() - start_time) * 1000
        
        # Obter informações da requisição
        status_code = response.status_code
        method = request.method
        route = request.url.path
        
        # Determinar cor do status code (para melhor visualização)
        if status_code >= 500:
            status_color = "\033[91m"  # Vermelho para erros do servidor
        elif status_code >= 400:
            status_color = "\033[93m"  # Amarelo para erros do cliente
        elif status_code >= 300:
            status_color = "\033[96m"  # Ciano para redirecionamentos
        elif status_code >= 200:
            status_color = "\033[92m"  # Verde para sucesso
        else:
            status_color = "\033[0m"   # Reset
        
        reset_color = "\033[0m"
        
        # Log no formato: [status] METHOD route - tempo de resposta
        log_message = f"{status_color}[{status_code}]{reset_color} {method:6s} {route:40s} - {process_time:7.2f}ms"
        
        # Usar sys.stderr para garantir que apareça no terminal (mesmo padrão do uvicorn)
        sys.stderr.write(log_message + "\n")
        sys.stderr.flush()
        
        return response


# Create FastAPI app
app = FastAPI(
    title="Licenciamento Digital API",
    description="API backend para o sistema de Licenciamento Ambiental Digital",
    version="1.0.0",
)

# Add logging middleware (deve ser adicionado antes do CORS)
app.add_middleware(LoggingMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(processes.router, prefix=settings.API_V1_PREFIX)
app.include_router(activities.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Licenciamento Digital API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
