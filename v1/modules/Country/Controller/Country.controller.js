import mongoose from "mongoose";
import Country from "../Model/country.model.js";

export const createCountry = async (req, res) => {
    try {
        const result = await Country.create(req.body)
        res.status(200).send(result)
    }
    catch (error) {
        res.status(400).json({ message: "Failed to create country", error: error.message });
    }
}

export const getCountry = async (req, res) => {
    try {
        result = await Country.find({})
        res.status(200).send(result)
    }
    catch (error) {
        res.status(400).json({ message: "Server error fetching countries", error: error.message });
    }
}

export const getCountryByID = async (req, res) => {
    try {
        const result = await Country.findById(req.params.id)
        if (!result) {
            return res.status(404).json({ message: "Country not found" });
        }
        res.status(200).send(result)
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching country", error: error.message });
}
}

export const updateCountry = async (req, res) => {
    try {
        const result = await Country.findByIdAndUpdate(
            req.params.id, 
            req.body,      
            { 
                new: true,           
                runValidators: true  
            }
        );

        if (!result) {
            return res.status(404).json({ message: "Country not found to update" });
        }

        res.status(200).send(result);
    } catch (error) {
        res.status(400).json({ message: "Failed to update country", error: error.message });
    }
}
