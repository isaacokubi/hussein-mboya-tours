const images=[

"/gallery/mara.jpg",
"/gallery/amboseli.jpg",
"/gallery/diani.jpg",
"/gallery/safari.jpg",
"/gallery/culture.jpg",
"/gallery/beach.jpg"

];


export default function GallerySection(){


return (

<section className="
py-20
">


<div className="
container
mx-auto
px-6
">


<h2 className="
text-4xl
font-bold
text-center
mb-12
">

Safari Gallery

</h2>



<div className="
grid
md:grid-cols-3
gap-6
">


{
images.map(image=>(

<img

key={image}

src={image}

alt="Kenya Safari"

loading="lazy"

className="
rounded-xl
h-72
w-full
object-cover
hover:scale-105
transition
"

/>

))
}


</div>


</div>


</section>

)

}