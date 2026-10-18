export const GENEROS = [
  "Novela",
  "Ciencia ficción",
  "Fantasía",
  "Misterio",
  "Terror",
  "Romance",
  "Historia",
  "Biografía",
  "Ciencia",
  "Autoayuda",
  "Poesía",
  "Otros",
] as const;

export const GENERO_TODOS = "todos";

export interface LibroData {
  id: number;
  titulo: string;
  autor: string;
  anio: number;
  genero: string;
  calificacion: number; // 0 = sin calificar, 1-5 estrellas
  leido: boolean;
}

export type LibroGuardado = Omit<LibroData, "genero" | "calificacion"> &
  Partial<Pick<LibroData, "genero" | "calificacion">>;

export interface LibroInput {
  titulo: string;
  autor: string;
  anio: number;
  genero: string;
  calificacion: number;
}

export type FiltroEstado = "todos" | "leidos" | "pendientes";

export type CriterioOrden =
  | "registro"
  | "titulo-asc"
  | "titulo-desc"
  | "anio-asc"
  | "anio-desc";

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
}

export class Libro implements LibroData {
  public static readonly ANIO_MINIMO = 1000;
  public static readonly CALIFICACION_MAXIMA = 5;
  public static readonly GENERO_POR_DEFECTO = "Otro";

  private static readonly REGEX_AUTOR = /^[\p{L}][\p{L}\s.'’-]*$/u;
  private static readonly REGEX_TITULO = /[\p{L}\p{N}]/u;

  constructor(
    public readonly id: number,
    public titulo: string,
    public autor: string,
    public anio: number,
    public genero: string,
    public calificacion: number = 0,
    public leido: boolean = false
  ) {}

  public static validar(input: LibroInput): ResultadoValidacion {
    const errores: string[] = [];
    const anioMaximo = new Date().getFullYear() + 1;
    const titulo = (input.titulo ?? "").trim();
    const autor = (input.autor ?? "").trim();

    if (titulo.length < 2) {
      errores.push("El título es obligatorio (mínimo 2 caracteres).");
    } else if (!Libro.REGEX_TITULO.test(titulo)) {
      errores.push("El título debe contener letras o números.");
    }

    if (autor.length < 2) {
      errores.push("El autor es obligatorio (mínimo 2 caracteres).");
    } else if (!Libro.REGEX_AUTOR.test(autor)) {
      errores.push(
        "El autor solo puede contener letras, espacios, puntos, guiones y apóstrofes."
      );
    }

    if (
      !Number.isInteger(input.anio) ||
      input.anio < Libro.ANIO_MINIMO ||
      input.anio > anioMaximo
    ) {
      errores.push(
        `El año debe ser un número entero entre ${Libro.ANIO_MINIMO} y ${anioMaximo}.`
      );
    }

    if (!(GENEROS as readonly string[]).includes(input.genero)) {
      errores.push("Selecciona un género de la lista.");
    }

    if (
      !Number.isInteger(input.calificacion) ||
      input.calificacion < 0 ||
      input.calificacion > Libro.CALIFICACION_MAXIMA
    ) {
      errores.push(
        `La calificación debe estar entre 1 y ${Libro.CALIFICACION_MAXIMA} estrellas (0 = sin calificar).`
      );
    }

    return { valido: errores.length === 0, errores };
  }

  public static crear(id: number, input: LibroInput): Libro {
    return new Libro(
      id,
      input.titulo.trim(),
      input.autor.trim(),
      input.anio,
      input.genero,
      input.calificacion,
      false
    );
  }

  public static desdeData(data: LibroGuardado): Libro {
    return new Libro(
      data.id,
      data.titulo,
      data.autor,
      data.anio,
      data.genero ?? Libro.GENERO_POR_DEFECTO,
      data.calificacion ?? 0,
      data.leido
    );
  }

  public actualizar(input: LibroInput): void {
    this.titulo = input.titulo.trim();
    this.autor = input.autor.trim();
    this.anio = input.anio;
    this.genero = input.genero;
    this.calificacion = input.calificacion;
  }

  public alternarLeido(): void {
    this.leido = !this.leido;
  }

  public coincideCon(texto: string): boolean {
    const t = texto.trim().toLowerCase();
    if (!t) return true;
    const idBuscado = t.startsWith("#") ? t.slice(1) : t;
    return (
      this.titulo.toLowerCase().includes(t) ||
      this.autor.toLowerCase().includes(t) ||
      this.genero.toLowerCase().includes(t) ||
      String(this.id) === idBuscado
    );
  }

  public esDuplicadoDe(input: LibroInput): boolean {
    const normalizar = (s: string): string => s.trim().toLowerCase();
    return (
      normalizar(this.titulo) === normalizar(input.titulo) &&
      normalizar(this.autor) === normalizar(input.autor)
    );
  }

  public toData(): LibroData {
    return {
      id: this.id,
      titulo: this.titulo,
      autor: this.autor,
      anio: this.anio,
      genero: this.genero,
      calificacion: this.calificacion,
      leido: this.leido,
    };
  }
}