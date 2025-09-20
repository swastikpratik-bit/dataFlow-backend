import { dataService } from "../services/dataService.js";

// Get all records
export const getAllData = async (req, res, next) => {
  try {
    const data = await dataService.getAllPeopleData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Get record by ID
export const getDataById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await dataService.getPeopleDataById(id);

    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
