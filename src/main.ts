import { LibroController } from "./controllers/LibroController.js";
import { CatalogoLibros } from "./models/CatalogoLibros.js";
import { StorageService } from "./services/StorageService.js";
import { LibroView } from "./views/LibroView.js";

document.addEventListener("DOMContentLoaded", () => {
  const storage = new StorageService("catalogo-libros");
  const catalogo = new CatalogoLibros(storage.cargar());
  const view = new LibroView();
  const controller = new LibroController(catalogo, view, storage);
  controller.iniciar();
});