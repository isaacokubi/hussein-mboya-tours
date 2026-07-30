import {SitemapStream}
from "sitemap";

import {createWriteStream}
from "fs";



const sitemap =
new SitemapStream({

hostname:
"https://husseimboyatours.com"

});



sitemap.pipe(

createWriteStream(
"./public/sitemap.xml"
)

);



sitemap.write({

url:"/"

});


sitemap.write({

url:"/tours"

});


sitemap.end();