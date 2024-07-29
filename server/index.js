const express =require("express")
const cors =require("cors")

const mongoose=require("mongoose")

const userRoutes=require("./routes/user-Routes");

const app=express();
require("dotenv").config();

var corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200 
  }

app.use(cors(corsOptions));


app.use(express.json());
const PORT=process.env.PORT;

app.use("/api/auth",userRoutes);

mongoose.connect(process.env.MONGODB_URI,{
    
}).then(()=>{
    console.log("DB Connection Successful");
}).catch((err)=>{
    console.log(err.message);
});

const server =app.listen(PORT,()=>{
    console.log(`Server Started at PORT ${PORT}`)
});

