import {
SitemapStream,

streamToPromise

}
from "sitemap";


import Tour
from "../models/Tour.js";



export const generateSitemap =
async()=>{


const sitemap =
new SitemapStream({

hostname:
process.env.CLIENT_URL

});



const tours =
await Tour.find();



tours.forEach(
tour=>{


sitemap.write({

url:
`/tours/${tour.slug}`,

changefreq:
"weekly",

priority:
0.8

});


}

);



sitemap.end();



return streamToPromise(
sitemap
);


};