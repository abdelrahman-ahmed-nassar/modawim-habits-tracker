import { Router } from "express";
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

// All templates are per-user and require authentication
router.use(authMiddleware);

// GET /api/templates - Get all templates for current user
router.get("/", getAllTemplates);

// GET /api/templates/:id - Get template by id for current user
router.get("/:id", getTemplateById);

// POST /api/templates - Create new template for current user
router.post("/", createTemplate);

// PUT /api/templates/:id - Update template for current user
router.put("/:id", updateTemplate);

// DELETE /api/templates/:id - Delete template for current user
router.delete("/:id", deleteTemplate);

export default router;
