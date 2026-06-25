import { Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  patchProject,
} from "../controllers/project.controller.js";
import { requiredAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", requiredAuth, createProject);
router.get("/", requiredAuth, getAllProjects);
router.get("/:id", requiredAuth, getProjectById);
router.patch("/:id", requiredAuth, patchProject);
router.delete("/:id", requiredAuth, deleteProject);

export default router;
