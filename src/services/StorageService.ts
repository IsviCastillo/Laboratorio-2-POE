import { Libro, LibroData, LibroGuardado } from "../models/Libro.js";

export class StorageService {
  constructor(private readonly clave: string = "catalogo-libros") {}

  public cargar(): Libro[] {
    try {
      const raw = localStorage.getItem(this.clave);
      if (!raw) return [];
      const datos: unknown = JSON.parse(raw);
      if (!Array.isArray(datos)) return [];

      const lista = datos as LibroGuardado[];
      // Migración: IDs no enteros se renumeran; libros sin género/calificación reciben valores por defecto.
      const idsValidos = lista.every((d) => Number.isInteger(d.id));
      return lista.map((d, i) =>
        Libro.desdeData(idsValidos ? d : { ...d, id: i + 1 })
      );
    } catch {
      return [];
    }
  }

  public guardar(libros: Libro[]): boolean {
    try {
      const datos: LibroData[] = libros.map((l) => l.toData());
      localStorage.setItem(this.clave, JSON.stringify(datos));
      return true;
    } catch {
      return false;
    }
  }
}