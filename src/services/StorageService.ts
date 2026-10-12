import { Libro, LibroData } from "../models/Libro.js";

export class StorageService {
  constructor(private readonly clave: string = "catalogo-libros") {}

  public cargar(): Libro[] {
    try {
      const raw = localStorage.getItem(this.clave);
      if (!raw) return [];
      const datos: unknown = JSON.parse(raw);
      if (!Array.isArray(datos)) return [];
      return (datos as LibroData[]).map((d) => Libro.desdeData(d));
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