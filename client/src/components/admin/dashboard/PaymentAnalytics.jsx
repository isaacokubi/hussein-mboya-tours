export default function PaymentAnalytics({

    payments = {
        completed:0,
        pending:0,
        failed:0
    }

}) {


return (

<section
className="
bg-white
rounded-xl
shadow
p-6
"
>


<h2
className="
font-bold
text-xl
mb-5
"
>
Payments
</h2>



<div
className="
space-y-4
"
>


<Item

label="Completed"

value={
payments.completed
}

/>



<Item

label="Pending"

value={
payments.pending
}

/>



<Item

label="Failed"

value={
payments.failed
}

/>



</div>


</section>

);

}





function Item({

label,

value

}){


return (

<div
className="
flex
justify-between
border-b
pb-2
"
>


<span>

{label}

</span>



<strong>

{
value ?? 0
}

</strong>



</div>

);


}
