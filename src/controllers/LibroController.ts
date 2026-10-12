import { FiltroEstado, Libro, LibroInput } from "../models/Libro.js";
import { StorageService } from "../services/StorageService.js";
import { LibroView } from "../views/LibroView.js";

export class LibroController {
  private libros: Libro[];
  private textoBusqueda = "";
  private filtro: FiltroEstado = "todos";

  constructor(
    private readonly view: LibroView,
    private readonly storage: StorageService
  ) {
    this.libros = this.storage.cargar();
  }

  public iniciar(): void {
    this.view.enlazar({
      onGuardar: (input, id) => this.guardar(input, id),
      onBuscar: (texto) => {
        this.textoBusqueda = texto;
        this.refrescar();
      },
      onFiltrar: (f) => {
        this.filtro = f;
        this.refrescar();
      },
      onAlternar: (id) => this.alternarEstado(id),
      onEditar: (id) => this.iniciarEdicion(id),
      onEliminar: (id) => this.eliminar(id),
      onCancelarEdicion: () => this.view.salirModoEdicion(),
    });
    this.refrescar();
  }

  private guardar(input: LibroInput, idEdicion: string | null): void {
    const resultado = Libro.validar(input);
    if (!resultado.valido) {
      this.view.mostrarMensaje(resultado.errores, "error");
      return;
    }

    if (idEdicion) {
      const libro = this.buscarPorId(idEdicion);
      if (!libro) return;
      libro.actualizar(input);
      this.persistir("Libro actualizado correctamente.");
    } else {
      this.libros.push(Libro.crear(input));
      this.persistir("Libro agregado correctamente.");
    }
    this.view.salirModoEdicion();
    this.refrescar();
  }

  private iniciarEdicion(id: string): void {
    const libro = this.buscarPorId(id);
    if (libro) this.view.entrarModoEdicion(libro);
  }

  private alternarEstado(id: string): void {
    const libro = this.buscarPorId(id);
    if (!libro) return;
    libro.alternarLeido();
    this.persistir(libro.leido ? "Marcado como leído." : "Marcado como pendiente.");
    this.refrescar();
  }

  private eliminar(id: string): void {
    const libro = this.buscarPorId(id);
    if (!libro) return;
    if (!this.view.confirmar(`¿Eliminar "${libro.titulo}"?`)) return;
    this.libros = this.libros.filter((l) => l.id !== id);
    this.persistir("Libro eliminado.");
    this.view.salirModoEdicion();
    this.refrescar();
  }

  private obtenerFiltrados(): Libro[] {
    return this.libros
      .filter((l) => l.coincideCon(this.textoBusqueda))
      .filter((l) => {
        if (this.filtro === "leidos") return l.leido;
        if (this.filtro === "pendientes") return !l.leido;
        return true;
      });
  }

  private refrescar(): void {
    this.view.marcarFiltro(this.filtro);
    this.view.renderLista(this.obtenerFiltrados(), this.libros.length);
  }

  private buscarPorId(id: string): Libro | undefined {
    return this.libros.find((l) => l.id === id);
  }

  private persistir(mensajeExito: string): void {
    if (this.storage.guardar(this.libros)) {
      this.view.mostrarMensaje(mensajeExito, "exito");
    } else {
      this.view.mostrarMensaje("No se pudo guardar en localStorage.", "error");
    }
  }
}