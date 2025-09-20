import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];
  const allowedExtensions = [".csv", ".xls", ".xlsx"];
  
  if (allowedTypes.includes(file.mimetype) || 
      allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV, XLS, and XLSX files are allowed"), false);
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});