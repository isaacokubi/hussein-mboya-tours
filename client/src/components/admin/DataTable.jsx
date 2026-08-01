export default function DataTable({
columns,
data=[]
}){


return (

<div className="
overflow-x-auto
bg-white
rounded-xl
shadow
">


<table className="
w-full
">


<thead
className="
bg-gray-100
"
>

<tr>


{
columns.map(col=>(

<th

key={col.key}

className="
p-4
text-left
"

>

{col.label}

</th>

))

}


</tr>


</thead>





<tbody>


{
data.map(
(row,index)=>(


<tr

key={row._id || index}

className="
border-b
"

>


{
columns.map(col=>(


<td

key={col.key}

className="
p-4
"

>


{
col.render

?
col.render(row)

:

row[col.key]

}


</td>


))


}



</tr>


))


}



</tbody>


</table>


</div>

)

}