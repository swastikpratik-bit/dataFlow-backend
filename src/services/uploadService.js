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
    CREATE TABLE IF NOT EXISTS music_data (
      id SERIAL PRIMARY KEY,
      sl_no VARCHAR(50),
      video_url TEXT,
      isrc VARCHAR(50),
      iprs_work_int_no VARCHAR(100),
      ejnw VARCHAR(100),
      work_title VARCHAR(255),
      alternative_titles TEXT,
      singer_name VARCHAR(255),
      release_date DATE,
      duration VARCHAR(50),
      views BIGINT,
      m_k VARCHAR(10),
      category VARCHAR(100),
      tunecode VARCHAR(100),
      iswc VARCHAR(50),
      ice_work_key VARCHAR(100),
      old_tunecodes TEXT,
      ca1 VARCHAR(255),
      screen_name1 VARCHAR(255),
      cae_ipi_1 VARCHAR(100),
      per_1 DECIMAL(5,2),
      mec_1 DECIMAL(5,2),
      ca2 VARCHAR(255),
      screen_name2 VARCHAR(255),
      cae_ipi_2 VARCHAR(100),
      per_2 DECIMAL(5,2),
      mec_2 DECIMAL(5,2),
      ca3 VARCHAR(255),
      screen_name3 VARCHAR(255),
      cae_ipi_3 VARCHAR(100),
      per_3 DECIMAL(5,2),
      mec_3 DECIMAL(5,2),
      ca4 VARCHAR(255),
      screen_name4 VARCHAR(255),
      cae_ipi_4 VARCHAR(100),
      per_4 DECIMAL(5,2),
      mec_4 DECIMAL(5,2),
      ca5 VARCHAR(255),
      screen_name5 VARCHAR(255),
      cae_ipi_5 VARCHAR(100),
      per_5 DECIMAL(5,2),
      mec_5 DECIMAL(5,2),
      ca6 VARCHAR(255),
      screen_name6 VARCHAR(255),
      cae_ipi_6 VARCHAR(100),
      per_6 DECIMAL(5,2),
      mec_6 DECIMAL(5,2),
      UNIQUE(sl_no)
    )
  `);

  if (results.length > 0) {
    console.log('Available columns:', Object.keys(results[0]));
  }

  let count = 0;
  for (const row of results) {
    const slNo = row["Sl No"] || row["sl_no"] || row["SlNo"];
    
    if (!slNo) {
      console.log(`Skipping row ${count + 1}: No Sl No found`);
      continue;
    }

    await pool.query(
      `INSERT INTO music_data 
        (sl_no, video_url, isrc, iprs_work_int_no, ejnw, work_title, alternative_titles, 
         singer_name, release_date, duration, views, m_k, category, tunecode, iswc, 
         ice_work_key, old_tunecodes, ca1, screen_name1, cae_ipi_1, per_1, mec_1,
         ca2, screen_name2, cae_ipi_2, per_2, mec_2, ca3, screen_name3, cae_ipi_3, 
         per_3, mec_3, ca4, screen_name4, cae_ipi_4, per_4, mec_4, ca5, screen_name5, 
         cae_ipi_5, per_5, mec_5, ca6, screen_name6, cae_ipi_6, per_6, mec_6) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
              $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
              $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47)
      ON CONFLICT (sl_no) 
      DO UPDATE SET
        video_url = EXCLUDED.video_url,
        work_title = EXCLUDED.work_title,
        singer_name = EXCLUDED.singer_name,
        release_date = EXCLUDED.release_date`,
      [
        slNo,
        row["Video URL"],
        row["ISRC"],
        row["IPRS Work Int No"],
        row["EJNW"],
        row["Work Title"],
        row["Alternative Title(s)"],
        row["Singer Name"],
        convertToISO(row["Release Date"]),
        row["Duration"],
        row["Views"],
        row["M/K"],
        row["Category"],
        row["Tunecode"],
        row["ISWC"],
        row["ICE work key"],
        row["Old Tunecode(s)"],
        row["CA1"],
        row["Screen Name1"],
        row["CAE/IPI-1"],
        row["Per%1"],
        row["Mec%1"],
        row["CA2"],
        row["Screen Name2"],
        row["CAE/IPI-2"],
        row["Per%2"],
        row["Mec%2"],
        row["CA3"],
        row["Screen Name3"],
        row["CAE/IPI-3"],
        row["Per%3"],
        row["Mec%3"],
        row["CA4"],
        row["Screen Name4"],
        row["CAE/IPI-4"],
        row["Per%4"],
        row["Mec%4"],
        row["CA5"],
        row["Screen Name5"],
        row["CAE/IPI-5"],
        row["Per%5"],
        row["Mec%5"],
        row["CA6"],
        row["Screen Name6"],
        row["CAE/IPI-6"],
        row["Per%6"],
        row["Mec%6"]
      ]
    );
    count++;
  }

  return count;
}

};