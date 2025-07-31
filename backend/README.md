# 🚀 Orders Tracker API

## 📋 Descripción

Sistema completo de seguimiento de pedidos con reglas de negocio robustas, sistema de alertas administrativas y notificaciones en tiempo real. Desarrollado con Node.js, Express, Prisma ORM y PostgreSQL.

## 🏗️ Arquitectura del Sistema

### **Stack Tecnológico**

- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **WebSockets**: Socket.IO (para notificaciones en tiempo real)
- **Documentación**: Swagger/OpenAPI

### **Estructura del Proyecto**

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Swagger, etc.)
│   ├── controllers/     # Controladores de la API
│   ├── middleware/      # Middleware personalizado
│   ├── repository/      # Capa de acceso a datos
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   └── server.js        # Punto de entrada
├── prisma/
│   ├── migrations/      # Migraciones de base de datos
│   ├── schema.prisma    # Esquema de base de datos
│   └── seed.js          # Datos de prueba
└── docs/                # Documentación adicional
```

## 🎯 Reglas de Negocio Implementadas

### **1. Progresión Secuencial de Estados**

Los pedidos deben avanzar secuencialmente por las etapas del proceso:

- `CREATED` → `PREPARING` → `DISPATCHED` → `DELIVERED`
- **Excepción**: Se permite retroceder de `DISPATCHED` a `PREPARING`

### **2. Idempotencia en Cambios de Estado**

- Un mismo evento no debe procesarse más de una vez
- Validación de eventos duplicados mediante `event_id`
- Respuestas consistentes para operaciones repetidas

### **3. Auditoría con Timestamps**

- Todos los eventos se registran con timestamp
- Historial completo de cambios de estado
- Trazabilidad completa de cada pedido

## 🚨 Sistema de Alertas Administrativas

### **Tipos de Alertas**

1. **NOT_DISPATCHED_IN_X_DAYS**: Pedido no despachado en X días
2. **NOT_DELIVERED_SAME_DAY**: Pedido no entregado el mismo día

### **Configuración de Alertas**

- Thresholds configurables por tipo de alerta
- Estados activo/inactivo
- Asociación opcional con usuarios específicos
- Ejecución automática con generación de notificaciones

## 📬 Sistema de Notificaciones

### **Características**

- **Notificaciones de Usuario**: Específicas por usuario
- **Persistencia**: Almacenamiento en base de datos
- **Estados**: Leído/No leído con timestamps

### **Tipos de Notificación**

- `ALERT_GENERATED`: Alertas automáticas del sistema
- `ORDER_STATUS_CHANGED`: Cambios de estado de pedidos
- `SYSTEM_NOTIFICATION`: Notificaciones del sistema

## 🔧 API Endpoints

### **Pedidos (Orders)**

```
GET    /api/orders              # Listar pedidos con paginación
GET    /api/orders/:id          # Obtener pedido por ID
POST   /api/orders              # Crear nuevo pedido
PUT    /api/orders/:id          # Actualizar pedido
DELETE /api/orders/:id          # Eliminar pedido
POST   /api/orders/:id/status   # Cambiar estado de pedido
GET    /api/orders/:id/events   # Obtener eventos del pedido
```

### **Reglas de Alerta (Alert Rules)**

```
GET    /api/alert-rules                    # Listar reglas
GET    /api/alert-rules/:id                # Obtener regla por ID
POST   /api/alert-rules                    # Crear regla
PUT    /api/alert-rules/:id                # Actualizar regla
DELETE /api/alert-rules/:id                # Eliminar regla
PATCH  /api/alert-rules/:id/toggle         # Activar/desactivar regla
PATCH  /api/alert-rules/:id/threshold      # Modificar threshold
GET    /api/alert-rules/active             # Reglas activas
GET    /api/alert-rules/stats              # Estadísticas
POST   /api/alert-rules/execute-with-notifications  # Ejecutar reglas
```

### **Notificaciones (Notifications)**

```
GET    /api/notifications                  # Notificaciones del usuario
GET    /api/notifications/:id              # Obtener notificación
POST   /api/notifications                  # Crear notificación
PATCH  /api/notifications/:id/read         # Marcar como leída
PATCH  /api/notifications/read-all         # Marcar todas como leídas
DELETE /api/notifications/:id              # Eliminar notificación
GET    /api/notifications/stats            # Estadísticas
```

### **Utilidades**

```
GET    /api/ping                           # Health check simple
GET    /api/health                         # Health check detallado
GET    /api-docs                           # Documentación Swagger
```

## 🗄️ Modelos de Base de Datos

### **Order (Pedido)**

```prisma
model Order {
  id            String   @id @default(cuid())
  customer_name String
  status        OrderStatus @default(CREATED)
  user_id       String?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  events        OrderEvent[]
  notifications Notification[]

  @@map("orders")
}
```

### **OrderEvent (Evento de Pedido)**

```prisma
model OrderEvent {
  id         String     @id @default(cuid())
  order_id   String
  event_type String
  event_id   String     @unique
  timestamp  DateTime   @default(now())

  order      Order      @relation(fields: [order_id], references: [id], onDelete: Cascade)

  @@map("order_events")
}
```

### **AlertRule (Regla de Alerta)**

```prisma
model AlertRule {
  id         Int           @id @default(autoincrement())
  rule_type  AlertRuleType
  threshold  Int
  active     Boolean       @default(true)
  user_id    String?
  created_at DateTime      @default(now())
  updated_at DateTime      @updatedAt

  @@map("alert_rules")
}
```

### **Notification (Notificación)**

```prisma
model Notification {
  id         Int      @id @default(autoincrement())
  user_id    String?
  type       String
  title      String
  message    String
  data       Json?
  read       Boolean  @default(false)
  read_at    DateTime?
  sent_email Boolean  @default(false)
  email_sent_at DateTime?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("notifications")
}
```

## 🚨 Sistema de Manejo de Errores

### **Clases de Error Personalizadas**

- **BaseError**: Clase base para todos los errores
- **AlertRuleError**: Errores específicos de reglas de alerta
- **NotificationError**: Errores específicos de notificaciones
- **DatabaseError**: Errores de base de datos
- **ValidationError**: Errores de validación
- **ServiceError**: Errores de capa de servicio

### **Códigos de Estado HTTP**

- **400**: Bad Request (Validación)
- **404**: Not Found (Recurso no encontrado)
- **409**: Conflict (Duplicado)
- **413**: Payload Too Large
- **500**: Internal Server Error

### **Respuestas de Error Estructuradas**

```json
{
  "success": false,
  "error": "Mensaje de error específico",
  "statusCode": 400,
  "timestamp": "2025-07-31T11:30:00.000Z",
  "field": "campo_específico",
  "service": "alertRules"
}
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn
- Docker y Docker Compose (opcional, para desarrollo local)

### **Instalación**

```bash
# Clonar repositorio
git clone https://github.com/francomiret/orders-tracker-app.git
cd orders-tracker-app/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.template .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma migrate dev
npx prisma generate

# Poblar con datos de prueba
node prisma/seed.js

# Iniciar servidor
npm start
```

### **Configuración de Base de Datos**

Para información detallada sobre la configuración de Prisma y la base de datos, consulta el archivo [PRISMA_README.md](./PRISMA_README.md).

### **Variables de Entorno**

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/orders_tracker"

# Servidor
PORT=3000
NODE_ENV=development

# WebSockets
SOCKET_CORS_ORIGIN="http://localhost:3000"
```

### **Asunciones Técnicas**

1. **Base de Datos**: PostgreSQL como sistema principal de persistencia
2. **Escalabilidad**: Sistema diseñado para manejar miles de pedidos
3. **Concurrencia**: Múltiples usuarios pueden modificar pedidos simultáneamente
4. **Idempotencia**: Las operaciones deben ser seguras para reintentos
5. **Auditoría**: Todos los cambios deben ser trazables
6. **Tiempo Real**: Las notificaciones deben ser inmediatas

### **Asunciones de Negocio**

1. **Estados de Pedido**: Secuencia fija con excepción de DISPATCHED → PREPARING
2. **Alertas**: Configurables por administradores
3. **Notificaciones**: Específicas por usuario y globales
4. **Thresholds**: Configurables por tipo de alerta
5. **Usuarios**: Sistema de usuarios con roles
6. **Auditoría**: Requerimiento legal de trazabilidad

### **Asunciones de Usuario**

1. **Interfaz**: API RESTful para integración
2. **Documentación**: Swagger para autodocumentación
3. **Testing**: Scripts automatizados para validación
4. **Debugging**: Logs detallados para troubleshooting
5. **Performance**: Respuestas en menos de 500ms
