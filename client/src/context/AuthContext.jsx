/* eslint-disable react-refresh/only-export-components */
// client/src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";


import api from "../api/axios";


import {
  queryClient
} from "../lib/queryClient";



export const AuthContext = createContext();



export const useAuth = () =>
  useContext(AuthContext);




/*
|--------------------------------------------------------------------------
| ROLE NORMALIZER
|--------------------------------------------------------------------------
*/

const normalizeRole = (role) => {

  return (

    role
      ?.toString()
      .toLowerCase()
      .replace(/[\s_-]/g, "")

    ||

    ""

  );

};





/*
|--------------------------------------------------------------------------
| USER NORMALIZER
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

        user?.role?.name

        ||

        user?.role

        ||

        user?.legacyRole

      )


  };


};







export function AuthProvider({

  children

}) {


  const [user,setUser] =
    useState(null);



  const [token,setToken] =
    useState(

      localStorage.getItem("token")

    );



  const [loading,setLoading] =
    useState(true);







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



  window.location.href="/login";


};








/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/


const fetchCurrentUser =
async()=>{


try{


  const {data} =
    await api.get(
      "/auth/me"
    );



  const currentUser =
    normalizeUser(

      data.user || data

    );



  setUser(
    currentUser
  );



  localStorage.setItem(
    "user",
    JSON.stringify(currentUser)
  );
  localStorage.setItem(
    "permissions",
    JSON.stringify(currentUser.permissions || [])
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


useEffect(() => {
  const savedToken = localStorage.getItem("token");

  queueMicrotask(() => {
    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    fetchCurrentUser().finally(() => {
      setLoading(false);
    });
  });

  // Intentional one-time session restoration on provider mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);








/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/


const login =
async(

 email,

 password

)=>{


const {data} =
 await api.post(

   "/auth/login",

   {
     email,
     password
   }

 );



const newToken =
 data.token;



localStorage.setItem(
 "token",
 newToken
);



setToken(
 newToken
);



const currentUser =
 normalizeUser(
   data.user
 );



setUser(
 currentUser
);



localStorage.setItem(

 "user",

 JSON.stringify(currentUser)

);



return {

 token:newToken,

 user:currentUser

};


};








/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/


const register =
async(userData)=>{


const {data} =
 await api.post(

 "/auth/register",

 userData

 );



return data;


};









/*
|--------------------------------------------------------------------------
| PERMISSIONS
|--------------------------------------------------------------------------
*/


const permissions =
 user?.permissions || [];




const isAdmin =

 ["admin","administrator"].includes(normalizeRole(user?.role))

 ||

 ["superadmin","super_admin","administrator"].includes(normalizeRole(user?.role));






const hasPermission =
(permission)=>{


 if(isAdmin){

  return true;

 }



 return permissions.some(
  (item) =>
    (typeof item === "string" ? item : item?.name) === permission ||
    (typeof item === "object" && item?.path === permission)
 );


};







const hasAnyPermission =
(paths=[])=>{


return paths.some(

 path =>

 hasPermission(path)

);


};






const hasAllPermissions =
(paths=[])=>{


return paths.every(

 path =>

 hasPermission(path)

);


};








/*
|--------------------------------------------------------------------------
| ROLE CHECK
|--------------------------------------------------------------------------
*/


const hasRole =
(roleName)=>{


return (

 normalizeRole(user?.role)

 ===

 normalizeRole(roleName)

);


};







const canAccess =
(path)=>{


return hasPermission(path);


};






const getMenuPermissions =
()=>permissions;







return (

<AuthContext.Provider

value={{

user,

setUser,

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