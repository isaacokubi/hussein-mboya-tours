export const calculateQuotation =
(items, discount=0, taxRate=0)=>{


const subtotal =
items.reduce(

(sum,item)=>

sum +
(
item.quantity *
item.unitPrice
),

0

);



const tax =
subtotal *
(taxRate/100);



const grandTotal =

subtotal
+
tax
-
discount;



return {

subtotal,

tax,

discount,

grandTotal

};


};