import userModel from "../models/userModel.js";    
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";



const registerUser = async (req , res)=>{
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.json({success:false, message: 'Missing Details'})
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
        name,
        email,
        password: hashedPassword 
    }
    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

    res.json({success:true, token, user : {name: user.name, creditBalance: user.creditBalance}})
} catch (error) {
    console.log(error);
    res.json({success:false, message: error.message})

}
}

const loginUser = async (req , res)=>{
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message: 'User does not exist'})

        }
        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.json({success: true, token, user:{name: user.name, creditBalance: user.creditBalance}})
        }else{
            return res.json({success:false, message: 'Invalid Credentials'})
        }
        
      
    }

    
        catch (error) {
            console.log(error)
            res.json({success:false, message: error.message})
        }
    }

    const userCredits = async(req,res)=>{
        try{
            const userId = req.userId;
            const user = await userModel.findById(userId)
            res.json({success: true, credits: user.creditBalance, user: {name: user.name}})
        } catch (error) {
            console.log(error.message)
            res.json({ success : false , message : error.message})
        }
    }

    
    const paymentRazorpay = async(req,res)=>{
        const razorpayInstance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

        try{
            const userId = req.userId
            const { planId } = req.body

            if(!userId || !planId){
                return res.json ({
                    success:false,
                    message : "Missing details"
                })
            }
             
            let credits, plan, amount, date

            switch (planId){
                case 'Basic':
                    plan='Basic'
                    credits= 100
                    amount =10
                    break;

                case 'Advanced':
                    plan='Advanced'
                    credits= 500
                    amount =50
                    break;

                case 'Business':
                    plan='Business'
                    credits= 5000
                    amount =250
                    break;

                default:
                    return res.json({success : false, message : 'plan not found'})    
    
            }

            date = Date.now();

            const transactionData = {
                userId, plan, amount, credits, date
            }


            const newTransaction = await transactionModel.create(transactionData)
            const options = {
                 amount: amount*100,
                 currency: process.env.CURRENCY|| "INR",
                 receipt: newTransaction._id.toString(),

            }
            

            
             
            const order = await razorpayInstance.orders.create(options)

            await transactionModel.findByIdAndUpdate(newTransaction._id, {
            razorpay_order_id: order.id
        })

        res.json({
        success: true,
        order,
        key: process.env.RAZORPAY_KEY_ID
        })


            

        }catch(error){
            console.log(error)
            res.json({success:false, message: error.message})
        }
    }
    
    


  
  const verifyRazorpay = async (req, res) => {
  const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
      return res.json({ success: false, message: "Missing razorpay_order_id" });
    }

    // Fetch order from Razorpay
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (!orderInfo || !orderInfo.receipt) {
      return res.json({ success: false, message: "Invalid Razorpay order" });
    }

    // Find transaction using receipt
    const transactionData = await transactionModel.findById(orderInfo.receipt);

    if (!transactionData) {
      return res.json({ success: false, message: "Transaction not found" });
    }

    // Prevent double crediting
    if (transactionData.payment === true) {
      return res.json({ success: false, message: "Payment already processed" });
    }

    // Make sure Razorpay order is actually paid
    if (orderInfo.status !== "paid") {
      return res.json({ success: false, message: "Payment not completed" });
    }

    // Add credits to user
    const userData = await userModel.findById(transactionData.userId);

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const newBalance = userData.creditBalance + transactionData.credits;

    await userModel.findByIdAndUpdate(userData._id, {
      creditBalance: newBalance
    });

    await transactionModel.findByIdAndUpdate(transactionData._id, {
      payment: true
    });

    res.json({ success: true, message: "Credits Added" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};



    export {registerUser, loginUser, userCredits, paymentRazorpay, verifyRazorpay}




    