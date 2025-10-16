import { pool } from "../config/database.js";

export const dataService = {
  // Get all records
  async getAllPeopleData() {
    const result = await pool.query("SELECT * FROM music_data ORDER BY id DESC");
    return result.rows;
  },

  // Get one record by id
  async getPeopleDataById(id) {
    const result = await pool.query("SELECT * FROM music_data WHERE id = $1", [id]);
    return result.rows[0];
  },

  // Delete one record by id
  async deletePeopleData(id) {
    const result = await pool.query("DELETE FROM music_data WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  }
};
