import mongoose from "mongoose";
import Country from "../Model/country.model";

export const createCountry = async ( req, res) =>
{
    result = await Country.create(req.body)
    res.send(result)
}

export const getCountry = async ( req, res) =>
{
    result = await Country.find({})
    res.send(result)
}

export const getCountryByID = async (req,res)=>
{
    result = await Country.find({_id: mongoose.Schema.ObjectId(req.params.id)})
    res.send(result)
}