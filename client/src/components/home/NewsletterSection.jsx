import { motion } from "framer-motion";
import { useState } from "react";


export default function NewsletterSection(){


const [email,setEmail] = useState("");



const handleSubmit = (e)=>{

    e.preventDefault();

    if(!email) return;


    console.log(
        "Newsletter subscription:",
        email
    );


    setEmail("");

};




return (

<section className="py-16 bg-gray-900 text-white">


    <div className="max-w-5xl mx-auto px-6 text-center">


        <motion.h2

            initial={{
                opacity:0,
                y:20
            }}

            whileInView={{
                opacity:1,
                y:0
            }}

            transition={{
                duration:0.5
            }}

            className="text-3xl md:text-4xl font-bold mb-4"

        >

            Subscribe To Our Travel Updates

        </motion.h2>





        <p className="text-gray-300 mb-8">

            Get exclusive tour offers, travel tips,
            and destination updates from Hussein Mboya Tours.

        </p>





        <form

            onSubmit={handleSubmit}

            className="flex flex-col md:flex-row gap-4 justify-center"

        >


            <input

                type="email"

                value={email}

                onChange={(e)=>setEmail(e.target.value)}

                placeholder="Enter your email"

                required

                className="px-5 py-3 rounded-lg text-gray-900 w-full md:w-96"

            />




            <button

                type="submit"

                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"

            >

                Subscribe

            </button>



        </form>


    </div>


</section>

);


}