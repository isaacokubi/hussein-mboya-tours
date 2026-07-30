// server/middleware/permissionMiddleware.js


/**
|--------------------------------------------------------------------------
| Permission Authorization Middleware
|--------------------------------------------------------------------------
|
| Usage:
|
| authorize("view_assigned_tours")
| authorize("manage_bookings")
|
|--------------------------------------------------------------------------
*/


export const authorize = (...requiredPermissions) => {


    return async (req, res, next) => {


        try {


            /*
            |--------------------------------------------------------------------------
            | CHECK AUTHENTICATION
            |--------------------------------------------------------------------------
            */


            if (!req.user) {


                return res.status(401).json({

                    success:false,

                    message:"Authentication required"

                });


            }







            /*
            |--------------------------------------------------------------------------
            | GET ROLE PERMISSIONS
            |--------------------------------------------------------------------------
            */


            const rolePermissions =

            req.user.role?.permissions || [];








            /*
            |--------------------------------------------------------------------------
            | GET USER OVERRIDE PERMISSIONS
            |--------------------------------------------------------------------------
            */


            const overridePermissions =

            req.user.permissionsOverride || [];








            /*
            |--------------------------------------------------------------------------
            | MERGE ALL PERMISSIONS
            |--------------------------------------------------------------------------
            */


            const allPermissions = [

                ...rolePermissions,

                ...overridePermissions

            ];








            /*
            |--------------------------------------------------------------------------
            | EXTRACT PERMISSION NAMES
            |--------------------------------------------------------------------------
            */


            const userPermissions =

            allPermissions.map(

                permission => permission.name

            );








            /*
            |--------------------------------------------------------------------------
            | DEBUG RBAC
            |--------------------------------------------------------------------------
            */


            console.log("==============================");

            console.log(
                "AUTHORIZATION DEBUG"
            );


            console.log(
                "USER:",
                req.user.email
            );


            console.log(
                "ROLE:",
                req.user.role?.name
            );


            console.log(
                "ROLE OBJECT:",
                req.user.role
            );


            console.log(
                "ROLE PERMISSIONS:",
                req.user.role?.permissions
            );


            console.log(
                "OVERRIDE PERMISSIONS:",
                req.user.permissionsOverride
            );


            console.log(
                "AVAILABLE PERMISSIONS:",
                userPermissions
            );


            console.log(
                "REQUIRED PERMISSIONS:",
                requiredPermissions
            );


            console.log("==============================");









            /*
            |--------------------------------------------------------------------------
            | CHECK REQUIRED PERMISSIONS
            |--------------------------------------------------------------------------
            |
            | every() means the user must have all permissions.
            |
            |--------------------------------------------------------------------------
            */


            const hasPermission =

            requiredPermissions.every(

                permission =>

                userPermissions.includes(permission)

            );









            /*
            |--------------------------------------------------------------------------
            | ACCESS DENIED
            |--------------------------------------------------------------------------
            */


            if(!hasPermission){


                return res.status(403).json({

                    success:false,


                    message:
                    "Access denied. Missing permission.",



                    requiredPermissions,



                    userPermissions



                });


            }









            /*
            |--------------------------------------------------------------------------
            | CONTINUE
            |--------------------------------------------------------------------------
            */


            next();



        }

        catch(error){


            console.error(
                "PERMISSION ERROR:",
                error
            );


            return res.status(500).json({

                success:false,

                message:error.message

            });


        }


    };


};









/**
|--------------------------------------------------------------------------
| Permission Middleware Alias
|--------------------------------------------------------------------------
|
| Supports:
|
| permissionMiddleware("view_assigned_tours")
|
|--------------------------------------------------------------------------
*/


export const permissionMiddleware =

(requiredPermission)=>{


    return authorize(requiredPermission);


};