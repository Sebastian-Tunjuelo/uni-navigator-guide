# Workflow-Ready Architecture Guide

## Introducción

El backend de Virtual University Concierge está diseñado siguiendo los patrones de **workflow-orchestration-patterns** skill para permitir fácil escalado a sistemas de orquestación distribuida como [Temporal](https://temporal.io).

## Arquitectura Actual (Workflow-Ready)

### Separación de responsabilidades

El patrón workflow distingue entre:

1. **Workflow** = Lógica de coordinación y decisión
2. **Activity** = Operaciones externas (I/O, APIs)

En nuestro código actual:
- **Services** actúan como "activities" (operaciones externas, idempotentes)
- **Routes** contienen la lógica de coordinación (workflow)
- **Middleware** maneja políticas transversales (autenticación, error handling)

### Ejemplo: Chat Response Workflow

Flujo actual en `/src/routes/chat.ts:POST /message`:

```
Request Handler (Workflow)
    ↓
[Decisión] Validar usuario y mensaje
    ↓
Activity: ChatService.storeMessage(userId, message)
    ├─ Inserta en DB
    └─ Retorna chatMessage creado
    ↓
Activity: ChatService.generateResponse(message)
    ├─ Genera respuesta (placeholder)
    └─ Retorna string
    ↓
Activity: ChatService.updateMessageResponse(id, response)
    ├─ Actualiza en DB
    └─ Retorna chatMessage actualizado
    ↓
Response Handler (Workflow)
    └─ Retorna JSON al cliente
```

**Características workflow-ready:**
- ✅ Cada `Activity` es idempotente (puede ejecutarse múltiples veces sin cambiar resultado)
- ✅ Cada `Activity` es independiente
- ✅ La lógica de coordinación está clara en la ruta
- ✅ Errores se manejan de forma centralizada

## Migración a Temporal (Fase 2)

### Paso 1: Crear Workflow Definition

```typescript
// src/workflows/chat-response.workflow.ts
import * as activities from './chat-response.activities';

export async function chatResponseWorkflow(input: {
  userId: string;
  message: string;
}) {
  // Activity 1: Guardar mensaje
  const storedMessage = await activities.storeUserMessage({
    userId: input.userId,
    message: input.message,
  });

  // Activity 2: Generar respuesta
  const response = await activities.generateChatResponse({
    message: input.message,
  });

  // Activity 3: Actualizar con respuesta
  const updatedMessage = await activities.updateMessageResponse({
    messageId: storedMessage.id,
    response: response,
  });

  return updatedMessage;
}
```

### Paso 2: Crear Activities

```typescript
// src/workflows/chat-response.activities.ts
import { ChatService } from '@/services/chat.service';

// Activity 1: Idempotent message storage
export async function storeUserMessage(input: {
  userId: string;
  message: string;
}) {
  return ChatService.storeMessage(input.userId, input.message);
  // Idempotent: El userId + timestamp garantiza deduplicación
}

// Activity 2: Generate response (can be non-deterministic)
export async function generateChatResponse(input: { message: string }) {
  return ChatService.generateResponse(input.message);
  // No-deterministic es OK, es una Activity
}

// Activity 3: Update message (idempotent)
export async function updateMessageResponse(input: {
  messageId: string;
  response: string;
}) {
  return ChatService.updateMessageResponse(input.messageId, input.response);
  // Idempotent: El messageId es único
}
```

### Paso 3: Worker Client

```typescript
// src/temporal/worker.ts
import { Worker } from '@temporalio/worker';
import * as workflows from './workflows';
import * as activities from './workflows/chat-response.activities';

export async function startWorker() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'chat-responses',
  });

  await worker.run();
}
```

### Paso 4: Routes → Temporal Client

```typescript
// src/routes/chat.ts (refactored)
import { Connection, Client } from '@temporalio/client';

let temporalClient: Client;

// Initialize on startup
async function initTemporal() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  temporalClient = new Client({ connection });
}

router.post('/message', requireAuth, async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId || !message) {
      throw new ValidationError('Missing required fields');
    }

    // Ejecutar workflow en Temporal
    const result = await temporalClient.workflow.execute(
      chatResponseWorkflow,
      {
        args: [{ userId, message }],
        taskQueue: 'chat-responses',
        workflowId: `chat-${userId}-${Date.now()}`,
      }
    );

    res.status(201).json({
      id: result.id,
      message: result.message,
      response: result.response,
      timestamp: result.created_at,
    });
  } catch (err) {
    next(err);
  }
});
```

## Patrones RAG + Workflow

### Saga Pattern: Procesar Query → Retrieve → Generate

```typescript
export async function ragWorkflow(input: {
  userId: string;
  query: string;
}) {
  // Activity 1: Retrieve relevant documents
  const documents = await activities.retrieveDocuments(input.query);

  // Activity 2: Generate response from documents
  const response = await activities.generateFromDocuments({
    query: input.query,
    documents,
  });

  // Activity 3: Store interaction for feedback
  const interaction = await activities.storeInteraction({
    userId: input.userId,
    query: input.query,
    response,
  });

  return {
    answer: response.answer,
    sources: response.sources,
    interactionId: interaction.id,
  };
}
```

## Ventajas de la Arquitectura Actual

1. **Escalabilidad sin cambios de código**: Migrar a Temporal requiere solo cambios en cómo se llaman los servicios
2. **Testeable**: Cada Activity es una función pura testeable
3. **Monitoreable**: Logs claros en cada paso
4. **Resiliente**: Error handling centralizado
5. **Observable**: Cada Activity puede tener retries y timeouts configurados

## Próximas Fases

### Fase 2: Temporal Integration
- Instalar `@temporalio/client` y `@temporalio/worker`
- Migrar workflows clave al cliente de Temporal
- Configurar Temporal Server local (Docker)

### Fase 3: Advanced Patterns
- Saga pattern con compensaciones para rollback
- Parallelización de activities con `Promise.all()`
- Timeouts y retries configurables por activity
- Monitoring con Temporal UI

### Fase 4: Production Ready
- Deployment a Temporal Cloud
- Observability con DataDog/Prometheus
- Rate limiting y backpressure
- Dead letter queues para fallos

## Referencias

- [Temporal Documentation](https://docs.temporal.io)
- [Workflow Orchestration Patterns Skill](file://.agents/skills/workflow-orchestration-patterns/SKILL.md)
- [LangChain RAG Skill](https://skills.sh/langchain-ai/langchain-skills/langchain-rag)
- [Supabase PostgreSQL Best Practices](file://.agents/skills/supabase-postgres-best-practices/SKILL.md)

## Notas de Implementación

### Idempotency
Cada Activity debe ser idempotente:
```typescript
// ✅ BUENO: Checar si existe antes de crear
static async storeMessage(userId, message) {
  const existingMessage = await db.findOne({ messageId });
  if (existingMessage) return existingMessage;
  return await db.insert({ userId, message });
}

// ❌ MALO: Siempre crear sin check
static async storeMessage(userId, message) {
  return await db.insert({ userId, message }); // Duplicadas si reintentos
}
```

### Determinismo
Los Workflows debe ser determinísticos:
```typescript
// ✅ BUENO: Usar valores pasados como args
await activity.call(deterministic_value);

// ❌ MALO: Usar valores locales random
const random = Math.random();
await activity.call(random);
```

### Versioning
Cuando cambies un Activity, versionado:
```typescript
export async function generateChatResponseV2(input) {
  // Nueva lógica
}

// En workflow:
if (workflow.getVersion('response-gen', 1, 2) >= 2) {
  response = await activities.generateChatResponseV2(input);
} else {
  response = await activities.generateChatResponse(input);
}
```
