import { uploadService } from "../services/uploadService.js";

export const uploadFile = async (req, res, next) => {

  console.log("Received file upload request");
  try {
  
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file.originalname);

    const result = await uploadService.processFile(req.file.path);

    console.log(`Processed ${result.count} records from file ${req.file.originalname}`);
    res.json({ 
      message: "File processed successfully", 
      recordsProcessed: result.count 
    });
  } catch (error) {
    next(error);
  }
};