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
│   └── omdb.js               # Wrapper de la API OMDb (searchMovies, getMovieDetail)
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
