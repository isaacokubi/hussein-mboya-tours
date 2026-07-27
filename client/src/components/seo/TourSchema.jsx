export default function TourSchema({
tour
}){


const schema={


"@context":
"https://schema.org",


"@type":
"TouristTrip",


"name":
tour.title,


"description":
tour.description,


"image":
tour.images,


"offers":{

"@type":
"Offer",

"price":
tour.price,

"priceCurrency":
"KES"

}

};



return (

<script

type="application/ld+json"

>

{
JSON.stringify(schema)
}

</script>

);

}