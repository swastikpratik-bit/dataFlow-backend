import { Router } from "express";
import { getAllData, getDataById } from "../controllers/dataController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateToken, getAllData);
router.get("/:id",authenticateToken , getDataById);

export default router;