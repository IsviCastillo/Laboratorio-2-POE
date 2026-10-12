import { LibroController } from "./controllers/LibroController.js";
import { StorageService } from "./services/StorageService.js";
import { LibroView } from "./views/LibroView.js";

document.addEventListener("DOMContentLoaded", () => {
  const view = new LibroView();
  const storage = new StorageService("catalogo-libros");
  const controller = new LibroController(view, storage);
  controller.iniciar();
});