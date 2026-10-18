import {
  CriterioOrden,
  FiltroEstado,
  GENERO_TODOS,
  Libro,
  LibroInput,
} from "./Libro.js";

export interface ResultadoOperacion {
  exito: boolean;
  errores: string[];
  libro?: Libro;
}

export interface CriteriosConsulta {
  texto: string;
  estado: FiltroEstado;
  genero: string; // un género o GENERO_TODOS
  orden: CriterioOrden;
}

export interface ResumenGenero {
  genero: string;
  cantidad: number;
  promedio: number; // 0 si no hay libros calificados
}

export interface Estadisticas {
  total: number;
  leidos: number;
  pendientes: number;
  calificados: number;
  promedio: number; // promedio de libros calificados; 0 si no hay
  porGenero: ResumenGenero[];
}

export interface Recomendacion {
  libro: Libro;
  promedioGenero: number;
}

export class LibroModel {
  public static readonly PROMEDIO_MINIMO_RECOMENDACION = 3;

  private libros: Libro[];
  private siguienteId: number;

  constructor(libros: Libro[] = []) {
    this.libros = [...libros];
    const maxId = this.libros.reduce((max, l) => Math.max(max, l.id), 0);
    this.siguienteId = maxId + 1;
  }

  // CRUD

  public addLibro(input: LibroInput): ResultadoOperacion {
    const errores = this.validar(input);
    if (errores.length > 0) return { exito: false, errores };

    const libro = Libro.crear(this.siguienteId++, input);
    this.libros.push(libro);
    return { exito: true, errores: [], libro };
  }

  public updateLibro(id: number, input: LibroInput): ResultadoOperacion {
    const libro = this.getLibroById(id);
    if (!libro) return { exito: false, errores: ["El libro no existe."] };

    const errores = this.validar(input, id);
    if (errores.length > 0) return { exito: false, errores };

    libro.actualizar(input);
    return { exito: true, errores: [], libro };
  }

  public deleteLibro(id: number): boolean {
    const cantidad = this.libros.length;
    this.libros = this.libros.filter((l) => l.id !== id);
    return this.libros.length < cantidad;
  }

  public toggleLeido(id: number): Libro | undefined {
    const libro = this.getLibroById(id);
    libro?.alternarLeido();
    return libro;
  }

  public getAllLibros(): Libro[] {
    return [...this.libros];
  }

  public getLibroById(id: number): Libro | undefined {
    return this.libros.find((l) => l.id === id);
  }

  public total(): number {
    return this.libros.length;
  }

  // Busqueda , filtrado y el orden 

  public filterByGenero(genero: string, libros: Libro[] = this.libros): Libro[] {
    if (genero === GENERO_TODOS) return [...libros];
    return libros.filter((l) => l.genero === genero);
  }

  public filterByEstado(estado: FiltroEstado, libros: Libro[] = this.libros): Libro[] {
    if (estado === "leidos") return libros.filter((l) => l.leido);
    if (estado === "pendientes") return libros.filter((l) => !l.leido);
    return [...libros];
  }

  public sortByTitulo(libros: Libro[] = this.libros, ascendente = true): Libro[] {
    const factor = ascendente ? 1 : -1;
    return [...libros].sort(
      (a, b) =>
        factor * a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" })
    );
  }

  public sortByAnio(libros: Libro[] = this.libros, ascendente = true): Libro[] {
    const factor = ascendente ? 1 : -1;
    return [...libros].sort((a, b) => factor * (a.anio - b.anio));
  }

  // Aplica en cadena, la busqueda, el filtro por estado, el filtro por género y el orden.
  public consultar(criterios: CriteriosConsulta): Libro[] {
    let resultado = this.libros.filter((l) => l.coincideCon(criterios.texto));
    resultado = this.filterByEstado(criterios.estado, resultado);
    resultado = this.filterByGenero(criterios.genero, resultado);
    return this.ordenar(resultado, criterios.orden);
  }

  // Estadisticas y recomendaciones

  public getEstadisticas(): Estadisticas {
    const total = this.libros.length;
    const leidos = this.libros.filter((l) => l.leido).length;
    const calificados = this.libros.filter((l) => l.calificacion > 0).length;

    const porGenero: ResumenGenero[] = this.generosPresentes().map((genero) => {
      const delGenero = this.libros.filter((l) => l.genero === genero);
      return {
        genero,
        cantidad: delGenero.length,
        promedio: this.promedio(delGenero),
      };
    });
    porGenero.sort(
      (a, b) => b.cantidad - a.cantidad || a.genero.localeCompare(b.genero, "es")
    );

    return {
      total,
      leidos,
      pendientes: total - leidos,
      calificados,
      promedio: this.promedio(this.libros),
      porGenero,
    };
  }

  // Reto: recomienda libros pendientes de los géneros mejor calificados (promedio >= 3). 
  public getRecomendaciones(limite = 3): Recomendacion[] {
    const promedios = new Map<string, number>();
    for (const genero of this.generosPresentes()) {
      const p = this.promedio(this.libros.filter((l) => l.genero === genero));
      if (p >= LibroModel.PROMEDIO_MINIMO_RECOMENDACION) promedios.set(genero, p);
    }

    return this.libros
      .filter((l) => !l.leido && promedios.has(l.genero))
      .map((libro) => ({
        libro,
        promedioGenero: promedios.get(libro.genero) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.promedioGenero - a.promedioGenero ||
          a.libro.titulo.localeCompare(b.libro.titulo, "es")
      )
      .slice(0, limite);
  }

  public existeDuplicado(input: LibroInput, excluirId?: number): boolean {
    return this.libros.some((l) => l.id !== excluirId && l.esDuplicadoDe(input));
  }

  // ----- privados -----

  private ordenar(libros: Libro[], orden: CriterioOrden): Libro[] {
    switch (orden) {
      case "titulo-asc":
        return this.sortByTitulo(libros, true);
      case "titulo-desc":
        return this.sortByTitulo(libros, false);
      case "anio-asc":
        return this.sortByAnio(libros, true);
      case "anio-desc":
        return this.sortByAnio(libros, false);
      default:
        return [...libros]; // orden de registro
    }
  }

  private generosPresentes(): string[] {
    return [...new Set(this.libros.map((l) => l.genero))];
  }

  private promedio(libros: Libro[]): number {
    const calificados = libros.filter((l) => l.calificacion > 0);
    if (calificados.length === 0) return 0;
    const suma = calificados.reduce((s, l) => s + l.calificacion, 0);
    return Math.round((suma / calificados.length) * 100) / 100;
  }

  private validar(input: LibroInput, excluirId?: number): string[] {
    const errores = [...Libro.validar(input).errores];
    if (errores.length === 0 && this.existeDuplicado(input, excluirId)) {
      errores.push("Ya existe un libro con el mismo título y autor.");
    }
    return errores;
  }
}