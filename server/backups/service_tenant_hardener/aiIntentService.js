export const detectIntent = (message = "") => {

  const text = message.toLowerCase();


  if(
    text.includes("book") ||
    text.includes("reserve") ||
    text.includes("booking")
  ){
    return "BOOKING";
  }


  if(
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("budget")
  ){
    return "PRICE";
  }


  if(
    text.includes("recommend") ||
    text.includes("suggest") ||
    text.includes("best")
  ){
    return "RECOMMENDATION";
  }


  if(
    text.includes("where") ||
    text.includes("destination") ||
    text.includes("place")
  ){
    return "DESTINATION";
  }


  if(
    text.includes("visa") ||
    text.includes("passport")
  ){
    return "TRAVEL_INFO";
  }


  return "GENERAL";

};
