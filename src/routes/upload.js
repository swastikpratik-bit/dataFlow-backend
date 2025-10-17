import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadFile } from "../controllers/uploadController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();


router.post("/", authenticateToken , upload.single("file") ,  uploadFile);

export default router;