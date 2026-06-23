import express, { Request, Response } from 'express'
import 'dotenv/config'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { env } from './validators/env.validator.js'
import { globalErrorHandler } from './middlewares/error.middleware.js'
import authRouter from './routes/auth.routes.js'

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:env.FRONTEND_URL||'http://localhost:3000',
    methods:['GET','POST','PUT','DELETE'],
    credentials:true
}));


app.use('/health',(req:Request,res:Response)=>{
    return res.status(200).json({
        message:"API is healthy"
    })
})
app.use('/api/v1/auth',authRouter)



// global error handler
app.use(globalErrorHandler)