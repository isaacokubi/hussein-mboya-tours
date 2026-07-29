// client/src/context/AuthContext.jsx


import {
    createContext,
    useContext,
    useState,
    useEffect
}
from "react";


import axios from "axios";


import {
    queryClient
}
from "../lib/queryClient";









/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/


const api = axios.create({

    baseURL:

        import.meta.env.VITE_API_URL ||

        "http://localhost:5000/api",


    headers: {

        "Content-Type": "application/json"

    }

});









/*
|--------------------------------------------------------------------------
| ATTACH JWT TOKEN
|--------------------------------------------------------------------------
*/


api.interceptors.request.use(

(config)=>{


    const token =

    localStorage.getItem(
        "token"
    );



    if(token){

        config.headers.Authorization =

        `Bearer ${token}`;

    }



    return config;


},


(error)=>{


    return Promise.reject(error);


}

);









/*
|--------------------------------------------------------------------------
| AUTH CONTEXT
|--------------------------------------------------------------------------
*/


export const AuthContext =

createContext();





export const useAuth = ()=>{


    return useContext(
        AuthContext
    );


};









/*
|--------------------------------------------------------------------------
| ROLE NORMALIZER
|--------------------------------------------------------------------------
*/


const normalizeRole = (role)=>{


    return role

    ?.toString()

    .toLowerCase()

    .replace(
        /[\s_-]/g,
        ""
    )

    || "";


};









/*
|--------------------------------------------------------------------------
| NORMALIZE USER
|--------------------------------------------------------------------------
*/


const normalizeUser = (user)=>{


    if(!user){

        return null;

    }



    return {

        ...user,


        role:

        normalizeRole(

            user?.role?.name ||

            user?.role ||

            user?.legacyRole

        )

    };


};









/*
|--------------------------------------------------------------------------
| AUTH PROVIDER
|--------------------------------------------------------------------------
*/


export function AuthProvider({

children

}) {



const [

    user,

    setUser

]

=

useState(null);





const [

    token,

    setToken

]

=

useState(

    localStorage.getItem(
        "token"
    )

);



const [

    loading,

    setLoading

]

=

useState(true);









/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/


const fetchCurrentUser = async()=>{


try{


    const response =

    await api.get(
        "/auth/me"
    );



    const currentUser =

    normalizeUser(

        response.data.user ||

        response.data

    );



    setUser(
        currentUser
    );



    localStorage.setItem(

        "user",

        JSON.stringify(
            currentUser
        )

    );



    return currentUser;



}

catch(error){


    console.error(

        "AUTH ME ERROR",

        error.response?.data ||

        error.message

    );



    logout();



}



};









/*
|--------------------------------------------------------------------------
| RESTORE SESSION
|--------------------------------------------------------------------------
*/


useEffect(()=>{


const savedToken =

localStorage.getItem(
    "token"
);



if(savedToken){


    setToken(
        savedToken
    );



    fetchCurrentUser()

    .finally(()=>{

        setLoading(false);

    });



}

else{


    setLoading(false);


}



},[]);









/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/


const login = async(

email,

password

)=>{


try{


    const response =

    await api.post(

        "/auth/login",

        {

            email,

            password

        }

    );



    const newToken =

    response.data.token;



    localStorage.setItem(

        "token",

        newToken

    );



    setToken(
        newToken
    );



    const currentUser =

    normalizeUser(

        response.data.user

    );



    setUser(
        currentUser
    );



    localStorage.setItem(

        "user",

        JSON.stringify(
            currentUser
        )

    );



    setLoading(false);



    return {

        token:newToken,

        user:currentUser

    };



}

catch(error){


    console.error(

        "LOGIN ERROR",

        error.response?.data ||

        error.message

    );



    throw error;


}



};









/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/


const register = async(

userData

)=>{


try{


    const response =

    await api.post(

        "/auth/register",

        userData

    );



    const newToken =

    response.data.token;



    localStorage.setItem(

        "token",

        newToken

    );



    setToken(
        newToken
    );



    const currentUser =

    normalizeUser(

        response.data.user

    );



    setUser(
        currentUser
    );



    localStorage.setItem(

        "user",

        JSON.stringify(
            currentUser
        )

    );



    return {

        token:newToken,

        user:currentUser

    };



}

catch(error){


    console.error(

        "REGISTER ERROR",

        error.response?.data ||

        error.message

    );



    throw error;


}



};









/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/


const logout = ()=>{


    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );



    queryClient.clear();



    setUser(null);


    setToken(null);



    window.location.href =

    "/login";


};









/*
|--------------------------------------------------------------------------
| PERMISSIONS
|--------------------------------------------------------------------------
*/


const permissions =

user?.permissions || [];









const hasPermission = (

path

)=>{


return permissions.some(

(permission)=>

permission.path === path

);


};









const hasAnyPermission = (

paths=[]

)=>{


return paths.some(

path=>

hasPermission(path)

);


};









const hasAllPermissions = (

paths=[]

)=>{


return paths.every(

path=>

hasPermission(path)

);


};









/*
|--------------------------------------------------------------------------
| ROLE CHECK
|--------------------------------------------------------------------------
*/


const hasRole = (

roleName

)=>{


return (

normalizeRole(

    user?.role

)

===

normalizeRole(

    roleName

)

);


};









const canAccess = (

path

)=>{


return hasPermission(
    path
);


};









const getMenuPermissions = ()=>{


return permissions;


};









return (

<AuthContext.Provider

value={{

    user,

    token,

    loading,

    login,

    register,

    logout,

    fetchCurrentUser,

    permissions,

    hasPermission,

    hasAnyPermission,

    hasAllPermissions,

    hasRole,

    canAccess,

    getMenuPermissions

}}

>


{children}


</AuthContext.Provider>


);


}