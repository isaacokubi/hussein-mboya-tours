import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";



/*
|--------------------------------------------------------------------------
| CLOUDINARY STORAGE CONFIGURATION
|--------------------------------------------------------------------------
*/


const storage = new CloudinaryStorage({

    cloudinary,


    params: {


        folder: "hussein-mboya-tours",



        allowed_formats: [

            "jpg",

            "jpeg",

            "png",

            "webp"

        ],




        transformation: [

            {


                width: 1200,


                height: 800,


                crop: "fill",



                quality: "auto",



                fetch_format: "auto"


            }


        ]

    }

});








/*
|--------------------------------------------------------------------------
| MULTER UPLOAD CONFIGURATION
|--------------------------------------------------------------------------
*/


const upload = multer({


    storage,



    limits: {


        fileSize: 5 * 1024 * 1024 // 5MB maximum


    },





    fileFilter:(req,file,cb)=>{


        const allowedTypes = [


            "image/jpeg",

            "image/png",

            "image/webp"


        ];





        if(

            allowedTypes.includes(
                file.mimetype
            )

        ){


            cb(null,true);


        }

        else{


            cb(

                new Error(

                    "Only JPG, PNG and WEBP images are allowed"

                ),

                false

            );


        }


    }



});








export default upload;