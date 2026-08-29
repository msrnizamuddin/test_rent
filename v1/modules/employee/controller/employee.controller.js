import mongoose from 'mongoose';
import { createEmployeeService, getAllEmployeeService, getEmployeeByIdService, updateEmployeeService } from '../service/employee.service.js'

export const createEmployee = async(req,res)=>
{
    try {
        const result = await createEmployeeService(req.body)
    
        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
    });
  }
}


export const getEmployees = async(req,res) =>
{
    try
    {
        const result = await getAllEmployeeService()
        res.status(200).json({
      success: true,
      message: "Employees data fetched successfully",
      data: result,

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getEmployeeById = async(req,res) =>
{
    const id = new mongoose.Types.ObjectId(req.params.id)
    try{
        
    const result = await getEmployeeByIdService(id)
        res.status(200).json({
          success: true,
          message: "Specific Employee fetched successfully",
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

export const updateEmployee = async (req,res)=>
{
    const id = new mongoose.Types.ObjectId(req.params.id)
      const data = req.body
    
      try {
        const result = await updateEmployeeService(id, data)
        res.status(200).json({
          success: true,
          message: "Specific Employee Data Updated successfully",
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
    