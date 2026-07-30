export const convertCurrency =
(amount,rate)=>{


return Number(

amount / rate

)
.toFixed(2);


};