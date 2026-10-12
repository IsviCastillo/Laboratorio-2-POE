# Catálogo de Libros

Aplicación web para administrar un catálogo personal de libros. Desarrollada con **TypeScript** siguiendo la arquitectura **MVC**, sin frameworks, con persistencia en `localStorage`.

## Funcionalidades

- Registrar libros (título, autor y año) mediante formulario.
- Listar libros en tarjetas.
- Buscar por título o autor (en tiempo real).
- Marcar libros como **leídos** o **pendientes**.
- Editar y eliminar libros (con confirmación).
- Filtrar por estado: Todos / Pendientes / Leídos.
- Validación de datos con mensajes de error y éxito.
- Persistencia automática en `localStorage`.

## Arquitectura MVC

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Model | `src/models/Libro.ts` | Datos del libro, interfaces, tipos y validaciones |
| View | `src/views/LibroView.ts` | Renderiza la lista y mensajes, captura eventos del DOM |
| Controller | `src/controllers/LibroController.ts` | CRUD, búsqueda, filtros; coordina Model, View y Service |
| Service | `src/services/StorageService.ts` | Lectura y escritura en `localStorage` |
| Entrada | `src/main.ts` | Crea las instancias y arranca la app |

### Flujo
1. El usuario interactúa con la **Vista** (formulario, búsqueda, botones).
2. La Vista notifica al **Controlador** mediante manejadores (`ManejadoresVista`).
3. El Controlador usa el **Modelo** (validar, crear, actualizar) y el **Servicio** (persistir).
4. El Controlador pide a la Vista que se vuelva a dibujar.

La Vista no conoce el almacenamiento y el Modelo no conoce el DOM.

## Uso de TypeScript

- **Clase** `Libro` con propiedades tipadas, métodos estáticos (`validar`, `crear`, `desdeData`) y métodos de instancia.
- **Interfaces**: `LibroData`, `LibroInput`, `ResultadoValidacion`, `ManejadoresVista`.
- **Tipos unión**: `FiltroEstado = "todos" | "leidos" | "pendientes"`, `TipoMensaje`.
- Modo `strict` activado en `tsconfig.json`.

## Instalación y ejecución

Requisitos: Node.js 18 o superior.

```bash
npm install        # instala TypeScript
npm run build      # compila src/ → dist/
npm start          # sirve el proyecto en http://localhost:8080
```

> Los módulos ES requieren servir los archivos por HTTP; abrir `index.html` directamente con `file://` no funciona. Usa `npm start` o la extensión *Live Server* de VS Code.

Para desarrollo: `npm run watch` recompila al guardar.

## Estructura

```
catalogo-libros/
├── index.html
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── models/Libro.ts
│   ├── views/LibroView.ts
│   ├── controllers/LibroController.ts
│   ├── services/StorageService.ts
│   └── style/styles.css
└── README.md
```

## Validaciones

- Título y autor: obligatorios, mínimo 2 caracteres.
- Año: entero entre 1000 y el año actual + 1.

## Guía rápida para la defensa

- **¿Por qué MVC?** Separa datos, interfaz y lógica; facilita mantenimiento y pruebas.
- **¿Dónde se valida?** En el modelo (`Libro.validar`); el controlador decide qué mostrar.
- **¿Cómo se persiste?** `StorageService` serializa a JSON en `localStorage`; se carga al iniciar el controlador.
- **¿Cómo funcionan los botones de cada tarjeta?** Delegación de eventos en el contenedor de la lista usando `data-accion` y `data-id`.

