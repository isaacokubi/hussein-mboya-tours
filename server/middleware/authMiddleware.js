import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";



/*
|--------------------------------------------------------------------------
| AUTHENTICATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Protect private routes using JWT
|
| Features:
| - Bearer token support
| - Cookie token support
| - User loading
| - Role population
| - Permission population
| - Account status checking
|
|--------------------------------------------------------------------------
*/


export const protect = async (req, res, next) => {


    try {


        let token = null;



        /*
        |--------------------------------------------------------------------------
        | GET TOKEN FROM HEADER
        |--------------------------------------------------------------------------
        */


        const authHeader = req.headers.authorization;



        if(
            authHeader &&
            authHeader.startsWith("Bearer ")
        ){

            token = authHeader.split(" ")[1];

        }





        /*
        |--------------------------------------------------------------------------
        | COOKIE TOKEN SUPPORT
        |--------------------------------------------------------------------------
        */


        if(
            !token &&
            req.cookies?.token
        ){

            token = req.cookies.token;

        }





        /*
        |--------------------------------------------------------------------------
        | CHECK TOKEN
        |--------------------------------------------------------------------------
        */


        if(!token){


            return res.status(401).json({

                success:false,

                message:"Authentication required. Token missing."

            });


        }






        /*
        |--------------------------------------------------------------------------
        | VERIFY TOKEN
        |--------------------------------------------------------------------------
        */


        const decoded = jwt.verify(

            token,

            env.JWT_SECRET

        );







        /*
        |--------------------------------------------------------------------------
        | LOAD USER WITH ROLE + PERMISSIONS
        |--------------------------------------------------------------------------
        */


        const user = await User.findById(decoded.id)

            .select("-password")

            .populate({

                path:"role",

                populate:{

                    path:"permissions"

                }

            })

            .populate({

                path:"permissionsOverride"

            });







        if(!user){


            return res.status(401).json({

                success:false,

                message:"User no longer exists."

            });


        }








        /*
        |--------------------------------------------------------------------------
        | ACCOUNT STATUS CHECK
        |--------------------------------------------------------------------------
        */


        if(user.status !== "active"){


            return res.status(403).json({

                success:false,

                message:`Account ${user.status}`

            });


        }








        /*
        |--------------------------------------------------------------------------
        | ATTACH USER TO REQUEST
        |--------------------------------------------------------------------------
        */


        req.user = user;



        next();



    }catch(error){


        console.error(

            "AUTH ERROR:",

            error.message

        );



        return res.status(401).json({

            success:false,

            message:"Invalid or expired token."

        });


    }


};









/*
|--------------------------------------------------------------------------
| ADMIN ONLY MIDDLEWARE
|--------------------------------------------------------------------------
|
| Allows only admin role
|
|--------------------------------------------------------------------------
*/


export const adminOnly = (

    req,

    res,

    next

)=>{


    const role =

        req.user?.role?.name?.toLowerCase();




    if(

        !req.user ||

        role !== "admin"

    ){


        return res.status(403).json({

            success:false,

            message:"Admin access required."

        });


    }



    next();


};









/*
|--------------------------------------------------------------------------
| ROLE AUTHORIZATION
|--------------------------------------------------------------------------
|
| Usage:
|
| authorize("admin","tour_manager")
|
|--------------------------------------------------------------------------
*/


export const authorize = (...allowedRoles)=>{


    return (

        req,

        res,

        next

    )=>{



        const userRole =

            req.user?.role?.name?.toLowerCase();




        const roles =

            allowedRoles.map(

                role => role.toLowerCase()

            );





        if(

            !userRole ||

            !roles.includes(userRole)

        ){


            return res.status(403).json({

                success:false,

                message:"You do not have permission to access this resource."

            });


        }



        next();


    };


};









/*
|--------------------------------------------------------------------------
| PERMISSION CHECK
|--------------------------------------------------------------------------
|
| Usage:
|
| router.get(
| "/packages",
| protect,
| checkPermission("view_packages"),
| controller
| )
|
|--------------------------------------------------------------------------
*/


export const checkPermission = (permissionName)=>{


    return (

        req,

        res,

        next

    )=>{


        try{



            if(!req.user){


                return res.status(401).json({

                    success:false,

                    message:"Authentication required."

                });


            }






            const rolePermissions =

                req.user.role?.permissions || [];





            const overridePermissions =

                req.user.permissionsOverride || [];







            const allPermissions = [

                ...rolePermissions,

                ...overridePermissions

            ];








            const hasPermission =

                allPermissions.some(

                    permission =>

                    permission.name === permissionName

                );








            if(!hasPermission){


                return res.status(403).json({

                    success:false,

                    message:

                    `Missing permission: ${permissionName}`

                });


            }






            next();




        }catch(error){



            console.error(

                "PERMISSION ERROR:",

                error.message

            );



            return res.status(403).json({

                success:false,

                message:"Permission verification failed."

            });


        }


    };


};









/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
|
| Allows:
|
| import protect from "../middleware/authMiddleware.js"
|
|--------------------------------------------------------------------------
*/


export default protect;