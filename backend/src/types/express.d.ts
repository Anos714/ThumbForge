
import { RowSelect } from "drizzle-orm"; 
import { users } from "../db/schema.js"; 


type UserType = typeof users.$inferSelect; 

declare global {
  namespace Express {
    interface Request {
      user?: UserType; 
    }
  }
}