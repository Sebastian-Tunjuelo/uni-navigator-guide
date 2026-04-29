
# UniGuía — App móvil para estudiantes nuevos

App móvil-first pensada para estudiantes recién ingresados, centrada en orientación dentro del campus y acceso rápido a información esencial sin saturar.

## Decisiones clave (confirmadas)
- **Login**: demo con usuarios mock (sin backend para auth).
- **Chat IA (FAQ)**: solo UI con respuestas simuladas.
- **Chat grupal**: en tiempo real con Lovable Cloud (Realtime + tabla de mensajes). Como el login es mock, el "usuario actual" se identifica con el perfil mock seleccionado al iniciar sesión.
- **Estilo**: moderno, claro y minimalista. Mucho espacio en blanco, tipografía limpia, acentos en azul universitario.

## Sistema de diseño

- Paleta clara: fondo blanco, superficies en gris muy claro, acento azul universitario (#2563EB aprox), acentos secundarios suaves (verde para éxito/asistencia, ámbar para avisos).
- Tipografía sans-serif (Inter), jerarquía clara: títulos grandes, etiquetas pequeñas en mayúsculas suaves, números destacados para calificaciones/horas.
- Componentes: tarjetas con bordes redondeados (rounded-2xl), sombras muy sutiles, iconografía lucide-react.
- Layout móvil-first centrado en pantalla (max-w ~440px), simulando un dispositivo. Barra de navegación inferior fija con 5 ítems.
- Microinteracciones suaves (transiciones, estados hover/active), sin sobrecarga visual.

## Estructura de navegación

Barra inferior fija con 5 ítems:
1. Inicio
2. Carnet
3. Mapa
4. Chats
5. Perfil

Header superior contextual por pantalla (título + acción rápida tipo notificaciones/buscar).

## Pantallas

### 1. Login
- Pantalla de bienvenida con logo, frase corta ("Tu campus, más fácil").
- Selector de usuario mock (3-4 perfiles de ejemplo: ej. "Ana Torres - Ing. Sistemas") + campo contraseña decorativo.
- Botón "Entrar" → guarda el perfil seleccionado en localStorage y redirige a Inicio.
- Opción "Continuar como invitado" (perfil demo por defecto).

### 2. Inicio
Diseñado como feed escaneable, ordenado por prioridad para un estudiante nuevo:
- **Saludo personalizado** ("Hola, Ana 👋") + fecha.
- **Próxima clase** (tarjeta destacada): asignatura, hora, aula y bloque, con botón "Cómo llegar" que abre el Mapa con destino precargado.
- **Horario del día** (lista compacta horizontal/vertical): asignatura, hora, aula.
- **Noticias y anuncios**: carrusel/lista de tarjetas con imagen, título, fecha y categoría (académico, eventos, becas).
- **Mis calificaciones** (resumen): lista de asignaturas con nota actual y barra de progreso. Toque en una asignatura → detalle.
- **Detalle de asignatura** (modal o pantalla secundaria): lista de actividades evaluativas con nombre, % de valor, nota obtenida, y nota acumulada.

### 3. Carnet digital
- Tarjeta tipo carné físico, vertical, centrada en pantalla.
- Foto del estudiante, nombre completo, código, programa, semestre, vigencia.
- Código QR generado (placeholder con datos del perfil mock).
- Botón "Ampliar QR" (pantalla completa para escanear).
- Indicador visual de validez (sello "Vigente" en verde).
- Estilo limpio con un fondo degradado sutil para destacar la tarjeta.

### 4. Mapa del campus
Núcleo de la experiencia de orientación.
- **Mapa 2D** dibujado con SVG, dividido en bloques/zonas etiquetados (Bloque A, B, C, Biblioteca, Cafetería, Auditorio, Deportes, Entrada principal). Cada bloque es un polígono con color suave y etiqueta.
- **Caminos peatonales** dibujados como líneas grises punteadas conectando bloques (grafo de nodos).
- **Panel superior** con dos selects:
  - Bloque de origen (precargado con "Tu ubicación" simulada o entrada principal).
  - Bloque de destino.
- Botón "Trazar ruta".
- Algoritmo simple (BFS/Dijkstra sobre el grafo de bloques) que resalta la ruta recomendada en color de acento, con animación de trazo.
- **Tarjeta inferior** con resumen de la ruta: distancia estimada, tiempo a pie, lista de pasos ("Sal del Bloque A → cruza la plaza central → entra al Bloque C, aula 302").
- Botones de zoom y "centrar mapa".
- Leyenda colapsable con los tipos de bloque.

### 5. Chats
Pantalla con tabs o lista de conversaciones:
- **Chat grupal "Compañeros"** (en tiempo real, funcional):
  - Estilo WhatsApp: burbujas, nombre del remitente, hora, autoscroll.
  - Persistido en Lovable Cloud (tabla `messages`), con suscripción Realtime.
  - El nombre del remitente proviene del perfil mock activo.
  - Input inferior con envío.
- **Chat "Asistente UniBot" (FAQ)** (mock):
  - UI tipo chatbot con avatar.
  - Sugerencias rápidas al iniciar ("¿Dónde queda la biblioteca?", "¿Cómo solicito un certificado?", "Horarios de cafetería").
  - Respuestas predefinidas según palabras clave (diccionario local). Si no hay coincidencia, mensaje genérico amable.
  - Indicador de "escribiendo…" para realismo.

### 6. Perfil (5º tab)
- Datos del estudiante mock, opción de cambiar de usuario mock, cerrar sesión, ajustes básicos (notificaciones, tema — solo visual).

## Datos mock

Archivos TS con datos estáticos para:
- Perfiles de estudiantes (3-4).
- Horario semanal por perfil.
- Asignaturas con actividades evaluativas y notas.
- Noticias/anuncios.
- Bloques del campus (coordenadas SVG, nombres) y aristas del grafo para el ruteo.
- Diccionario de FAQ para el bot.

## Backend (Lovable Cloud) — mínimo

Solo para el chat grupal:
- Tabla `messages` (id, sender_name, sender_id_mock, content, created_at).
- Realtime habilitado en la tabla.
- Lectura/escritura pública (sin auth real, ya que el login es mock). Se documentará como demo.

## Detalles técnicos

- React + Vite + Tailwind + shadcn (ya en el proyecto).
- Rutas: `/login`, `/` (inicio), `/carnet`, `/mapa`, `/chats`, `/chats/grupo`, `/chats/bot`, `/perfil`. Guard simple que redirige a `/login` si no hay perfil mock en localStorage.
- Layout móvil con contenedor centrado y bottom nav fijo, oculto en `/login`.
- Mapa: SVG nativo, bloques como `<polygon>`, rutas como `<path>`. Algoritmo de ruta en utilidad TS (Dijkstra sobre grafo declarado).
- QR: librería ligera (`qrcode.react` o similar) para el carnet.
- Realtime: cliente de Lovable Cloud con `.channel().on('postgres_changes', ...)`.

## Entregable visual

Al finalizar, el usuario podrá:
1. Iniciar sesión eligiendo un perfil mock.
2. Ver su día (próxima clase, horario, noticias, notas con % de actividades).
3. Mostrar su carnet digital con QR.
4. Trazar rutas a pie entre bloques en un mapa 2D claro.
5. Chatear en tiempo real con otros (perfiles mock) y consultar al bot FAQ.

Apruebas el plan y procedo con la implementación.
