import { CriterioOrden, FiltroEstado, GENERO_TODOS, LibroInput } from "../models/Libro.js";
import { LibroModel } from "../models/LibroModel.js";
import { StorageService } from "../services/StorageService.js";
import { LibroView } from "../views/LibroView.js";

export class LibroController {
  private textoBusqueda = "";
  private estado: FiltroEstado = "todos";
  private genero: string = GENERO_TODOS;
  private orden: CriterioOrden = "registro";

  constructor(
    private readonly model: LibroModel,
    private readonly view: LibroView,
    private readonly storage: StorageService
  ) {}

  public iniciar(): void {
    this.view.enlazar({
      onGuardar: (input, id) => this.handleSubmit(input, id),
      onBuscar: (texto) => this.handleSearch(texto),
      onFiltrarEstado: (estado) => this.handleFilterEstado(estado),
      onFiltrarGenero: (genero) => this.handleFilterGenero(genero),
      onOrdenar: (orden) => this.handleSort(orden),
      onAlternar: (id) => this.handleToggleLeido(id),
      onEditar: (id) => this.handleEdit(id),
      onEliminar: (id) => this.handleDelete(id),
      onCancelarEdicion: () => this.view.salirModoEdicion(),
    });
    this.refrescar();
  }

  // ----- Formulario para  agregar y actualizar -----

  private handleSubmit(input: LibroInput, idEdicion: number | null): void {
    if (idEdicion === null) {
      this.handleAdd(input);
    } else {
      this.handleUpdate(idEdicion, input);
    }
  }

  private handleAdd(input: LibroInput): void {
    const resultado = this.model.addLibro(input);
    if (!resultado.exito) {
      this.view.mostrarMensaje(resultado.errores, "error");
      return;
    }
    this.persistir("Libro agregado correctamente.");
    this.view.salirModoEdicion();
    this.refrescar();
  }

  private handleEdit(id: number): void {
    const libro = this.model.getLibroById(id);
    if (libro) this.view.entrarModoEdicion(libro);
  }

  private handleUpdate(id: number, input: LibroInput): void {
    const resultado = this.model.updateLibro(id, input);
    if (!resultado.exito) {
      this.view.mostrarMensaje(resultado.errores, "error");
      return;
    }
    this.persistir("Libro actualizado correctamente.");
    this.view.salirModoEdicion();
    this.refrescar();
  }

  // ----- Acciones sobre tarjetas -----

  private handleToggleLeido(id: number): void {
    const libro = this.model.toggleLeido(id);
    if (!libro) return;
    this.persistir(libro.leido ? "Marcado como leído." : "Marcado como pendiente.");
    this.refrescar();
  }

  private handleDelete(id: number): void {
    const libro = this.model.getLibroById(id);
    if (!libro) return;
    if (!this.view.confirmar(`¿Eliminar "${libro.titulo}"?`)) return;
    this.model.deleteLibro(id);
    this.persistir("Libro eliminado.");
    this.view.salirModoEdicion();
    this.refrescar();
  }

  // ----- Búsqueda, filtros y orden -----

  private handleSearch(texto: string): void {
    this.textoBusqueda = texto;
    this.refrescar();
  }

  private handleFilterEstado(estado: FiltroEstado): void {
    this.estado = estado;
    this.refrescar();
  }

  private handleFilterGenero(genero: string): void {
    this.genero = genero;
    this.refrescar();
  }

  private handleSort(orden: CriterioOrden): void {
    this.orden = orden;
    this.refrescar();
  }

  // ----- Utilidades -----

  private refrescar(): void {
    const libros = this.model.consultar({
      texto: this.textoBusqueda,
      estado: this.estado,
      genero: this.genero,
      orden: this.orden,
    });
    this.view.renderLista(libros, this.model.total());
    this.view.renderEstadisticas(
      this.model.getEstadisticas(),
      this.model.getRecomendaciones()
    );
  }

  private persistir(mensajeExito: string): void {
    if (this.storage.guardar(this.model.getAllLibros())) {
      this.view.mostrarMensaje(mensajeExito, "exito");
    } else {
      this.view.mostrarMensaje("No se pudo guardar en localStorage.", "error");
    }
  }
}