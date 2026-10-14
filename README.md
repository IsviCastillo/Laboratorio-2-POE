# Catálogo de Libros

Aplicación web para administrar un catálogo personal de libros. Desarrollada con **TypeScript** siguiendo la arquitectura **MVC**, sin frameworks, con persistencia en `localStorage`.

## Ejecución del proyecto

Estas son las instrucciones para descargar y ejecutar el proyecto desde una computadora nueva. El procedimiento fue probado desde otro equipo.

### Requisitos previos

Antes de comenzar, instala:

- **Node.js 18 o superior**, que incluye `npm`.
- **Git**, para descargar el repositorio.
- Un navegador web actualizado, como Chrome, Edge, Firefox o Safari.

Puedes comprobar que Node.js y npm estén instalados ejecutando:

```bash
node --version
npm --version
```

### 1. Descargar el repositorio

Clona el repositorio y entra en la carpeta del proyecto:

```bash
git clone https://github.com/IsviCastillo/Laboratorio-2-POE.git
cd Laboratorio-2-POE
```

Si ya descargaste el proyecto como archivo `.zip`, descomprímelo y abre una terminal dentro de la carpeta que contiene `package.json`.

### 2. Instalar las dependencias

Ejecuta:

```bash
npm install
```

Este comando instala las dependencias declaradas en `package.json` y prepara el proyecto para compilarse. También crea o actualiza la carpeta `node_modules`.

### 3. Compilar TypeScript

Ejecuta:

```bash
npm run build
```

Este comando compila los archivos TypeScript de `src/` y genera los archivos JavaScript en `dist/`. Debe finalizar sin errores antes de iniciar la aplicación.

### 4. Iniciar el servidor

Ejecuta:

```bash
npm start
```

El proyecto se servirá localmente en:

<http://localhost:8080>

Abre esa dirección en el navegador para utilizar el catálogo.

### Resumen de comandos

Después de descargar el repositorio, los tres comandos principales son:

```bash
npm install
npm run build
npm start
```

Para detener el servidor, regresa a la terminal y presiona `Ctrl + C`.

> No abras `index.html` directamente con `file://`. La aplicación utiliza módulos ES y debe ejecutarse mediante un servidor HTTP con `npm start` o con una extensión como *Live Server* de VS Code.


### Solución de problemas

#### `npm` o `node` no se reconoce

Instala Node.js desde <https://nodejs.org/> y reinicia la terminal. Comprueba la instalación con:

```bash
node --version
npm --version
```

#### El comando `npm run build` muestra errores

Confirma que estás dentro de la carpeta correcta y que ejecutaste primero `npm install`:

```bash
pwd
ls
npm install
npm run build
```

En Windows, el equivalente de `pwd` y `ls` puede ejecutarse también como:

```powershell
Get-Location
Get-ChildItem
```

#### El navegador no abre la aplicación

Comprueba que `npm start` siga ejecutándose en la terminal y visita manualmente <http://localhost:8080>. Si el puerto está ocupado, cierra el proceso que lo utiliza o reinicia la terminal.

#### Los libros no aparecen después de cerrar el navegador

Los datos se guardan en el `localStorage` del navegador y del mismo origen (`http://localhost:8080`). Si cambias de navegador, eliminas los datos del sitio o abres el proyecto con otra dirección, verás un almacenamiento diferente.

## Funcionalidades

- Registrar libros (título, autor y año) mediante formulario.
- Listar libros en tarjetas.
- Buscar por título, autor o ID (`#3`) en tiempo real.
- IDs numéricos consecutivos visibles en cada tarjeta.
- Bloqueo de libros duplicados (mismo título y autor).
- Marcar libros como **leídos** o **pendientes**.
- Editar y eliminar libros (con confirmación).
- Filtrar por estado: Todos / Pendientes / Leídos.
- Validación de datos con mensajes de error y éxito.
- Persistencia automática en `localStorage`.

## Arquitectura MVC

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Model | `src/models/Libro.ts` | Datos del libro, interfaces, tipos y validaciones de campos |
| Model | `src/models/CatalogoLibros.ts` | Colección de libros: IDs consecutivos, duplicados, búsqueda y filtros |
| View | `src/views/LibroView.ts` | Renderiza la lista y mensajes, captura eventos del DOM |
| Controller | `src/controllers/LibroController.ts` | Recibe eventos, delega al modelo, persiste y actualiza la vista |
| Service | `src/services/StorageService.ts` | Lectura y escritura en `localStorage` |
| Entrada | `src/main.ts` | Crea las instancias y arranca la app |

### Flujo
1. El usuario interactúa con la **Vista** (formulario, búsqueda, botones).
2. La Vista notifica al **Controlador** mediante manejadores (`ManejadoresVista`).
3. El Controlador usa el **Modelo** (`CatalogoLibros`) para aplicar las reglas y el **Servicio** para persistir.
4. El Controlador pide a la Vista que se vuelva a dibujar.

La Vista no conoce el almacenamiento y el Modelo no conoce el DOM.

## Uso de TypeScript

- **Clases**: `Libro` (datos y validaciones) y `CatalogoLibros` (reglas de la colección).
- **Interfaces**: `LibroData`, `LibroInput`, `ResultadoValidacion`, `ResultadoOperacion`, `ManejadoresVista`.
- **Tipos unión**: `FiltroEstado = "todos" | "leidos" | "pendientes"`, `TipoMensaje`.
- Modo `strict` activado en `tsconfig.json`.

## Estructura

```
catalogo-libros/
├── index.html
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── models/
│   │   ├── Libro.ts
│   │   └── CatalogoLibros.ts
│   ├── views/
│   │   └── LibroView.ts
│   ├── controllers/
│   │   └── LibroController.ts
│   ├── services/
│   │   └── StorageService.ts
│   └── styles/
│       └── styles.css
└── README.md
```

## Validaciones

- Título y autor: obligatorios, mínimo 2 caracteres.
- Año: entero entre 1000 y el año actual + 1.
- No se permiten dos libros con el mismo título y autor (sin distinguir mayúsculas ni espacios).

