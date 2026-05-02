/**
 * CAMPUS MAP - Representación Visual ASCII
 * 
 * Este archivo proporciona una visualización en ASCII del campus
 * para entender la distribución geográfica de edificios
 */

/**
 * MAPA DEL CAMPUS - Vista General
 * 
 * Coordenadas: [0-1000, 0-1000]
 * Origen (0,0) = Esquina inferior izquierda
 * 
 * N (Norte/Arriba) = Latitud 1000
 * S (Sur/Abajo) = Latitud 0
 * O (Oeste/Izquierda) = Longitud 0
 * E (Este/Derecha) = Longitud 1000
 *
 *
 *    1000 ┌─────────────────────────────────────────────────────────────┐
 *         │                     ZONA NORTE                              │
 *         │              Residencias (RES-A, B, C)                      │
 *         │                                                             │
 *    850  │                                                             │
 *         │                                                             │
 *    800  │         ⚽🏊           Deportes         GYM💪              │
 *         │   (AUD-DEP, PSC)                      (GYM-001)            │
 *    750  │                                                             │
 *         │        ZONA NORESTE                                        │
 *    700  │       (Deportes y                                          │
 *         │        Laboratorios)      🩺F (Medicina)                  │
 *    650  │                           🎨G (Artes)    🏊               │
 *         │     🔬C 📖B    ⚙️A  💼D                                    │
 *    600  │   (Ciencias) (Hum) (Ing) (Neg)  ⚖️E 🩺F                  │
 *         │                        (Derecho)                          │
 *    550  │     🧪🔬CHEM              🏟️PLZ      🏢LAB2               │
 *         │   (Labs)                (Plaza)   (LAB-COMP)              │
 *    500  │  🧪CHEM  📚LIB  ☕CAF  ⚛️PHYS                             │
 *         │  (LAB)   (LIB)  (CAF) (LAB)                               │
 *    450  │                 ZONA CENTRO                               │
 *         │              (Corazón del Campus)                         │
 *    400  │    💻LAB1   📚REC   ☕CAF2   🍽️COM                       │
 *         │   (COMP)   (DIGITAL)  (CAF)  (COMEDOR)                   │
 *         │                                                             │
 *    350  │                                                             │
 *         │    ZONA OESTE                                               │
 *    300  │  (Labs especializados)   🏛️ADM                           │
 *         │     y servicios         (ADMIN)                           │
 *    250  │                         🧠PSI                              │
 *         │                        (HEALTH)                            │
 *         │                                                             │
 *    200  │                                                             │
 *         │                                                             │
 *    150  │                        ZONA SUR                             │
 *         │              (Administración y Servicios)                  │
 *    100  │        🔧MAT (Mantenimiento)                               │
 *         │                                                             │
 *     50  │                                                             │
 *         │                                                             │
 *      0  └─────────────────────────────────────────────────────────────┘
 *         0    100   200   300   400   500   600   700   800   900  1000
 *         O                                               E
 *         (Oeste)                                       (Este)
 *
 *
 * LEYENDA:
 * ========
 * 🚪 = Entrada
 * 🏢 = Residencia
 * 🎓 = Académico
 * 📚 = Biblioteca
 * ☕ = Cafetería
 * 🍽️ = Comedor
 * 💻 = Computación
 * 🧪 = Química
 * ⚛️ = Física
 * 💪 = Gimnasio
 * ⚽ = Deportes
 * 🏊 = Piscina
 * 🏛️ = Administración
 * ⚕️ = Salud
 * 🧠 = Psicología
 * 🏟️ = Plaza
 * 🔧 = Mantenimiento
 * 🅿️ = Estacionamiento
 *
 */

/**
 * ZONAS FUNCIONALES DEL CAMPUS
 */

export const CAMPUS_ZONES = {
  // Zona Centro (HUB principal)
  CENTER: {
    name: 'Centro - Corazón del Campus',
    bounds: { latMin: 350, latMax: 650, lonMin: 350, lonMax: 650 },
    description:
      'Plaza Central, Biblioteca, Cafeterias - Mayor flujo de estudiantes',
    buildings: [
      'PLZ-001', // Plaza
      'LIB-001', // Biblioteca
      'LIB-002', // Recursos
      'SRV-CAF-001', // Cafetería Principal
      'SRV-CAF-002' // Cafetería Este
    ]
  },

  // Zona Académica
  ACADEMIC: {
    name: 'Zona Académica - Norte Central',
    bounds: { latMin: 250, latMax: 750, lonMin: 250, lonMax: 750 },
    description: '7 Facultades y Departamentos',
    buildings: [
      'ACA-A01', // Ingeniería
      'ACA-B01', // Humanidades
      'ACA-C01', // Ciencias
      'ACA-D01', // Negocios
      'ACA-E01', // Derecho
      'ACA-F01', // Medicina
      'ACA-G01' // Artes
    ]
  },

  // Zona Laboratorios
  LABORATORIES: {
    name: 'Zona de Laboratorios - Oeste',
    bounds: { latMin: 200, latMax: 500, lonMin: 100, lonMax: 500 },
    description: 'Labs de computación, química, física',
    buildings: [
      'LAB-COMP-001',
      'LAB-COMP-002',
      'LAB-CHEM-001',
      'LAB-PHYS-001'
    ]
  },

  // Zona Deportes
  SPORTS: {
    name: 'Zona de Deportes - Noreste',
    bounds: { latMin: 650, latMax: 950, lonMin: 600, lonMax: 950 },
    description: 'Gimnasio, canchas, piscina',
    buildings: ['GYM-001', 'AUD-DEP-001', 'PSC-001']
  },

  // Zona Residencias
  RESIDENCE: {
    name: 'Zona de Residencias - Norte',
    bounds: { latMin: 700, latMax: 950, lonMin: 150, lonMax: 850 },
    description: 'Alojamiento para estudiantes',
    buildings: ['RES-A01', 'RES-B01', 'RES-C01']
  },

  // Zona Administración
  ADMINISTRATION: {
    name: 'Zona de Administración - Sur',
    bounds: { latMin: 100, latMax: 400, lonMin: 150, lonMax: 550 },
    description: 'Oficinas administrativas y servicios',
    buildings: ['ADM-001', 'SRV-SEC-001', 'HSP-001', 'HSP-002']
  },

  // Zona Servicios
  SERVICES: {
    name: 'Zona de Servicios Generales - Periferia',
    bounds: { latMin: 200, latMax: 800, lonMin: 600, lonMax: 850 },
    description: 'Estacionamiento, comedor, mantenimiento',
    buildings: ['SRV-COM-001', 'PAR-001', 'MAT-001']
  }
};

/**
 * CONECTORES PRINCIPALES (Rutas de Alto Tráfico)
 * Estas rutas tienen mayor uso y podrían ser prioritarias para
 * mantenimiento, señalización clara, etc.
 */

export const MAIN_CORRIDORS = [
  {
    id: 'corridor-1',
    name: 'Eje Norte-Sur Principal',
    description: 'Entrada → Plaza → Administración',
    connects: ['ENT-001', 'PLZ-001', 'ADM-001'],
    estimatedDailyTraffic: 'VERY_HIGH'
  },
  {
    id: 'corridor-2',
    name: 'Eje Académico Central',
    description: 'Ronda de facultades alrededor de Plaza',
    connects: [
      'ACA-A01',
      'ACA-B01',
      'ACA-C01',
      'ACA-D01',
      'ACA-E01',
      'ACA-F01',
      'ACA-G01'
    ],
    estimatedDailyTraffic: 'HIGH'
  },
  {
    id: 'corridor-3',
    name: 'Biblioteca-Cafetería-Comedor',
    description: 'Servicios de soporte académico y alimentación',
    connects: ['LIB-001', 'SRV-CAF-001', 'SRV-COM-001'],
    estimatedDailyTraffic: 'HIGH'
  },
  {
    id: 'corridor-4',
    name: 'Residencias-Deportes',
    description: 'Zona de descanso y actividades',
    connects: ['RES-A01', 'RES-B01', 'RES-C01', 'GYM-001', 'PSC-001'],
    estimatedDailyTraffic: 'MEDIUM'
  },
  {
    id: 'corridor-5',
    name: 'Académica-Laboratorios',
    description: 'Conexión entre facultades y labs especializados',
    connects: ['ACA-A01', 'LAB-COMP-001', 'LAB-CHEM-001', 'LAB-PHYS-001'],
    estimatedDailyTraffic: 'MEDIUM'
  }
];

/**
 * DISTANCIAS ENTRE HITOS IMPORTANTES (en metros)
 */

export const KEY_DISTANCES = {
  'ENT-001 → PLZ-001': 350,
  'ENT-001 → ADM-001': 450,
  'PLZ-001 → LIB-001': 80,
  'PLZ-001 → ACA-A01': 180,
  'LIB-001 → LAB-COMP-001': 220,
  'LAB-COMP-001 → ACA-A01': 280,
  'RES-B01 → PLZ-001': 350,
  'RES-B01 → GYM-001': 220,
  'ACA-A01 → ACA-B01': 140,
  'GYM-001 → PSC-001': 60,
  'ADM-001 → HSP-001': 250,
  'PLZ-001 → SRV-CAF-001': 100,
  'SRV-CAF-001 → ACA-D01': 120
};

/**
 * TIEMPOS DE CAMINATA TÍPICOS (en minutos)
 * 
 * Desde punto A a punto B, incluyendo pequeñas desviaciones
 * Velocidad promedio: 1.5 m/s
 */

export const TYPICAL_WALK_TIMES = {
  'Entrada → Plaza': 5,
  'Plaza → Aula': 3,
  'Plaza → Biblioteca': 1,
  'Plaza → Cafetería': 1,
  'Cafetería → Aula': 2,
  'Aula → Laboratorio': 4,
  'Residencia → Plaza': 5,
  'Residencia → Gimnasio': 3,
  'Entrada → Administración': 6,
  'Administración → Biblioteca': 5
};

/**
 * INFORMACIÓN ÚTIL POR ZONA
 */

export const ZONE_INFO = {
  CENTER:
    'Punto de encuentro principal. Mejor para orientarse. Máximo tráfico. Wifi disponible.',
  ACADEMIC:
    'Horario principal 8:00-22:00. Aulas pueden cambiar por semestre. Consultar cartelera.',
  LABORATORIES:
    'Requieren reserva previa. Supervisión obligatoria. Horario limitado.',
  SPORTS:
    'Membresía incluida en matrícula. Horario: 6:00-21:00. Vestuarios disponibles.',
  RESIDENCE:
    'Acceso 24/7 con carnet. Área tranquila. Políticas de silencio 22:00-8:00.',
  ADMINISTRATION:
    'Atiende L-V 8:00-18:00. Documentación y trámites. Certificados en 48h.',
  SERVICES:
    'Estacionamiento pago. Comedor con menú diario. Mantenimiento: reportar daños.'
};

/**
 * ASCII ART - Vista Simplificada del Campus
 * 
 * Esta es una vista simplificada mostrando los flujos principales
 */

export const CAMPUS_ASCII_MAP = `
╔════════════════════════════════════════════════════════════════╗
║                    MAPA DEL CAMPUS UNIVERSITARIO              ║
║                   (Coordenadas normalizadas 0-1000)            ║
╚════════════════════════════════════════════════════════════════╝

                            NORTE (Lat 1000)
                                   ↑

    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │                    🏠 RESIDENCIAS 🏠                       │
    │        RES-A01      RES-B01      RES-C01                  │
    │        (250,850)    (500,850)    (750,850)                │
    │                                                             │
    │             💪🏊 ⚽ ZONA DEPORTES ⚽🏊💪                    │
    │            GYM-001  AUD-001  PSC-001                       │
    │            (900,700) (850,650) (800,680)                   │
    │                                                             │
    │    🔬C   📖B   ⚙️A  💼D  ⚖️E  🩺F  🎨G                    │
    │   (250)  (300) (400) (350) (500) (600) (700)  ACADÉMICOS  │
    │   (650)  (620) (600) (580) (700) (720) (700)  LAT/LON     │
    │                                                             │
    │              ┌────────────────────────┐                    │
    │              │                        │                    │
    │    🧪CHEM    │  🏟️ PLAZA CENTRAL    │   🏊LAB2          │
    │   (250,380)  │     (500,600)        │   (480,320)        │
    │              │                        │                    │
    │    📚LIB     │    ☕ CAFETERÍA      │   ⚛️PHYS          │
    │   (480,580)  │     (520,620)        │   (420,200)        │
    │              │                        │                    │
    │              │  💻LAB1 (400,300)    │                    │
    │              └────────────────────────┘                    │
    │                                                             │
    │          🏛️ ADM            🍽️ COMEDOR                     │
    │       (250,500)            (450,700)                       │
    │                                                             │
    │       ⚕️ SALUD            🅿️ PARKING                      │
    │       (200,300)            (300,750)                       │
    │                                                             │
    │           🚪 ENTRADA PRINCIPAL (500,950)                  │
    │           🚗 ENTRADA SECUNDARIA (750,200)                 │
    │                                                             │
    │        🔧 MANTENIMIENTO (100,400)                         │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘

                                   ↓
                            SUR (Lat 0)

    OESTE (Lon 0) ←──────────────────────────→ ESTE (Lon 1000)

╔════════════════════════════════════════════════════════════════╗
║ ZONAS PRINCIPALES:                                             ║
║  • CENTRO (HUB): Plaza, Biblioteca, Cafeterias               ║
║  • ACADÉMICA: 7 facultades alrededor del centro              ║
║  • NORTE: Residencias y Deportes                             ║
║  • OESTE: Laboratorios especializados                        ║
║  • SUR: Administración y Servicios                           ║
╚════════════════════════════════════════════════════════════════╝
`;

export default {
  CAMPUS_ZONES,
  MAIN_CORRIDORS,
  KEY_DISTANCES,
  TYPICAL_WALK_TIMES,
  ZONE_INFO,
  CAMPUS_ASCII_MAP
};
