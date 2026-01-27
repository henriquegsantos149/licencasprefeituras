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
        
        # Pular logging do endpoint de log para evitar duplicação
        if route == "/dev/log":
            return response
        
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
        
        # Log no formato: [status] - Method - rota - tempo de resposta
        log_message = f"{status_color}[{status_code}]{reset_color} - {method:6s} - {route:40s} - {process_time:7.2f}ms"
        
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


@app.post("/dev/log")
async def dev_log(request: Request):
    """
    Endpoint para receber logs do frontend (apenas em desenvolvimento).
    Loga mudanças de rota e outras informações de debug.
    """
    try:
        data = await request.json()
        log_type = data.get("type", "INFO")
        route = data.get("route", "")
        
        # Determinar cor baseado no tipo
        if log_type == "NAV":
            color = "\033[96m"  # Ciano para navegação
        elif log_type == "ERROR":
            color = "\033[91m"  # Vermelho para erros
        elif log_type == "WARN":
            color = "\033[93m"  # Amarelo para avisos
        else:
            color = "\033[92m"  # Verde para info
        
        reset_color = "\033[0m"
        
        # Formato: [NAV] - NAV - rota - 0ms (seguindo padrão das rotas HTTP)
        log_message = f"{color}[{log_type}]{reset_color} - NAV   - {route:40s} -    0.00ms"
        
        # Escrever no stderr (terminal)
        sys.stderr.write(log_message + "\n")
        sys.stderr.flush()
        
        return {"status": "logged"}
    except Exception as e:
        # Em caso de erro, não quebrar a aplicação
        return {"status": "error", "message": str(e)}
