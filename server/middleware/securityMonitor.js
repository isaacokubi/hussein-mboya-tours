import SecurityLog from "../models/SecurityLog.js";



/*
|--------------------------------------------------------------------------
| SECURITY MONITOR MIDDLEWARE
|--------------------------------------------------------------------------
|
| Tracks incoming requests and detects suspicious activity.
|
|--------------------------------------------------------------------------
*/


const securityMonitor = async (
  req,
  res,
  next
) => {


  try {


    /*
    |--------------------------------------------------------------------------
    | REQUEST MONITORING
    |--------------------------------------------------------------------------
    */


    console.log({

      method: req.method,

      url: req.originalUrl,

      ip: req.ip,

      userAgent:
        req.headers["user-agent"],

      time:
        new Date(),

    });



    /*
    |--------------------------------------------------------------------------
    | SUSPICIOUS REQUEST DETECTION
    |--------------------------------------------------------------------------
    */


    const suspiciousPatterns = [

      "<script",

      "DROP TABLE",

      "../",

      "UNION SELECT",

      "SELECT * FROM",

      "<iframe",

      "javascript:",

    ];



    const requestData = JSON.stringify({

      body: req.body,

      params: req.params,

      query: req.query,

    });



    const foundPattern =
      suspiciousPatterns.find(
        pattern =>
          requestData
          .toUpperCase()
          .includes(
            pattern.toUpperCase()
          )
      );



    /*
    |--------------------------------------------------------------------------
    | SAVE SECURITY INCIDENT
    |--------------------------------------------------------------------------
    */


    if(foundPattern){


      await SecurityLog.create({

        action:
          "suspicious_request",


        ipAddress:
          req.ip,


        userAgent:
          req.headers["user-agent"],


        details: {

          patternDetected:
            foundPattern,


          method:
            req.method,


          url:
            req.originalUrl,


          request:
            requestData,

        },


      });



      console.log(
        "⚠️ Suspicious request detected:",
        foundPattern
      );


    }



    /*
    |--------------------------------------------------------------------------
    | CONTINUE REQUEST
    |--------------------------------------------------------------------------
    */


    next();



  } catch(error){



    console.error(
      "Security Monitor Error:",
      error.message
    );


    /*
    Continue application even if logging fails
    */


    next();


  }


};



export default securityMonitor;