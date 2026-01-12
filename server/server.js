import dotenv from "dotenv";
dotenv.config(); 
import express from "express"
import cors from "cors"

import connectDB from "./config/mongodb.js"
import userRouter from "./routes/userRoutes.js"
import imageRouter from "./routes/imageRoutes.js";

const app = express()
const PORT = process.env.PORT || 4000

// VERY IMPORTANT
app.use(express.json())        
app.use(cors())

await connectDB()

app.use("/api/users", userRouter)
app.use("/api/image", imageRouter)

app.get("/", (req, res) => {
  res.send("API working")
})

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})
