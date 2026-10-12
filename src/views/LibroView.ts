import { FiltroEstado, Libro, LibroInput } from "../models/Libro.js";

export type TipoMensaje = "exito" | "error" | "info";

export interface ManejadoresVista {
  onGuardar: (input: LibroInput, idEdicion: string | null) => void;
  onBuscar: (texto: string) => void;
  onFiltrar: (filtro: FiltroEstado) => void;
  onAlternar: (id: string) => void;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
  onCancelarEdicion: () => void;
}

export class LibroView {
  private readonly form = this.obtener<HTMLFormElement>("form-libro");
  private readonly inTitulo = this.obtener<HTMLInputElement>("titulo");
  private readonly inAutor = this.obtener<HTMLInputElement>("autor");
  private readonly inAnio = this.obtener<HTMLInputElement>("anio");
  private readonly btnGuardar = this.obtener<HTMLButtonElement>("btn-guardar");
  private readonly btnCancelar = this.obtener<HTMLButtonElement>("btn-cancelar");
  private readonly tituloForm = this.obtener<HTMLElement>("titulo-form");
  private readonly inBuscar = this.obtener<HTMLInputElement>("buscar");
  private readonly lista = this.obtener<HTMLElement>("lista-libros");
  private readonly mensajes = this.obtener<HTMLElement>("mensajes");
  private readonly contador = this.obtener<HTMLElement>("contador");
  private readonly botonesFiltro =
    document.querySelectorAll<HTMLButtonElement>("[data-filtro]");

  private idEdicion: string | null = null;
  private temporizador: number | undefined;

  public enlazar(m: ManejadoresVista): void {
    this.form.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      m.onGuardar(this.leerFormulario(), this.idEdicion);
    });

    this.btnCancelar.addEventListener("click", () => m.onCancelarEdicion());

    this.inBuscar.addEventListener("input", () => m.onBuscar(this.inBuscar.value));

    this.botonesFiltro.forEach((btn) => {
      btn.addEventListener("click", () =>
        m.onFiltrar(btn.dataset.filtro as FiltroEstado)
      );
    });

    this.lista.addEventListener("click", (e: Event) => {
      const objetivo = (e.target as HTMLElement).closest<HTMLElement>("[data-accion]");
      if (!objetivo) return;
      const id = objetivo.dataset.id;
      if (!id) return;
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
          <h3>${this.escapar(l.titulo)}</h3>
          <p class="autor">${this.escapar(l.autor)} · ${l.anio}</p>
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

  public marcarFiltro(filtro: FiltroEstado): void {
    this.botonesFiltro.forEach((btn) =>
      btn.classList.toggle("activo", btn.dataset.filtro === filtro)
    );
  }

  public entrarModoEdicion(libro: Libro): void {
    this.idEdicion = libro.id;
    this.inTitulo.value = libro.titulo;
    this.inAutor.value = libro.autor;
    this.inAnio.value = String(libro.anio);
    this.tituloForm.textContent = "Editar libro";
    this.btnGuardar.textContent = "Guardar cambios";
    this.btnCancelar.hidden = false;
    this.inTitulo.focus();
  }

  public salirModoEdicion(): void {
    this.idEdicion = null;
    this.form.reset();
    this.tituloForm.textContent = "Registrar libro";
    this.btnGuardar.textContent = "Agregar libro";
    this.btnCancelar.hidden = true;
  }

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

  private leerFormulario(): LibroInput {
    return {
      titulo: this.inTitulo.value,
      autor: this.inAutor.value,
      anio: Number(this.inAnio.value),
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