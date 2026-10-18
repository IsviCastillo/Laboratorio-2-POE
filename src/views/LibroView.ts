import {
  CriterioOrden,
  FiltroEstado,
  GENEROS,
  Libro,
  LibroInput,
} from "../models/Libro.js";
import { Estadisticas, Recomendacion } from "../models/LibroModel.js";

export type TipoMensaje = "exito" | "error" | "info";

export interface ManejadoresVista {
  onGuardar: (input: LibroInput, idEdicion: number | null) => void;
  onBuscar: (texto: string) => void;
  onFiltrarEstado: (estado: FiltroEstado) => void;
  onFiltrarGenero: (genero: string) => void;
  onOrdenar: (orden: CriterioOrden) => void;
  onAlternar: (id: number) => void;
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
  onCancelarEdicion: () => void;
}

export class LibroView {
  // Formulario
  private readonly form = this.obtener<HTMLFormElement>("form-libro");
  private readonly inTitulo = this.obtener<HTMLInputElement>("titulo");
  private readonly inAutor = this.obtener<HTMLInputElement>("autor");
  private readonly inAnio = this.obtener<HTMLInputElement>("anio");
  private readonly selGenero = this.obtener<HTMLSelectElement>("genero");
  private readonly selCalificacion = this.obtener<HTMLSelectElement>("calificacion");
  private readonly btnGuardar = this.obtener<HTMLButtonElement>("btn-guardar");
  private readonly btnCancelar = this.obtener<HTMLButtonElement>("btn-cancelar");
  private readonly tituloForm = this.obtener<HTMLElement>("titulo-form");

  // Para la busqueda, filtreos y el orden
  private readonly inBuscar = this.obtener<HTMLInputElement>("buscar");
  private readonly selFiltroEstado = this.obtener<HTMLSelectElement>("filtro-estado");
  private readonly selFiltroGenero = this.obtener<HTMLSelectElement>("filtro-genero");
  private readonly selOrden = this.obtener<HTMLSelectElement>("orden");

  // Lista, mensajes y contador
  private readonly lista = this.obtener<HTMLElement>("lista-libros");
  private readonly mensajes = this.obtener<HTMLElement>("mensajes");
  private readonly contador = this.obtener<HTMLElement>("contador");

  // Estadísticas
  private readonly statTotal = this.obtener<HTMLElement>("stat-total");
  private readonly statLeidos = this.obtener<HTMLElement>("stat-leidos");
  private readonly statPendientes = this.obtener<HTMLElement>("stat-pendientes");
  private readonly statPromedio = this.obtener<HTMLElement>("stat-promedio");
  private readonly statCalificados = this.obtener<HTMLElement>("stat-calificados");
  private readonly listaGeneros = this.obtener<HTMLElement>("lista-generos");
  private readonly listaRecomendaciones = this.obtener<HTMLElement>("lista-recomendaciones");

  // Pestañas
  private readonly tabs = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
  private readonly paneles = document.querySelectorAll<HTMLElement>("[data-panel]");

  private idEdicion: number | null = null;
  private temporizador: number | undefined;

  constructor() {
    this.poblarGeneros();
  }

  public enlazar(m: ManejadoresVista): void {
    this.form.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      m.onGuardar(this.leerFormulario(), this.idEdicion);
    });

    this.btnCancelar.addEventListener("click", () => m.onCancelarEdicion());

    // Búsqueda en tiempo real
    this.inBuscar.addEventListener("input", () => m.onBuscar(this.inBuscar.value));

    // Filtros y orden
    this.selFiltroEstado.addEventListener("change", () =>
      m.onFiltrarEstado(this.selFiltroEstado.value as FiltroEstado)
    );
    this.selFiltroGenero.addEventListener("change", () =>
      m.onFiltrarGenero(this.selFiltroGenero.value)
    );
    this.selOrden.addEventListener("change", () =>
      m.onOrdenar(this.selOrden.value as CriterioOrden)
    );

    // Pestañas
    this.tabs.forEach((tab) =>
      tab.addEventListener("click", () => this.mostrarTab(tab.dataset.tab ?? "catalogo"))
    );

    // Delegación de eventos para los botones de cada tarjeta
    this.lista.addEventListener("click", (e: Event) => {
      const objetivo = (e.target as HTMLElement).closest<HTMLElement>("[data-accion]");
      if (!objetivo) return;
      const id = Number(objetivo.dataset.id);
      if (!Number.isInteger(id)) return;
      switch (objetivo.dataset.accion) {
        case "alternar":
          m.onAlternar(id);
          break;
        case "editar":
          m.onEditar(id);
          break;
        case "eliminar":
          m.onEliminar(id);
          break;
      }
    });
  }

  public renderLista(libros: Libro[], totalGeneral: number): void {
    this.contador.textContent = `${libros.length} de ${totalGeneral} libro(s)`;

    if (libros.length === 0) {
      this.lista.innerHTML = `<p class="vacio">${
        totalGeneral === 0
          ? "Aún no has registrado libros. ¡Agrega el primero!"
          : "No se encontraron libros con los criterios actuales."
      }</p>`;
      return;
    }

    this.lista.innerHTML = libros
      .map(
        (l) => `
      <article class="tarjeta ${l.leido ? "leido" : "pendiente"}">
        <div class="tarjeta-info">
          <h3><span class="id-libro">#${l.id}</span> ${this.escapar(l.titulo)}</h3>
          <p class="autor">${this.escapar(l.autor)} · ${l.anio}</p>
          <p class="meta">
            <span class="genero-tag">${this.escapar(l.genero)}</span>
            ${this.renderEstrellas(l.calificacion)}
          </p>
          <span class="estado">${l.leido ? "✔ Leído" : "⏳ Pendiente"}</span>
        </div>
        <div class="tarjeta-acciones">
          <button type="button" data-accion="alternar" data-id="${l.id}">
            ${l.leido ? "Marcar pendiente" : "Marcar leído"}
          </button>
          <button type="button" data-accion="editar" data-id="${l.id}">Editar</button>
          <button type="button" class="peligro" data-accion="eliminar" data-id="${l.id}">Eliminar</button>
        </div>
      </article>`
      )
      .join("");
  }

  // Devuelve el HTML de las estrellas  para una calificación de 0 a 5. 
  public renderEstrellas(calificacion: number): string {
    if (calificacion <= 0) {
      return `<span class="estrellas sin-calificar">Sin calificar</span>`;
    }
    const llenas = "★".repeat(calificacion);
    const vacias = "☆".repeat(5 - calificacion);
    return `<span class="estrellas" role="img" aria-label="${calificacion} de 5 estrellas">${llenas}${vacias}</span>`;
  }

  // Dibuja las estadísticas, el resumen por género y las recomendaciones.
  public renderEstadisticas(est: Estadisticas, recomendaciones: Recomendacion[]): void {
    this.statTotal.textContent = String(est.total);
    this.statLeidos.textContent = String(est.leidos);
    this.statPendientes.textContent = String(est.pendientes);
    this.statPromedio.textContent = est.calificados > 0 ? est.promedio.toFixed(2) : "—";
    this.statCalificados.textContent = `${est.calificados} libro(s) calificado(s)`;

    this.listaGeneros.innerHTML =
      est.porGenero.length === 0
        ? `<p class="vacio">Aún no hay libros registrados.</p>`
        : est.porGenero
            .map(
              (g) => `
        <li>
          <span class="genero-tag">${this.escapar(g.genero)}</span>
          <span>${g.cantidad} libro(s)</span>
          ${g.promedio > 0 ? this.renderEstrellas(Math.round(g.promedio)) + ` <small>${g.promedio.toFixed(2)}</small>` : `<span class="estrellas sin-calificar">Sin calificar</span>`}
        </li>`
            )
            .join("");

    this.listaRecomendaciones.innerHTML =
      recomendaciones.length === 0
        ? `<p class="vacio">Califica algunos libros (3★ o más) y marca pendientes para recibir recomendaciones.</p>`
        : recomendaciones
            .map(
              (r) => `
        <li>
          <strong>#${r.libro.id} ${this.escapar(r.libro.titulo)}</strong>
          <span class="autor">${this.escapar(r.libro.autor)}</span>
          <small>Porque calificas ${this.escapar(r.libro.genero)} con ${r.promedioGenero.toFixed(2)} ★ en promedio</small>
        </li>`
            )
            .join("");
  }

  public entrarModoEdicion(libro: Libro): void {
    this.idEdicion = libro.id;
    this.inTitulo.value = libro.titulo;
    this.inAutor.value = libro.autor;
    this.inAnio.value = String(libro.anio);
    this.selGenero.value = libro.genero;
    this.selCalificacion.value = String(libro.calificacion);
    this.tituloForm.textContent = `Editar libro #${libro.id}`;
    this.btnGuardar.textContent = "Actualizar";
    this.btnCancelar.hidden = false;
    this.mostrarTab("catalogo");
    this.inTitulo.focus();
  }

  public salirModoEdicion(): void {
    this.idEdicion = null;
    this.form.reset();
    this.tituloForm.textContent = "Registrar libro";
    this.btnGuardar.textContent = "Agregar libro";
    this.btnCancelar.hidden = true;
  }

  // Muestra un mensaje temporal que se cierra solo (éxito, error o info). 
  public mostrarMensaje(texto: string | string[], tipo: TipoMensaje): void {
    const items = Array.isArray(texto) ? texto : [texto];
    this.mensajes.className = `mensajes ${tipo}`;
    this.mensajes.innerHTML = items.map((t) => `<p>${this.escapar(t)}</p>`).join("");
    window.clearTimeout(this.temporizador);
    this.temporizador = window.setTimeout(() => {
      this.mensajes.className = "mensajes";
      this.mensajes.innerHTML = "";
    }, 4000);
  }

  public confirmar(texto: string): boolean {
    return window.confirm(texto);
  }

  // Privados

  private mostrarTab(nombre: string): void {
    this.tabs.forEach((tab) => {
      const activa = tab.dataset.tab === nombre;
      tab.classList.toggle("activo", activa);
      tab.setAttribute("aria-selected", String(activa));
    });
    this.paneles.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== nombre;
    });
  }

  private poblarGeneros(): void {
    const opciones = GENEROS.map((g) => `<option value="${g}">${g}</option>`).join("");
    this.selGenero.innerHTML = `<option value="">Selecciona...</option>${opciones}`;
    this.selFiltroGenero.innerHTML = `<option value="todos">Todos los géneros</option>${opciones}`;
  }

  private leerFormulario(): LibroInput {
    return {
      titulo: this.inTitulo.value,
      autor: this.inAutor.value,
      anio: Number(this.inAnio.value),
      genero: this.selGenero.value,
      calificacion: Number(this.selCalificacion.value),
    };
  }

  private obtener<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`No se encontró el elemento #${id} en el HTML.`);
    return el as T;
  }

  private escapar(texto: string): string {
    return texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}