// client/src/components/HusseinAIWidget.jsx

import {
  useState
} from "react";

import {
  MessageCircle,
  X,
  Send
} from "lucide-react";

import { askTravelAI } from "../api/aiApi";



const HusseinAIWidget = () => {

  const [open, setOpen] = useState(false);


  const [message, setMessage] = useState("");


  const [messages, setMessages] = useState([

    {
      role: "assistant",
      text:
      "👋 Hello, I am Hussein AI. How can I help plan your trip?"
    }

  ]);


  const [loading, setLoading] = useState(false);

  const [bookingTour, setBookingTour] = useState(null);





  const sendMessage = async () => {


    if (!message.trim())
      return;



    const userMessage = {

      role: "user",

      text: message

    };



    setMessages(prev => [

      ...prev,

      userMessage

    ]);



    setMessage("");


    try {


      setLoading(true);



      const data = await askTravelAI(
        message
      );



      setMessages(prev => [

        ...prev,

        {

          role:"assistant",

          text:
          data?.data?.reply
          ||
          "I can help you plan your journey.",

          booking:
          data?.data?.reply?.includes("Tour ID:"),

          tourId:
          data?.data?.reply
          ?.match(/Tour ID:\s*([a-f0-9]+)/i)?.[1],

          bookingId:
          data?.data?.reply
          ?.match(/Booking ID:\s*([a-f0-9]+)/i)?.[1]
          

        }

      ]);



    }

    catch {


      setMessages(prev => [

        ...prev,

        {

          role:"assistant",

          text:
          "Sorry, I am unavailable right now."

        }

      ]);


    }

    finally{

      setLoading(false);

    }


  };







  return (

    <>


      {!open && (

        <button

          onClick={() =>
            setOpen(true)
          }

          className="
          fixed
          bottom-6
          right-6
          z-50
          bg-green-600
          text-white
          rounded-full
          w-16
          h-16
          shadow-xl
          flex
          items-center
          justify-center
          hover:scale-110
          transition
          "

        >

          <MessageCircle size={32}/>

        </button>

      )}






      {open && (

        <div

          className="
          fixed
          right-0
          top-0
          h-screen
          w-full
          md:w-[420px]
          bg-white
          shadow-2xl
          z-50
          flex
          flex-col
          "

        >



          {/* HEADER */}

          <div

            className="
            flex
            justify-between
            items-center
            bg-green-700
            text-white
            p-4
            "

          >


            <div>


              <h2 className="
              font-bold
              text-lg
              ">

                Hussein AI Assistant

              </h2>


              <p className="
              text-sm
              ">

                Your travel companion

              </p>


            </div>



            <button

              onClick={() =>
                setOpen(false)
              }

              className="
              hover:bg-green-800
              p-2
              rounded
              "

            >

              <X size={25}/>

            </button>



          </div>







          {/* CHAT AREA */}


          <div

            className="
            flex-1
            p-5
            overflow-y-auto
            space-y-3
            "

          >



            {
              messages.map(
                (msg,index)=>(


                  <div

                    key={index}

                    className={`
                    rounded-lg
                    p-3
                    max-w-[85%]
                    ${
                      msg.role==="user"
                      ?
                      "ml-auto bg-green-600 text-white"
                      :
                      "bg-gray-100"
                    }
                    `}

                  >

                    {msg.text}


                    {
                      msg.booking && (

                        <button

                          onClick={() =>
                            window.location.href =
                            msg.bookingId
                            ?
                            `/checkout/booking/${msg.bookingId}`
                            :
                            msg.tourId
                            ?
                            `/checkout/tour/${msg.tourId}`
                            :
                            "/tours"
                          }

                          className="
                          mt-3
                          bg-green-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          "

                        >

                          Continue Booking

                        </button>

                      )
                    }

                  </div>


                )

              )

            }



            {
              loading && (

                <div className="
                bg-gray-100
                rounded-lg
                p-3
                ">

                  Hussein AI is typing...

                </div>

              )
            }



          </div>







          {/* INPUT */}


          <div

            className="
            border-t
            p-3
            flex
            gap-2
            "

          >


            <input


              value={message}


              onChange={
                e =>
                setMessage(
                  e.target.value
                )
              }


              onKeyDown={
                e => {

                  if(
                    e.key==="Enter"
                  )
                    sendMessage();

                }
              }


              placeholder="
              Ask Hussein AI about tours...
              "


              className="
              flex-1
              border
              rounded-lg
              px-3
              "

            />




            <button

              onClick={sendMessage}


              className="
              bg-green-600
              text-white
              px-4
              rounded-lg
              "

            >

              <Send size={20}/>

            </button>


          </div>





        </div>

      )}



    </>

  );

};



export default HusseinAIWidget;