# 🛠 Web Scraper + API REST

Este proyecto consta de dos partes principales:

1. 🐍 **Scraper en Python**: Extrae información de funcionarios públicos del sitio oficial de Yucatán, la normaliza y la guarda en una base de datos PostgreSQL.
2. 🚀 **API en NestJS**: Expone los datos almacenados mediante endpoints con filtros y paginación para ser consumidos por una interfaz frontend.

---

## 🗂 Estructura del Proyecto

```
api/               # Backend NestJS + PostgreSQL
│   ├── src/
│   ├── .env
│   ├── Dockerfile
│   └── ...
├── scraper/           # Scraper en Python (integrado en la carpeta api/)
│   ├── main.py
│   ├── ingest.py
│   ├── models.py
│   ├── db.py
│   ├── repo.py
│   ├── .venv/
│   └── requirements.txt
└── README.md
```

---

## ✅ Requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Python](https://www.python.org/) >= 3.10
- [Docker](https://www.docker.com/) (opcional pero recomendado)
- PostgreSQL local o contenedor
- Git

---

## 🚀 Instalación Rápida

### 1. Clona el repositorio

```bash
git clone https://github.com/ricardopuc77/scraper
```

---

### 2. Backend NestJS (`api/`)

```bash
cd scraper

# Instala dependencias
npm install

# Crea y configura el archivo .env
```

#### Ejemplo de `.env`:
```
# DB
POSTGRES_USER=postgres
POSTGRES_PASSWORD=myPassword
POSTGRES_DB=evaluacion
POSTGRES_PORT=5433

# App
DATABASE_URL_NEST=postgres://postgres:myPassword@localhost:5433/evaluacion
DATABASE_URL=postgresql+psycopg2://postgres:myPassword@localhost:5433/evaluacion

NODE_ENV=development
PORT=3001

```

---

### 3. Base de datos con Docker

Si quieres levantar PostgreSQL con Docker:

```bash
docker-compose up -d
```

Esto usará el archivo `docker-compose.yml` (añádelo si aún no lo tienes).

---

### 4. Ejecutar migraciones

```bash
npm run migration:run
```

---

### 5. Ejecutar la API

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3001`

---

### 6. Scraper en Python

#### 6.1 Activar entorno virtual

```bash
cd scraper
python -m venv .venv
.\.venv\Scripts\Activate
```

#### 6.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 6.3 Ejecutar el scraper manualmente (opcional)

```bash
python main.py
```

> Esto extraerá la información, la procesará y la insertará en la base de datos.

---

### 7. Ejecutar scraper desde el endpoint NestJS 

Puedes hacer una petición a:

```
POST /scraper
```

Para ejecutar el script de scraping desde el backend.

---

## 🧪 Endpoints disponibles


### `GET /funcionarios`

Con filtros:

```
GET /funcionarios?nombre=joaquin&puesto=1&institucion=2&page=1&limit=10
```

#### Respuesta de ejemplo:
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "MTRO. JOAQUÍN JESÚS DÍAZ MENA",
      "puesto": { "id": 1, "nombre": "Gobernador" },
      "institucion": { "id": 1, "nombre": "Palacio de Gobierno" },
      "area": null,
      "direccion": "Calle 61 x 60 y 62, Centro, C.P. 97000, Mérida, Yucatán",
      "telefono": "(999) 930 3100 Ext. 10054",
      "sourcePage": { "id": 1, "url": "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=1" },
      "status": 1
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 10
}
```

#### Filtros disponibles:

- `nombre`: búsqueda parcial, ignora tildes
- `puesto`, `institucion`, `area`: IDs exactos
- `page`, `limit`: para paginación


---

### `GET /api/funcionarios/getResources`

Este endpoint retorna los catálogos necesarios para poblar filtros en el frontend.

#### Respuesta de ejemplo:
```json
{
  "puestos": [
    { "id": 1, "nombre": "Gobernador" },
    { "id": 2, "nombre": "Secretario Particular" }
  ],
  "instituciones": [
    { "id": 1, "nombre": "Palacio de Gobierno" },
    { "id": 2, "nombre": "Secretaría de Finanzas" }
  ],
  "areas": [
    { "id": 1, "nombre": "Área Técnica" },
    { "id": 2, "nombre": "Área Administrativa" }
  ]
}
```

Este endpoint es útil para poblar los selects de búsqueda en la UI.


## 🙌 Autor

Ricardo Puc  
Desarrollador Backend | Python & NestJS  
