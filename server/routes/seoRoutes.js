import express from "express";

import {
generateSitemap
}
from "../services/sitemapService";


const router =
express.Router();



router.get(

"/sitemap.xml",

async(req,res)=>{


const sitemap =
await generateSitemap();



res.header(
"Content-Type",
"application/xml"
);



res.send(
sitemap
);


}

);



export default router;