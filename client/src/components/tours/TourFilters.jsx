export default function TourFilters({
filters,
setFilters
}){


return (

<div
className="
bg-white
shadow-md
rounded-xl
p-5
grid
md:grid-cols-4
gap-4
"
>


<input

placeholder="Search country"

className="
border
p-3
rounded
"

value={
filters.country
}

onChange={
(e)=>
setFilters({

...filters,

country:
e.target.value

})
}

/>



<select

className="
border
p-3
rounded
"

value={
filters.category
}

onChange={
(e)=>
setFilters({

...filters,

category:
e.target.value

})
}

>


<option value="">
All Categories
</option>


<option>
Safari
</option>


<option>
Beach
</option>


<option>
Adventure
</option>


<option>
Honeymoon
</option>


</select>



<input

type="number"

placeholder="Minimum price"

className="
border
p-3
rounded
"

onChange={
(e)=>
setFilters({

...filters,

minPrice:
e.target.value

})
}

/>



<input

type="number"

placeholder="Maximum price"

className="
border
p-3
rounded
"

onChange={
(e)=>
setFilters({

...filters,

maxPrice:
e.target.value

})
}

/>


</div>

);

}