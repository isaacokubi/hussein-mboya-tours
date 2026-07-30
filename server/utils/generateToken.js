import jwt from "jsonwebtoken";


const generateToken = (user) => {


    return jwt.sign(

        {
            id:user.id || user._id,

            role:user.role || null,

            permissions:user.permissions || []

        },

        process.env.JWT_SECRET,

        {
            expiresIn:"7d"
        }

    );


};


export default generateToken;