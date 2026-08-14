
import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import axios from "axios";

const SettingsContext = createContext(null);


export function SettingsProvider({children}){

    const [settings,setSettings] = useState({});
    const [loading,setLoading] = useState(true);


    const loadSettings = async()=>{

        try{

            const res = await axios.get(
                "/api/settings/public"
            );

            setSettings(
                res.data.settings ||
                res.data ||
                {}
            );

        }catch(error){

            console.error(
                "GLOBAL SETTINGS LOAD ERROR",
                error
            );

        }finally{

            setLoading(false);

        }

    };


    useEffect(()=>{

        loadSettings();

    },[]);



    return (

        <SettingsContext.Provider
            value={{
                settings,
                setSettings,
                refreshSettings:loadSettings,
                loading
            }}
        >

            {children}

        </SettingsContext.Provider>

    );

}



export function useSettings(){

    return useContext(SettingsContext);

}
