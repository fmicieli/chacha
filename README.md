# Chacha · Tienda online

Tienda estática de Chacha (Mercedes, Buenos Aires). Catálogo con precios, carrito en el
navegador y cierre de compra por WhatsApp. Las administradoras cargan productos desde
Pages CMS sin tocar código.

- **Sitio:** https://fmicieli.github.io/chacha/
- **Panel:** https://app.pagescms.org
- **Guía para las administradoras:** [`GUIA-DE-CARGA.md`](GUIA-DE-CARGA.md)

## Stack

| Parte | Herramienta |
|---|---|
| Framework | [Astro](https://astro.build) 7, salida 100% estática |
| Hosting | GitHub Pages, deploy con GitHub Actions (`.github/workflows/deploy.yml`) |
| CMS | [Pages CMS](https://pagescms.org) (`.pages.yml`) |
| Datos | Content collections de Astro con schemas Zod (`src/content.config.ts`) |
| JS en el cliente | TypeScript sin framework: carrito, galería, menú |
| Tipografía | Nunito Sans variable, self-hosted (`@fontsource-variable/nunito-sans`) |

## Desarrollo

Requiere Node 22.12 o más nuevo.

```bash
npm install
npm run dev      # http://localhost:4321/chacha/  (ojo: con /chacha/ al final)
npm run check    # chequeo de tipos
npm run build    # genera dist/
npm run preview  # sirve dist/
```

### Si el servidor de desarrollo muestra datos viejos

Después de cambiar `src/content.config.ts` (el schema), pará el servidor, borrá la
caché y volvé a arrancar:

```bash
rm -rf .astro node_modules/.astro && npm run dev
```

## Estructura

```
.pages.yml                  Config del CMS (campos, labels, carpetas de fotos)
GUIA-DE-CARGA.md            Guía sin jerga para las administradoras
src/
  assets/{productos,sitio,paginas}/   Fotos (las sube el CMS; Astro las optimiza)
  content/
    productos/*.json        Un archivo por producto
    config/sitio.json       WhatsApp, Instagram, portada, textos, grilla de Instagram
    paginas/sobre-nosotras.md
  content.config.ts         Schemas Zod: el build falla si falta un dato
  lib/
    catalogo.ts             Secciones y subcategorías (fuente única)
    productos.ts            Consultas: novedades, agrupado por sección, relacionados
    site.ts                 Config del sitio + aviso de WhatsApp placeholder
    url.ts                  url(): toda ruta interna pasa por acá (respeta `base`)
    format.ts               Precios: $ 25.000
    cart.ts                 Carrito (localStorage) + hidratación contra productos.json
    checkout/               CheckoutProvider + proveedor de WhatsApp
  components/               Header, Footer, ProductCard, ProductGallery, CartUI, …
  pages/
    productos.json.ts       Índice liviano que usa el carrito
    producto/[slug].astro   Detalle
    carrito.astro           Carrito + formulario + envío
```

## Rutas y `base`

El sitio vive bajo `/chacha/`. Todos los links internos y los assets de `public/` pasan
por `url()` en `src/lib/url.ts`. No hay que escribir rutas absolutas a mano.

## Modelo de datos

### Productos (`src/content/productos/*.json`)

| Campo | Notas |
|---|---|
| `nombre` | Texto |
| `subcategoria` | `abanicos`, `tote-bags` (Accesorios) · `fundas`, `caminos`, `posavasos` (Home) |
| `precio` | Entero en pesos |
| `descripcion`, `medidas`, `material` | Texto |
| `fotos` | 1 a 3 `{ imagen, alt }`. La primera es la principal. `alt` obligatorio |
| `estado` | `disponible` \| `vendido` |
| `fecha_alta` | `yyyy-MM-dd`. Ordena Novedades |
| `destacado` | Opcional. Aparece primero en Novedades |

Dos datos **no se guardan** y se calculan en `src/lib/productos.ts`:

- **`slug`** = nombre del archivo, normalizado (sin acentos, en minúsculas y con guiones).
  Pages CMS nombra el archivo a partir del nombre del producto al crearlo (`{primary}.json`,
  con `slugify` en modo `strict`). Es único por definición y la URL no cambia si después se
  renombra el producto.
- **`seccion`** se deduce de `subcategoria`. Así un producto no puede quedar en la
  sección equivocada.

El build **falla** si falta un campo requerido, si hay más de 3 fotos, si una foto no
tiene `alt` o si el precio tiene decimales. Los mensajes de error están en español.

### Rutas de imágenes

Las imágenes se guardan relativas al archivo de contenido
(`../../assets/productos/foto.jpg`) para que `image()` de Astro las procese: genera WebP,
tamaños responsivos y la imagen para Open Graph. En `.pages.yml`, cada carpeta de fotos
usa `output: ../../assets/<carpeta>`. Pages CMS traduce esa ruta en los dos sentidos.
Todos los archivos de contenido están dos niveles debajo de `src/`, así que la misma
ruta relativa sirve para todos.

### Detalles de Pages CMS

- Al guardar, Pages CMS **reescribe el archivo solo con los campos de `.pages.yml`** y
  borra los vacíos. Si agregás un campo al schema, agregalo también al CMS.
- Las listas escritas como objeto (`list: { max: 2 }`) necesitan `collapsible`: si falta,
  Pages CMS rechaza el config.

### Cambiar secciones o subcategorías

Editar `src/lib/catalogo.ts` **y** las opciones de `subcategoria` en `.pages.yml`.

## Carrito y checkout

- `localStorage["chacha-carrito"]` guarda **solo slugs**. Si `localStorage` no está
  disponible, funciona en memoria.
- En cada carga se cruza contra `/productos.json`. Si un producto se vendió o se eliminó,
  se saca del carrito con un aviso; si cambió el precio, se muestra el nuevo.
- Antes de abrir WhatsApp se vuelve a validar con `/productos.json` (`cache: no-cache`).
- La pestaña de WhatsApp se abre **en el mismo click**, antes de esa validación, y
  recién después se le carga la URL. Si se abriera después de un `await`, Safari la
  bloquearía como pop-up.
- El carrito no se vacía solo: después del envío aparece el botón "Vaciar carrito".

### `CheckoutProvider`

```ts
interface CheckoutProvider {
  id: string;
  label: string;
  checkout(order: Order, ctx?: { ventana?: Window | null }): Promise<void>;
}
```

Hoy existe un solo proveedor: `createWhatsappProvider(numero)` (`src/lib/checkout/whatsapp.ts`).

## Deploy

Cada push a `main` (o cada guardado en el CMS, que es un commit) corre el workflow y
publica en 1 o 2 minutos.

### Primera vez

1. Crear el repo en GitHub y subir `main`.
2. GitHub → **Settings → Pages → Source: GitHub Actions**.
3. Entrar a https://app.pagescms.org con GitHub e instalar la GitHub App de Pages CMS
   en el repo.
4. Sumar a las administradoras (ver abajo).
5. Cargar el número de WhatsApp en el CMS → **Configuración del sitio**. Mientras siga el
   placeholder `549XXXXXXXXXX`, el build muestra un warning y los botones de WhatsApp no
   funcionan.

### Administradoras

Hay dos formas, a elección:

- **Con cuenta de GitHub:** agregarla como colaboradora del repo (Settings →
  Collaborators). Entra al panel con "Sign in with GitHub".
- **Solo con mail (recomendado si no usa GitHub):** en Pages CMS, desde el repo →
  **Collaborators**, invitarla por mail. Entra con su mail y un código que le llega al
  correo. Puede editar contenido y fotos, pero no la configuración ni las colaboradoras.

## Preparado para el futuro

### Dominio propio

1. En `astro.config.mjs`: `site: 'https://tudominio.com'` y `base: '/'`.
2. Crear `public/CNAME` con el dominio.
3. Configurar el DNS según la [guía de GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

Como todas las rutas pasan por `url()`, no hay que tocar nada más.

### Mercado Pago

Mercado Pago necesita un **backend** para crear la preferencia de pago de forma segura
(el access token no puede estar en el navegador). GitHub Pages no ejecuta código de
servidor, así que habrá que elegir una de estas opciones:

- migrar el hosting a Vercel, Netlify o Cloudflare Pages y usar una función serverless, o
- mantener GitHub Pages y sumar una función externa (ej. Cloudflare Workers).

Del lado del sitio: crear `src/lib/checkout/mercadopago.ts` que implemente
`CheckoutProvider`. Su `checkout(order)` llama a la función, recibe el `init_point` y
redirige. Después hay que ofrecer los dos proveedores en `carrito.astro`.

### Otros

| Cambio | Dónde |
|---|---|
| Cambiar el logo | Reemplazar `src/assets/marca/logo.png` (PNG transparente, recortado al contenido) y regenerar `public/favicon-32.png` y `public/apple-touch-icon.png` |
| Analytics | Slot comentado en `src/layouts/BaseLayout.astro` |
| Feed de Instagram en vivo | Reemplazar el contenido de `src/components/InstagramGrid.astro` por el embed del widget (Behold, SnapWidget, …) |
| TikTok | Agregar el campo en `sitio.json`, en el schema y en `.pages.yml`, y el link en `Footer.astro` |
| Filtros o buscador | Los datos ya vienen agrupados por sección y subcategoría (`getSeccionAgrupada`) |

## Pendientes de Chacha

| Pendiente | Dónde |
|---|---|
| Logo en SVG (opcional, para máxima nitidez) | `src/assets/marca/` |
| Número de WhatsApp | CMS → Configuración del sitio |
| Link de Instagram | CMS → Configuración del sitio |
| Texto y fotos de "Sobre nosotras" | CMS → Sobre nosotras (reemplazar `[TEXTO A COMPLETAR]`) |
| Productos reales con fotos | CMS → Productos (siguen de ejemplo los de Accesorios, fundas y posavasos) |
| Material del Caminito Floral Blanco y medidas del Caminito Jacquard Metálico | CMS → Productos (hoy dicen `[A CONFIRMAR]`) |
| Imagen de portada y grilla de Instagram | CMS → Configuración del sitio |
| Acceso de las dos administradoras | Ver "Administradoras" |
