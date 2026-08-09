import {
    useState
}
from "react";





export default function LazyImage({

    src,

    alt = "",

    className = "",

    fallback = "/images/image-placeholder.jpg"

}){





const [imageSrc,setImageSrc] = useState(src);

const [loading,setLoading] = useState(true);







return (

<div

className="
relative
overflow-hidden
"

>






{

loading &&

<div

className="
absolute
inset-0
bg-gray-200
animate-pulse
"

></div>

}









<img


src={imageSrc || fallback}


alt={alt}


loading="lazy"


decoding="async"



className={`
transition-opacity
duration-500
${loading ? "opacity-0" : "opacity-100"}
${className}
`}



onLoad={()=>setLoading(false)}



onError={()=>{


setImageSrc(fallback);

setLoading(false);


}}



/>



</div>

);


}