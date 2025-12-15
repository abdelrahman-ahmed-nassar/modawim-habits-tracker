import express, { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.put("/me", authMiddleware, authController.updateProfile);
router.post("/change-password", authMiddleware, authController.changePassword);
router.delete("/me", authMiddleware, authController.deleteAccountController);

export default router;


