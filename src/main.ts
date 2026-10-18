import { LibroController } from "./controllers/LibroController.js";
import { LibroModel } from "./models/LibroModel.js";
import { StorageService } from "./services/StorageService.js";
import { LibroView } from "./views/LibroView.js";

document.addEventListener("DOMContentLoaded", () => {
  const storage = new StorageService("catalogo-libros");
  const model = new LibroModel(storage.cargar());
  const view = new LibroView();
  const controller = new LibroController(model, view, storage);
  controller.iniciar();
});