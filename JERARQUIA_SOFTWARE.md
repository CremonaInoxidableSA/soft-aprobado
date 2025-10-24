# Sistema de Jerarquía de Software Aprobado

## 📋 Descripción

Se implementó un sistema de herencia jerárquica para la aprobación de software que permite definir qué software está aprobado para diferentes áreas y puestos de la organización.

## 🏗️ Estructura de la Jerarquía

### 1. **General** (Nivel más alto)

- Software aprobado para **TODA** la organización
- Todos los sectores y puestos heredan este software
- Ejemplos: Microsoft Office, Chrome, Adobe Acrobat

### 2. **Áreas** (Nivel medio)

- Software aprobado para un área específica
- Todos los puestos dentro del área heredan este software
- También heredan el software de "General"
- Ejemplos:
  - Ventas: Microsoft Project, OBS Studio
  - IT: AutoCAD, Visual Studio

### 3. **Puestos** (Nivel más específico)

- Software aprobado solo para un puesto específico dentro de un área
- Hereda software de "General" + "Área" + "Puesto"
- Ejemplos:
  - Marketing (dentro de Ventas): Adobe Illustrator, Adobe Photoshop
  - Diseño (dentro de IT): CorelDRAW, Figma

## 📊 Formato del Excel

El archivo `RP_Software_Aprobado.xlsx` debe tener la siguiente estructura:

### Fila 2 (Cabeceras):

- **Columna A2**: "Area" o "Área"
- **Columna B2**: "Puesto"
- **Columna C2**: "Software"

### Fila 3 en adelante (Datos):

- **Columna A**: Nombre del área (ej: "General", "Ventas", "IT")
- **Columna B**: Nombre del puesto (ej: "Marketing", "Diseño") - puede estar vacío
- **Columna C**: Nombre del software

### Ejemplo:

| Area    | Puesto    | Software          |
| ------- | --------- | ----------------- |
| General |           | Microsoft Office  |
| General |           | Chrome            |
| Ventas  |           | Microsoft Project |
| Ventas  | Marketing | Adobe Illustrator |
| Ventas  | Marketing | Adobe Photoshop   |
| IT      |           | AutoCAD           |
| IT      | Diseño    | CorelDRAW         |

## 🔄 Lógica de Herencia

### Ejemplo: Marketing

Una PC ubicada en **"Ventas > Marketing"** tendrá como aprobado:

1. **Software de General** (todos lo heredan):

   - Microsoft Office
   - Chrome
   - Adobe Acrobat
   - etc.

2. **Software de Ventas** (todos los de Ventas heredan):

   - Microsoft Project
   - OBS Studio
   - etc.

3. **Software de Marketing** (solo Marketing):
   - Adobe Illustrator
   - Adobe Photoshop
   - etc.

**TOTAL**: Marketing tiene acceso a General + Ventas + Marketing

### Ejemplo: Ventas (sin puesto específico)

Una PC ubicada en **"Ventas"** tendrá como aprobado:

1. **Software de General**
2. **Software de Ventas**

**NO** tendrá acceso al software específico de Marketing.

## 🔍 Ubicaciones en GLPI

El sistema lee la ubicación desde GLPI en el formato:

- `"Area"` → Solo área, sin puesto específico
- `"Area > Puesto"` → Área con puesto específico

Ejemplos:

- `"Ventas"` → Hereda: General + Ventas
- `"Ventas > Marketing"` → Hereda: General + Ventas + Marketing
- `"IT"` → Hereda: General + IT
- `"IT > Diseño"` → Hereda: General + IT + Diseño

## 🛠️ Cambios Técnicos Implementados

### Archivos Modificados:

1. **`lib/types.ts`**

   - Agregados tipos para la jerarquía de software aprobado

2. **`lib/excel-utils.ts`**

   - Nueva función `readApprovedSoftware()`: Lee las 3 columnas del Excel
   - Nueva función `isSoftwareApprovedForLocation()`: Verifica aprobación con herencia
   - Función `parseLocation()`: Extrae área y puesto de la ubicación GLPI
   - Estructura `approvedSoftwareHierarchy`: Cache con la jerarquía completa

3. **`app/api/software-approval/route.ts`**

   - Actualizado para usar `isSoftwareApprovedForLocation()` en lugar de `isSoftwareApproved()`
   - Ahora considera la ubicación de cada equipo para determinar aprobación

4. **`app/api/diagnostic/route.ts`**

   - Agregada información de jerarquía al endpoint de diagnóstico

5. **`app/api/approved-list/route.ts`**
   - Agregada información resumen de la jerarquía

## 🧪 Pruebas

### Endpoint de prueba: `/api/test-hierarchy`

Este endpoint muestra:

- Resultados de prueba para diferentes software y ubicaciones
- Jerarquía completa cargada del Excel
- Software en cada nivel (General, Áreas, Puestos)

### Verificar que funciona:

1. Abrir: `http://localhost:3000/api/test-hierarchy`
2. Revisar que los resultados de prueba muestren `"aprobado": true` para:
   - Adobe Illustrator en Marketing
   - Adobe Photoshop en Marketing
   - Microsoft Office en cualquier ubicación (porque está en General)

## 📝 Notas Importantes

1. **Case Insensitive**: El sistema compara áreas y puestos sin distinguir mayúsculas/minúsculas
2. **Normalización**: Los nombres de software se normalizan según las reglas en `software-filters.config.ts`
3. **Caché**: La jerarquía se carga del Excel y se mantiene en caché en memoria
4. **Reload**: Usar el endpoint `/api/reload-approved` para recargar el Excel sin reiniciar el servidor

## ✅ Verificación

Para verificar que el sistema está funcionando:

1. **Ver logs del servidor**: Debe mostrar al iniciar:

   ```
   ✅ Excel procesado correctamente:
      - Software general: X
      - Áreas: Y
      - Puestos específicos: Z
      - Total único de software: N
   ```

2. **Endpoint de diagnóstico**: `/api/diagnostic`

   - Debe mostrar la jerarquía completa con ejemplos

3. **Endpoint de prueba**: `/api/test-hierarchy`

   - Debe mostrar resultados de prueba y la jerarquía completa

4. **Aplicación principal**: `/aprobado`
   - Filtrar por un equipo específico
   - Verificar que el software se marca como aprobado/desaprobado correctamente
   - Equipos de Marketing deben tener aprobado Adobe Illustrator y Photoshop
