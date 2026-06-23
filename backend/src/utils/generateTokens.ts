import { env } from "../validators/env.validator.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto'



export const generateJti=():string=>{
return crypto.randomUUID()
}

export const generateAccessToken=(userId:string):string=>{
    return jwt.sign({userId},env.ACCESS_SECRET,{
        expiresIn:"15m"
    })
}

export const generateRefreshToken=(userId:string,jti:string):string=>{
    return jwt.sign({userId,jti},env.REFRESH_SECRET,{
        expiresIn:"7d"
    })
}

export const verifyRefreshToken=(token:string)=>{
    try {
        return jwt.verify(token,env.REFRESH_SECRET) as jwt.JwtPayload
    } catch (error) {
        return null;
    }
    
}

export const verifyAccessToken=(token:string)=>{
    try {
        return jwt.verify(token,env.ACCESS_SECRET) as jwt.JwtPayload
    } catch (error) {
        return null;
    }
    
}

export const generateOtp=()=>{
    return crypto.randomInt(100000,999999).toString();
}