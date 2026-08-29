import mongoose from "mongoose";
import { createCountryService, getAllCountryService, getCountryByIDService, updateCountryService } from "../Service/country.service.js";

export const createCountry = async (req, res) => {
  // const result = await createCountry(req.body)



  try {
    const result = await createCountryService(req.body)
    res.status(201).json({
      success: true,
      message: "Country created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getCountry = async (req, res) => {

  try {
    const result = await getAllCountryService()
    res.status(200).json({
      success: true,
      message: "Country fetched successfully",
      data: result,

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getCountryByID = async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.params.id)

  try {
    const result = await getCountryByIDService(id)
    res.status(200).json({
      success: true,
      message: "Specific Country fetched successfully",
      data: result,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export const updateCountry = async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.params.id)
  const data = req.body

  try {
    const result = await updateCountryService(id, data)
    res.status(200).json({
      success: true,
      message: "Specific Country Updated successfully",
      data: result,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
