require("dotenv").config({path:".env"});
const express= require("express")
const path=require("path")
const bodyParser=require("body-parser")
const cookieParser=require("cookie-parser"); 
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const isAuthenticate= require("./middlerware/isAuth");
const {connectToDatabase} = require("./confiq/mongoConfiq");

// db connection
connectToDatabase()
// middle wares
const app=express()

app.use(express.static(path.join(__dirname,'/public')));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// view engine
app.set("view engine","ejs")
app.set("views","views")
app.use(isAuthenticate)
app.use(shopRouter)
app.use(authRouter)
app.use(adminRouter)
app.use(userRouter)


const port=process.env.port
app.listen(port,()=>{
    console.log(`server is listening in ${port}`);
})
