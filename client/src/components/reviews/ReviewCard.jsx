import Rating
from "./Rating";


export default function ReviewCard({
review
}){


return (

<div
className="
bg-white
shadow
rounded-xl
p-5
"
>


<h3
className="
font-bold
"
>

{
review.user.name
}

</h3>



<Rating

value={
review.rating
}

/>



<h4>

{
review.title
}

</h4>



<p>

{
review.comment
}

</p>



<button>

Helpful 👍
(
{
review.helpfulVotes
}
)

</button>


</div>

);

}