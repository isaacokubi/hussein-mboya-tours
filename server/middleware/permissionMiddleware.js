
import Role from "../models/Role.js";


export const authorize = (permission) => {

    return async (req,res,next)=>{

        

try {




console.log("USER RBAC DEBUG:",{
id:req.user?._id,
email:req.user?.email,
role:req.user?.role,
roleId:req.user?.roleId
});



            if(!req.user){
                return res.status(401).json({
                    message:"Authentication required"
                });
            }


            let permissions = [];


            /*
              Load permissions from roleId
            */

            if(req.user.roleId){

                const role = await Role
                    .findById(req.user.roleId)
                    .populate("permissions","name");


                if(role && role.permissions){

                    permissions =
                        role.permissions.map(
                            p=>p.name
                        );

                }

            }



            /*
              Backward compatibility
            */

            if(
                [
                    "admin",
                    "super_admin",
                    "superadmin"
                ].includes(req.user.role)
            ){

                permissions.push(
                    "admin.dashboard",
                    "roles.manage",
                    "system.audit",
                    "manage_customers",
                    "payment.manage",
                    "report.view",
                    "analytics.view",
                    "commission.view",
                    "commission.manage",
                    "commission.approve",
                    "commission.pay",
                    "coupon.manage",
                    "coupons.manage",
                    "review.manage",
                    "settings.manage"
                );

            }



            permissions = [
                ...new Set(permissions)
            ];



            console.log(
                "AUTH CHECK:",
                req.user.email,
                permission,
                permissions
            );



            if(
                !permissions.includes(permission)
            ){

                return res.status(403).json({

                    message:
                    "Access denied. Missing required permission.",
                    required:permission,
                    available:permissions

                });

            }


            next();



        } catch(error){

            console.error(
                "Permission middleware error:",
                error
            );


            res.status(500).json({
                message:"Permission check failed"
            });

        }

    };

};
