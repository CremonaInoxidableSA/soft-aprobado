# Deploy soft-aprobado + Docker

## Verificar Docker

```bash
docker --version
```

---

## Construir la imagen

Entrar al proyecto:

```bash
cd ~/soft-aprobado
```

Construcción con variables de base de datos:

```bash
sudo docker build --no-cache \
  --build-arg DB_HOST=192.168.x.x \
  --build-arg DB_PORT=3306 \
  --build-arg DB_USER=glpi \
  --build-arg DB_PASSWORD='TU_PASSWORD' \
  --build-arg DB_NAME=glpi \
  -t soft-aprobado .
```

Resultado esperado:

```
Successfully tagged soft-aprobado
```

---

## Variables de entorno requeridas

| Variable      | Descripción                        | Valor por defecto |
| ------------- | ---------------------------------- | ----------------- |
| `DB_HOST`     | IP o hostname del servidor MariaDB | `localhost`       |
| `DB_PORT`     | Puerto de la base de datos         | `3306`            |
| `DB_USER`     | Usuario de la base de datos        | `root`            |
| `DB_PASSWORD` | Contraseña de la base de datos     | _(vacío)_         |
| `DB_NAME`     | Nombre de la base de datos GLPI    | `glpi`            |

---

## Ver contenedores existentes

```bash
sudo docker ps -a
```

---

## Eliminar contenedor viejo

```bash
sudo docker rm -f soft-aprobado
```

---

## Ejecutar contenedor

La aplicación escucha en el puerto **3000**.

```bash
sudo docker run -d \
  --name soft-aprobado \
  -p 3000:3000 \
  -e DB_HOST=192.168.x.x \
  -e DB_PORT=3306 \
  -e DB_USER=glpi \
  -e DB_PASSWORD='TU_PASSWORD' \
  -e DB_NAME=glpi \
  soft-aprobado
```

---

## Verificar contenedor

```bash
sudo docker ps
```

Resultado esperado:

```
0.0.0.0:3000->3000/tcp
```

---

## Ver logs del contenedor

```bash
sudo docker logs soft-aprobado
```

Resultado esperado:

```
▲ Next.js
- Local: http://localhost:3000
```

---

## Acceso web

Desde otra PC:

```
http://IP_DEL_SERVIDOR:3000
```

Ejemplo:

```
http://192.168.20.198:3000
```

---

## Base de datos

La aplicación se conecta a la base de datos GLPI existente y crea automáticamente la tabla `creminox_software_autorizado` si no existe.

El usuario de la BD debe tener permisos de `SELECT` sobre las tablas de GLPI y permisos de `CREATE`, `INSERT`, `UPDATE`, `DELETE` sobre `creminox_software_autorizado`.

---

## Error común

### ERR_CONNECTION_REFUSED

Posibles causas:

- Contenedor detenido
- Puerto incorrecto
- Variables de entorno de BD incorrectas
- Firewall bloqueando el puerto 3000

Verificar:

```bash
sudo docker ps
sudo docker logs soft-aprobado
```

---

## Error común

### Access denied for user

La BD rechaza la conexión. Verificar las variables `DB_USER`, `DB_PASSWORD` y `DB_HOST`.

Si la BD está en el mismo host que Docker, usar la IP real de la máquina en lugar de `localhost` (Docker no puede resolver `localhost` como el host externo).

---

## Comandos útiles

### Ver contenedores

```bash
sudo docker ps
```

### Ver todos los contenedores

```bash
sudo docker ps -a
```

### Detener contenedor

```bash
sudo docker stop soft-aprobado
```

### Iniciar contenedor

```bash
sudo docker start soft-aprobado
```

### Reiniciar contenedor

```bash
sudo docker restart soft-aprobado
```

### Eliminar contenedor

```bash
sudo docker rm -f soft-aprobado
```

### Reconstruir imagen

```bash
sudo docker build --no-cache -t soft-aprobado .
```

### Ver logs en tiempo real

```bash
sudo docker logs -f soft-aprobado
```

---

## Estado final esperado

Sistema funcionando correctamente:

- Docker operativo
- Next.js corriendo en modo standalone
- Conexión a BD GLPI establecida
- Tabla `creminox_software_autorizado` creada
- Aplicación accesible desde navegador

## Instalación

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
```

3. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:3000`

## Estructura del Proyecto

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

## Rutas Principales

- `/` - Página de inicio (redirige a /inventario)
- `/inventario` - Inventario general de software
- `/` - Control de software aprobado/desaprobado

## Scripts Disponibles

```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm run start      # Iniciar servidor de producción
npm run lint       # Ejecutar linter
```

## Configuración de Filtros

Puedes personalizar los filtros de software editando `lib/software-filters.config.ts`:

- **exclude**: Patrones regex para excluir software irrelevante (actualizaciones, drivers, etc.)
- **normalize**: Reglas para normalizar nombres de software (agrupar versiones)

## Licencia

© 2025 Cremona Inoxidable SA - Uso interno
