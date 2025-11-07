# EcoTrack - Sistema de Monitoreo y Reducción de Huella de Carbono

🌍 **EcoTrack** es una plataforma web distribuida basada en microservicios que permite a los usuarios calcular, monitorear y reducir su huella de carbono personal mediante el seguimiento de actividades cotidianas.

## 📋 Características Principales

- **Gestión de Usuarios**: Registro, autenticación y perfiles personalizados
- **Registro de Actividades**: Transporte, consumo energético, alimentación y residuos
- **Cálculo de Huella de Carbono**: Algoritmos basados en estándares internacionales
- **Recomendaciones Inteligentes**: Sugerencias personalizadas para reducir emisiones
- **Gamificación**: Sistema de puntos, logros y ranking comunitario
- **Dashboard Interactivo**: Visualización de datos con gráficos y estadísticas

## 🏗️ Arquitectura

La aplicación está construida con una arquitectura de microservicios:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: 5 microservicios FastAPI independientes
- **Base de Datos**: MongoDB Atlas (NoSQL)
- **Despliegue**: Docker + Docker Compose

### Microservicios

1. **User Service** (Puerto 8000) - Gestión de usuarios y autenticación
2. **Activity Service** (Puerto 8001) - CRUD de actividades diarias
3. **Carbon Calculator Service** (Puerto 8002) - Cálculos de emisiones de CO₂
4. **Analytics Service** (Puerto 8003) - Procesamiento de datos y logros
5. **Recommendation Service** (Puerto 8004) - Recomendaciones inteligentes

## 🚀 Instalación y Configuración

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo frontend)
- Python 3.9+ (para desarrollo backend)

### Configuración Rápida con Docker

1. **Clona el repositorio**:
   ```bash
   git clone <repository-url>
   cd ecotrack
   ```

2. **Configura MongoDB Atlas**:
   - Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Crea un cluster gratuito (M0)
   - Configura un usuario de base de datos y permisos de red
   - Copia la connection string (mongodb+srv://...)

3. **Inicializa la base de datos** (una sola vez):
   ```bash
   npm install mongodb
   node init-atlas.js
   ```

4. **Inicia todos los servicios**:
   ```bash
   docker-compose up -d
   ```

5. **Verifica que los servicios estén corriendo**:
   ```bash
   docker-compose ps
   ```

6. **Accede a la aplicación**:
   - **Frontend**: http://localhost:3040 🌐
   - API Docs (User Service): http://localhost:8000/docs
   - API Docs (Activity Service): http://localhost:8001/docs
   - API Docs (Carbon Calculator): http://localhost:8002/docs
   - API Docs (Analytics): http://localhost:8003/docs
   - API Docs (Recommendation): http://localhost:8004/docs

### Configuración Manual (Desarrollo)

#### Backend

1. **Instala las dependencias de cada servicio**:
   ```bash
   # Para cada servicio
   cd backend/<service-name>
   pip install -r requirements.txt
   ```

2. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env con tu connection string de MongoDB Atlas
   ```

3. **Inicializa la base de datos Atlas** (una sola vez):
   ```bash
   npm install mongodb
   node init-atlas.js
   ```

4. **Ejecuta los servicios**:
   ```bash
   # User Service
   cd backend/user-service && uvicorn app.main:app --reload --port 8000

   # Activity Service
   cd backend/activity-service && uvicorn app.main:app --reload --port 8001

   # Carbon Calculator Service
   cd backend/carbon-calculator-service && uvicorn app.main:app --reload --port 8002

   # Analytics Service
   cd backend/analytics-service && uvicorn app.main:app --reload --port 8003

   # Recommendation Service
   cd backend/recommendation-service && uvicorn app.main:app --reload --port 8004
   ```

#### Frontend

1. **Instala dependencias**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env
   # Configura las URLs de los servicios backend
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## 🔧 Configuración de Variables de Entorno

### User Service (.env)
```env
MONGODB_URL=mongodb://localhost:27017/ecotrack
DATABASE_NAME=ecotrack
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Activity Service (.env)
```env
MONGODB_URL=mongodb://localhost:27017/ecotrack
CARBON_CALCULATOR_URL=http://localhost:8002
```

### Carbon Calculator Service (.env)
```env
MONGODB_URL=mongodb://localhost:27017/ecotrack
```

### Analytics Service (.env)
```env
MONGODB_URL=mongodb://localhost:27017/ecotrack
ACTIVITY_SERVICE_URL=http://localhost:8001
```

### Recommendation Service (.env)
```env
MONGODB_URL=mongodb://localhost:27017/ecotrack
ACTIVITY_SERVICE_URL=http://localhost:8001
USER_SERVICE_URL=http://localhost:8000
```

## 📊 API Endpoints Principales

### User Service
- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `GET /me` - Perfil del usuario actual
- `PUT /me` - Actualizar perfil

### Activity Service
- `POST /activities` - Crear actividad
- `GET /activities` - Listar actividades del usuario
- `PUT /activities/{id}` - Actualizar actividad
- `DELETE /activities/{id}` - Eliminar actividad

### Carbon Calculator Service
- `POST /calculate` - Calcular emisiones
- `GET /factors` - Obtener factores de emisión
- `GET /categories` - Categorías disponibles

### Analytics Service
- `POST /analytics` - Obtener analytics del usuario
- `GET /achievements` - Lista de logros disponibles
- `GET /leaderboard` - Ranking comunitario

### Recommendation Service
- `POST /recommendations` - Generar recomendaciones
- `POST /recommendations/{id}/feedback` - Enviar feedback

## 🗄️ Modelo de Datos (MongoDB)

### Colecciones Principales

- **users**: Información de usuarios y perfiles
- **activities**: Registro de actividades diarias
- **emission_factors**: Factores de emisión por actividad
- **achievements**: Sistema de logros y gamificación
- **recommendations**: Historial de recomendaciones

## 🧪 Pruebas

```bash
# Ejecutar pruebas de un servicio específico
cd backend/<service-name>
pytest

# Ejecutar todas las pruebas
docker-compose exec <service-name> pytest
```

## 📈 Monitoreo y Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f <service-name>
```

## 🚀 Despliegue en Producción

### Con Docker Compose

```bash
# Construir y desplegar
docker-compose -f docker-compose.prod.yml up -d

# Actualizar servicios
docker-compose pull && docker-compose up -d
```

### Variables de Producción

- Usar secrets seguros para JWT
- Configurar CORS para dominios de producción
- Habilitar HTTPS/SSL
- Monitorear uso y costos en MongoDB Atlas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: support@ecotrack.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Agradecimientos

- Datos de factores de emisión: EPA, IPCC, DEFRA
- Framework: FastAPI, React, MongoDB
- Inspiración: WWF Carbon Calculator

---

**¡Únete a la revolución verde y comienza a rastrear tu impacto ambiental hoy!** 🌱