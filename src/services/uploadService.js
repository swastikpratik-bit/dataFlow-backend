import fs from "fs-extra";
import path from "path";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { pool } from "../config/database.js";
import { convertToISO } from "../utils/utils.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export const uploadService = {
  async processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".csv") {
      return this.processCSV(filePath);
    } else if (ext === ".xls" || ext === ".xlsx") {
      return this.processExcel(filePath);
    } else {
      throw new Error("Unsupported file format");
    }
  },

  async processCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            const count = await this.saveData(results);
            fs.unlinkSync(filePath);
            resolve({ count });
          } catch (error) {
            reject(error);
          }
        })
        .on("error", reject);
    });
  },

async processExcel(filePath) {
  try {
    // 1️⃣ Read Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const results = XLSX.utils.sheet_to_json(worksheet);

    // 2️⃣ Save to DB
    const count = await this.saveData(results);
    console.log(`Saved ${count} records`);

    // 3️⃣ Delete file using fs-extra
    const absolutePath = path.normalize(filePath);

    try {
      await fs.remove(absolutePath);
      console.log("File deleted successfully:", absolutePath);
    } catch (err) {
      console.error("Failed to delete file:", err);
    }

    return { count };
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw error;
  }
},

  async saveData(results) {
  // Ensure the table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS people_data (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      gender VARCHAR(10),
      country VARCHAR(100),
      age INT,
      date DATE,
      ext_id VARCHAR(100) UNIQUE
    )
  `);

  let count = 0;
  for (const row of results) {
    await pool.query(
      `INSERT INTO people_data 
        (first_name, last_name, gender, country, age, date, ext_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (ext_id) 
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        gender = EXCLUDED.gender,
        country = EXCLUDED.country,
        age = EXCLUDED.age,
        date = EXCLUDED.date`,
      [
        row["First Name"],
        row["Last Name"],
        row["Gender"],
        row["Country"],
        row["Age"],
        convertToISO(row["Date"]),
        row["Id"]
      ]
    );
    count++;
  }

  return count;
}

};