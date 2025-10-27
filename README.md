# GLPI Software Inventory - Next.js con TypeScript

Sistema de inventario y control de software aprobado para GLPI, migrado a Next.js 15 con TypeScript.

## 🚀 Características

- ✅ **Inventario General**: Consulta de software instalado por computadora
- ✅ **Control de Software Aprobado**: Verificación automática contra lista de software aprobado
- ✅ **Filtros Avanzados**: Por ubicación, equipo, software y estado
- ✅ **Búsqueda en Tiempo Real**: Búsqueda instantánea en todos los campos
- ✅ **Normalización Automática**: Agrupa diferentes versiones del mismo software
- ✅ **Lectura de Excel**: Carga automática desde SharePoint/OneDrive
- ✅ **Responsive Design**: Compatible con dispositivos móviles y desktop

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Acceso a base de datos GLPI (MariaDB/MySQL)
- Acceso al archivo Excel de software aprobado

## 🔧 Instalación

1. **Instalar dependencias**

```bash
npm install
```

2. **Configurar variables de entorno**

Crea un archivo `.env` basado en `.env.example`:

```env
DB_HOST=192.168.20.198
DB_USER=cremona_glpi
DB_PASSWORD=tu_password
DB_NAME=glpi
DB_PORT=3306

EXCEL_PATH=C:\Users\tu_usuario\...\RP_Software_Aprobado.xlsx
```

3. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
soft-aprobado/
├── app/
│   ├── api/                    # API Routes (endpoints REST)
│   ├── inventario/             # Página de inventario general
│   ├── aprobado/               # Página de software aprobado
│   └── layout.tsx              # Layout principal
├── components/                 # Componentes React reutilizables
├── lib/                        # Utilidades y lógica de backend
│   ├── types.ts                # Definiciones de tipos TypeScript
│   ├── db.ts                   # Configuración de base de datos
│   ├── excel-utils.ts          # Utilidades para leer Excel
│   └── software-filters.config.ts # Configuración de filtros
└── package.json
```

## 📡 Rutas Principales

- `/` - Página de inicio (redirige a /inventario)
- `/inventario` - Inventario general de software
- `/aprobado` - Control de software aprobado/desaprobado

## 📦 Scripts Disponibles

```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm run start      # Iniciar servidor de producción
npm run lint       # Ejecutar linter
```

## 🔧 Configuración de Filtros

Puedes personalizar los filtros de software editando `lib/software-filters.config.ts`:

- **exclude**: Patrones regex para excluir software irrelevante (actualizaciones, drivers, etc.)
- **normalize**: Reglas para normalizar nombres de software (agrupar versiones)

## 📄 Licencia

© 2025 Cremona Inoxidable SA - Uso interno
