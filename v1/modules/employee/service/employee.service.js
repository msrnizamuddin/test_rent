import Employee from "../model/employee.model.js"

export const createEmployeeService = async(payload) =>
{
    const result = await Employee.create(payload)
    return result
}

export const getAllEmployeeService = async () =>
{
    return await Employee.find({})
}

export const getEmployeeByIdService = async(id) =>
{
    return await Employee.findById(id)
}

export const updateEmployeeService = async(id,payload) =>
{
    const result = await Employee.findByIdAndUpdate(
                    id,
                    payload,
                    {
                        new: true,
                        runValidators: true
                    }
                );
    
        return result
}