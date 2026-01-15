import React, { useContext } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const BuyCredit = () => {

 const {user, backendUrl, loadCreditsData, token, setShowLogin} = useContext(AppContext)

 const navigate = useNavigate()
 const storedToken = token
 const initPay = (data) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: data.order.amount,
    currency: data.order.currency,
    name: "Credits Payment",
    description: "Credits Payment",
    order_id: data.order.id,
    handler: async function (response) {
      try {
        const { data } = await axios.post(
          backendUrl + "/api/users/verify-razor",
          response,
          { headers: { token: storedToken } }
        );

        if (data.success) {
          await loadCreditsData();
          navigate("/");
          toast.success("Credit Added");
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


 


 const paymentRazorpay = async (planId)=>{
  console.log("User from context:", user);

  console.log("Clicked:", planId); 
   try{
    if(!user){
      setShowLogin(true)
      return;
    }
    
   const {data} = await axios.post(backendUrl + '/api/users/pay-razor', {planId}, {headers:{token:storedToken}})

   
   if(data.success){
  initPay(data)
}else{
  toast.error(data.message)
}


   }catch(error){
    toast.error(error.message)
   }
 }

  return (
    <motion.div initial={{opacity:0.2,y:100}} transition={{duration:1}} viewport={{once:true}} whileInView={{opacity:1,y:0}} className='text-center min-h-[80vh] pt-14 mb-10'>

      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>
        Our Plans
      </button>

      <h1 className='text-center text-3xl font-medium mb-6 sm:mb-10'>
        Choose the plan
      </h1>

      {/* 🔥 THIS is the important wrapper */}
      <div className='flex justify-center gap-10 flex-wrap'>

        {plans.map((item, index) => (
          <div 
            key={index}
            className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 
                       text-gray-600 hover:scale-105 transition-all duration-500 
                       w-72 text-center'
          >
            <img width={40} src={assets.logo_icon} alt="" />

            <p className='mt-3 mb-1 font-semibold'>{item.id}</p>

            <p className='text-sm'>{item.desc}</p>

            <p className='mt-6'>
              <span className='text-3xl font-medium'>
                ${item.price}
              </span>
              &nbsp;/ {item.credits} credits
            </p>
            <button onClick={()=>paymentRazorpay(item.id)} className='w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52'>{user ? 'Purchase':'Get Started'}</button>
          </div>
        ))}

      </div>
    </motion.div>
  )
}

export default BuyCredit
