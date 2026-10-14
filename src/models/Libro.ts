export interface LibroData {
  id: number;
  titulo: string;
  autor: string;
  anio: number;
  leido: boolean;
}

export interface LibroInput {
  titulo: string;
  autor: string;
  anio: number;
}

export type FiltroEstado = "todos" | "leidos" | "pendientes";

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
}

export class Libro implements LibroData {
  public static readonly ANIO_MINIMO = 1000;

  constructor(
    public readonly id: number,
    public titulo: string,
    public autor: string,
    public anio: number,
    public leido: boolean = false
  ) {}

  public static validar(input: LibroInput): ResultadoValidacion {
    const errores: string[] = [];
    const anioMaximo = new Date().getFullYear() + 1;

    if (!input.titulo || input.titulo.trim().length < 2) {
      errores.push("El título es obligatorio (mínimo 2 caracteres).");
    }
    if (!input.autor || input.autor.trim().length < 2) {
      errores.push("El autor es obligatorio (mínimo 2 caracteres).");
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
    return { valido: errores.length === 0, errores };
  }

  public static crear(id: number, input: LibroInput): Libro {
    return new Libro(id, input.titulo.trim(), input.autor.trim(), input.anio, false);
  }

  public static desdeData(data: LibroData): Libro {
    return new Libro(data.id, data.titulo, data.autor, data.anio, data.leido);
  }

  public actualizar(input: LibroInput): void {
    this.titulo = input.titulo.trim();
    this.autor = input.autor.trim();
    this.anio = input.anio;
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
      leido: this.leido,
    };
  }
}