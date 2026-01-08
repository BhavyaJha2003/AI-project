import { useState } from "react";
import { createContext } from "react";

export const AppContext = createContext();


const AppContextPovider=(props)=>{
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);

    const value={
        user,setUser,showLogin,setShowLogin
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextPovider