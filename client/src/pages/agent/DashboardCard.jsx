import React from "react";


const DashboardCard = ({
  title,
  value,
  icon
}) => {

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>


          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

        </div>


        <div>
          {icon}
        </div>


      </div>

    </div>

  );

};


export default DashboardCard;