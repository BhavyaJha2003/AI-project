import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";





export const AppContext = createContext();


const AppContextPovider=(props)=>{
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'))

    const [credit, setCredit]= useState(0)

    const backendUrl= import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate()
    const loadCreditsData = async ()=>{
        try{
            const storedToken = localStorage.getItem("token");
            const { data } = await axios.get( backendUrl + "/api/users/credits",{ headers: { token: storedToken}});

        
            if(data.success){
                setCredit(data.credits)
                setUser(data.user)
            }
        }catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    const generateImage = async (prompt) => {
  try {
    const storedToken = localStorage.getItem("token");

    const { data } = await axios.post(
      backendUrl + "/api/image/generate-image",
      { prompt },
      {
        headers: {
          token: storedToken
        }
      }
    );

    if (data.success) {
      await loadCreditsData();
      return data.resultImage;
    } else {
      toast.error(data.message);

      if (data.creditBalance === 0) {
        navigate("/buy");
      }

      await loadCreditsData();
    }
  } catch (error) {
    toast.error(error.message);
  }
};

    const logout = ()=>{
        localStorage.removeItem('token')
        setToken('')
        setUser(null)
    }
    useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    loadCreditsData();
  }
}, [])

    const value={
        user,setUser,showLogin,setShowLogin, backendUrl, token, setToken, credit, setCredit, loadCreditsData, logout, generateImage
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextPovider