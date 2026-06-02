# Lux — Movie SPA

Aplicación de página única para buscar, descubrir y guardar películas y series usando la [OMDb API](https://www.omdbapi.com/).

---

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la API key

Copia `.env.example` a `.env` y agrega tu API key gratuita de OMDb:

```bash
cp .env.example .env
```

Obtén tu key gratis en [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).

```env
VITE_OMDB_KEY=tu_api_key_aqui
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo Vite con HMR |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea los archivos fuente con Prettier |
| `npm test` | Ejecuta los tests en modo watch (Vitest) |
| `npm run test:run` | Ejecuta los tests una sola vez (modo CI) |
| `npm run coverage` | Ejecuta los tests y genera reporte de cobertura |

---

## Arquitectura

```
src/
├── components/
│   ├── SearchBar.jsx         # Formulario de búsqueda con filtros de tipo y año
│   ├── MovieCard.jsx         # Tarjeta de resultado con póster, géneros y favorito
│   ├── SkeletonCard.jsx      # Tarjeta de carga (skeleton loader)
│   ├── MovieModal.jsx        # Modal accesible con detalle completo
│   ├── FavoritesSidebar.jsx  # Sidebar de favoritos con ordenación
│   ├── FeaturedSection.jsx   # Carrusel horizontal de películas precargadas
│   ├── GenreGrid.jsx         # Grid de tarjetas de género para exploración inicial
│   └── Icons.jsx             # Librería de iconos SVG inline (sin dependencias extra)
├── hooks/
│   ├── useMovies.js          # Estado de búsqueda, paginación y fetch de géneros
│   ├── useFavorites.js       # Persistencia de favoritos en LocalStorage
│   └── useMediaQuery.js      # Hook para detectar breakpoints responsive
├── services/
│   ├── omdb.js               # Wrapper de la API OMDb (searchMovies, getMovieDetail)
│   └── youtube.js            # Búsqueda de tráiler por ID via YouTube Data API v3
├── utils/
│   ├── constants.js          # Constantes compartidas (placeholder SVG, etc.)
│   └── sortFavorites.js      # Lógica de ordenación de favoritos (A-Z, género, fecha)
├── App.jsx                   # Layout principal: header, main, sidebar, modal
├── index.css                 # Sistema de diseño global (tokens, componentes)
└── main.jsx                  # Punto de entrada de React
```

### Dependencias principales

| Paquete | Propósito |
|---------|-----------|
| React 19 | Framework de UI |
| Vite 8 | Build tool y servidor de desarrollo |
| ESLint | Análisis estático de código |
| Prettier | Formateo de código |

Sin librerías adicionales en runtime — solo React hooks y las APIs nativas del navegador (`fetch` y `localStorage`).

---

## Decisiones técnicas

**Estrategia de obtención de géneros** — El endpoint de búsqueda de OMDb (`s=`) no devuelve datos de género. Después de cada búsqueda, la app dispara llamadas paralelas a `getMovieDetail` en segundo plano para cada `imdbID`, almacenando los resultados en caché. Las tarjetas muestran "Loading..." mientras esperan y se actualizan automáticamente. Una ref `searchId` previene que respuestas de búsquedas anteriores sobreescriban los resultados actuales.

**Manejo de estado** — Dos hooks personalizados (`useMovies`, `useFavorites`) cubren todo el estado. No se necesita un store externo para esta escala. El hook `useFavorites` se sincroniza automáticamente con `localStorage` en cada cambio mediante `useEffect`.

**Paginación** — El botón "Load more" agrega resultados al grid existente, conservando la posición del scroll y las tarjetas ya cargadas.

**Accesibilidad** — El modal usa `role="dialog"`, `aria-modal="true"`, trampa de foco (ciclo Tab/Shift-Tab) y `Escape` para cerrar. Los botones de favorito usan `aria-pressed`. Los estados de carga usan `aria-live` y `aria-busy`. Todos los elementos interactivos tienen atributos `aria-label` descriptivos.

**Seguridad de la API key** — La key se almacena en un archivo `.env` (ignorado por git) y se accede mediante `import.meta.env.VITE_OMDB_KEY`. Nunca se escribe directamente en el código.

---

## Actividad 2 — Deep copy

Ejecutar desde la raíz del proyecto (requiere Node.js 17+):

```bash
node jsonActivity2.js
```

El script:
1. Define el arreglo JSON original del Anexo 1
2. Crea una copia profunda usando `structuredClone` — el original nunca se muta
3. Modifica 6 campos en la copia: `nombre`, `apellidoPat`, `rfc`, `fechaNacimiento`, `email`, `direccion.colonia`
4. Imprime ambos arreglos y una verificación comparativa que demuestra que el original no fue modificado

---

## Observaciones

### Carteles de películas con error 404

Si al usar la aplicación notas que algunas tarjetas muestran un póster en gris en lugar de la imagen real de la película, no se trata de un error en el código — es una limitación conocida de la API de OMDb.

**¿Por qué ocurre?**

OMDb almacena los carteles de las películas en servidores de Amazon S3 y entrega su URL dentro del campo `Poster` de cada respuesta. Ocasionalmente, algunas de esas URLs devuelven un error HTTP **404 (Not Found)** por alguna de estas razones:

- El enlace de Amazon S3 expiró o el archivo fue movido/eliminado del servidor.
- El título no tiene un póster registrado en la base de datos de OMDb, pero en lugar de devolver `"N/A"` (que sería lo esperado), la API devuelve una URL que apunta a un recurso inexistente.
- La tier gratuita de OMDb tiene ciertas limitaciones en la calidad y disponibilidad de los metadatos, incluidos los carteles.

**Cómo lo maneja esta aplicación**

Cada elemento `<img>` que muestra un cartel incluye un controlador `onError`. En el momento en que el navegador detecta que la imagen no pudo cargarse (404 u otro error de red), el controlador reemplaza automáticamente la fuente de la imagen por un **placeholder SVG** neutro integrado directamente en el código — sin dependencias externas y sin peticiones adicionales a la red.

Esto garantiza que el usuario nunca vea imágenes rotas; en su lugar verá un espacio reservado coherente con la paleta de color de la tarjeta.

> Esta situación es completamente ajena a la implementación de la aplicación y afecta a cualquier cliente que consuma la API pública de OMDb.

### Uso de YouTube Data API v3 para el tráiler

La funcionalidad de tráiler utiliza la **YouTube Data API v3** en lugar de un simple enlace embebido. La razón es que el parámetro `listType=search` que YouTube ofrecía en sus URLs de embed para buscar videos directamente fue descontinuado y ya no funciona — el reproductor simplemente devuelve "video no disponible" sin importar el título que se busque.

La alternativa que sí funciona es hacer una llamada al endpoint de búsqueda de la API (`/youtube/v3/search`), obtener el `videoId` del primer resultado relevante, y construir la URL de embed con ese ID. De esta manera el video que se muestra es el correcto y se reproduce directamente dentro del modal.

**Configuración necesaria**

Obtén una API key gratuita en [Google Cloud Console](https://console.cloud.google.com/):

1. Crea un proyecto y habilita **YouTube Data API v3**
2. Ve a *Credentials* → *Create API Key*
3. Agrega la key al archivo `.env`:

```env
VITE_YOUTUBE_KEY=tu_api_key_aqui
```

La cuota gratuita por defecto es de 10,000 unidades diarias. Cada búsqueda de tráiler consume 100 unidades, lo que equivale a unas 100 búsquedas por día sin costo.
