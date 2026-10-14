import { FiltroEstado, Libro, LibroInput } from "./Libro.js";

export interface ResultadoOperacion {
  exito: boolean;
  errores: string[];
  libro?: Libro;
}

export class CatalogoLibros {
  private libros: Libro[];
  private siguienteId: number;

  constructor(libros: Libro[] = []) {
    this.libros = [...libros];
    const maxId = this.libros.reduce((max, l) => Math.max(max, l.id), 0);
    this.siguienteId = maxId + 1;
  }

  public agregar(input: LibroInput): ResultadoOperacion {
    const errores = this.validar(input);
    if (errores.length > 0) return { exito: false, errores };

    const libro = Libro.crear(this.siguienteId++, input);
    this.libros.push(libro);
    return { exito: true, errores: [], libro };
  }

  public actualizar(id: number, input: LibroInput): ResultadoOperacion {
    const libro = this.obtenerPorId(id);
    if (!libro) return { exito: false, errores: ["El libro no existe."] };

    const errores = this.validar(input, id);
    if (errores.length > 0) return { exito: false, errores };

    libro.actualizar(input);
    return { exito: true, errores: [], libro };
  }

  public eliminar(id: number): boolean {
    const cantidad = this.libros.length;
    this.libros = this.libros.filter((l) => l.id !== id);
    return this.libros.length < cantidad;
  }

  public alternarLeido(id: number): Libro | undefined {
    const libro = this.obtenerPorId(id);
    libro?.alternarLeido();
    return libro;
  }

  public obtenerTodos(): Libro[] {
    return [...this.libros];
  }

  public obtenerPorId(id: number): Libro | undefined {
    return this.libros.find((l) => l.id === id);
  }

  public total(): number {
    return this.libros.length;
  }

  public filtrar(texto: string, estado: FiltroEstado): Libro[] {
    return this.libros
      .filter((l) => l.coincideCon(texto))
      .filter((l) => {
        if (estado === "leidos") return l.leido;
        if (estado === "pendientes") return !l.leido;
        return true;
      });
  }

  public existeDuplicado(input: LibroInput, excluirId?: number): boolean {
    return this.libros.some((l) => l.id !== excluirId && l.esDuplicadoDe(input));
  }

  private validar(input: LibroInput, excluirId?: number): string[] {
    const errores = [...Libro.validar(input).errores];
    if (errores.length === 0 && this.existeDuplicado(input, excluirId)) {
      errores.push("Ya existe un libro con el mismo título y autor.");
    }
    return errores;
  }
}