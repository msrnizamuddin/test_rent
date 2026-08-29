import { employeeLoginService, getUserService } from "../service/user.service.js";

export const employeeLoginController = async(req,res,next)=>
{
        try {
            const payload = req.body;
        
            const result =
              await employeeLoginService(
                payload
              );
        
            res.status(200).json({
              success: true,
              message: "Employee Login successful",
              data: result,
            });
          } catch (error) {
            next(error);
          }
}


export const getUserController = async(req,res)=>
{
    try{
        const result = await getUserService()
        res.status(200).json({
        success : true,
        message : "All Employee data are fetched",
        data : result
    })
    } catch(error)
    {
        res.status(500).json({
          success: false,
          message: error.message,
        })
    }
    


}