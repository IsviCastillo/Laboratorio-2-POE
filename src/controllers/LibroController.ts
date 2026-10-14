import { CatalogoLibros } from "../models/CatalogoLibros.js";
import { FiltroEstado, LibroInput } from "../models/Libro.js";
import { StorageService } from "../services/StorageService.js";
import { LibroView } from "../views/LibroView.js";

export class LibroController {
  private textoBusqueda = "";
  private filtro: FiltroEstado = "todos";

  constructor(
    private readonly catalogo: CatalogoLibros,
    private readonly view: LibroView,
    private readonly storage: StorageService
  ) {}

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

  private guardar(input: LibroInput, idEdicion: number | null): void {
    const resultado =
      idEdicion === null
        ? this.catalogo.agregar(input)
        : this.catalogo.actualizar(idEdicion, input);

    if (!resultado.exito) {
      this.view.mostrarMensaje(resultado.errores, "error");
      return;
    }

    this.persistir(
      idEdicion === null
        ? "Libro agregado correctamente."
        : "Libro actualizado correctamente."
    );
    this.view.salirModoEdicion();
    this.refrescar();
  }

  private iniciarEdicion(id: number): void {
    const libro = this.catalogo.obtenerPorId(id);
    if (libro) this.view.entrarModoEdicion(libro);
  }

  private alternarEstado(id: number): void {
    const libro = this.catalogo.alternarLeido(id);
    if (!libro) return;
    this.persistir(libro.leido ? "Marcado como leído." : "Marcado como pendiente.");
    this.refrescar();
  }

  private eliminar(id: number): void {
    const libro = this.catalogo.obtenerPorId(id);
    if (!libro) return;
    if (!this.view.confirmar(`¿Eliminar "${libro.titulo}"?`)) return;
    this.catalogo.eliminar(id);
    this.persistir("Libro eliminado.");
    this.view.salirModoEdicion();
    this.refrescar();
  }

  private refrescar(): void {
    this.view.marcarFiltro(this.filtro);
    this.view.renderLista(
      this.catalogo.filtrar(this.textoBusqueda, this.filtro),
      this.catalogo.total()
    );
  }

  private persistir(mensajeExito: string): void {
    if (this.storage.guardar(this.catalogo.obtenerTodos())) {
      this.view.mostrarMensaje(mensajeExito, "exito");
    } else {
      this.view.mostrarMensaje("No se pudo guardar en localStorage.", "error");
    }
  }
}