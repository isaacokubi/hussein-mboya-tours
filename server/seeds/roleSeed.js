import Role from "../models/Role.js";


const roles = [

    {
        name: "superadmin"
    },

    {
        name: "admin"
    },

    {
        name: "customer"
    },

    {
        name: "bookingagent"
    },

    {
        name: "tourmanager"
    },

    {
        name: "finance"
    },

    {
        name: "tourguide"
    }

];



const seedRoles = async()=>{


try{


for(const role of roles){


await Role.findOneAndUpdate(

{
name: role.name
},


{
$set:{
name: role.name
}
},


{
upsert:true,
new:true
}

);


}



console.log(
"Roles seeded successfully"
);



}catch(error){


console.error(
"Role Seeder Error:",
error.message
);


throw error;


}


};



export default seedRoles;