import User from "../model/user.model.js";
import jwt from "jsonwebtoken"


export const employeeLoginService = async(payload) =>
{
    const userName = payload.userName
    const employeeId = payload.employeeId
    const empolyee = await User.findOne({
    employeeId
  });

  if (!employeeId) {
    throw new Error("No such employee ID exists");
  }

  const isPasswordValid = User.comparePassword(payload.password)
  
  if(!isPasswordValid)
  {
    throw new Error("Invalid Password")
  }
  
  const token = jwt.sign(
      {
        employeeId: employee.employeeId,        
        userName: employee.userName,
        status: employee.status,
        isVerified: employee.isLocked,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
  
    return {
      token,
      employee: {
        employeeId: employee.employeeId,
        userName: employee.userName,
        status: employee.status,
        isLocked: employee.isLocked,
      },
    };
  }

export const getUserService = async() =>
{
    return await User.find({})
}