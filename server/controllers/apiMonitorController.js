export const getApiMonitor = async (req,res)=>{
  res.json({
    success:true,
    api:{
      status:"HEALTHY",
      service:"API Service",
      database:"Connected",
      uptime:process.uptime(),
      environment:process.env.NODE_ENV || "production",
      timestamp:new Date()
    }
  });
};
