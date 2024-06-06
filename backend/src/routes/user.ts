import {Hono} from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
 import { decode,sign,verify } from 'hono/jwt'
import { signinInput, signupInput } from "@dasishivapranav07/medium-common";

  
export const userRouter = new Hono<{
  Bindings:{
   DATABASE_URL:string;
   JWT_SECRET:string;
 }
}>()

userRouter.post('/signup', async(c) => {
  const body = await c.req.json();
  const {success}=signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message:"inputs are bot correct"
    })
  }
const prisma = new PrismaClient({
  datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
   try{
   const user =  await prisma.user.create({
      data: {
        username:body.username,
        password:body.password,
        name:body.name
      }
    })
       const token = await sign({
                id:user.id
       },c.env.JWT_SECRET)
       return c.json({
        "message":"signedupsucessfully",
        jwt:token
       })
   }catch(e){
    console.log(e);
    c.status(411);
    return c.text('invalid')
   }
    
})


 userRouter.post('/signin', async (c) => {
  const body = await c.req.json();
  const {success}=signinInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message:"inputs are not correct"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{
    const user = await prisma.user.findFirst({
      where:{
        username:body.username,
        password:body.password,
      }
    })
    if(!user){
      c.status(403);
      return c.text('no user with this name')
    }
    const token = await sign({
      id:user.id
      },c.env.JWT_SECRET)
      return c.json({
        "message":"signin in sucessfully",
     jwt:token
       })
  }catch(e){
         console.log(e);
         c.status(411);
         return c.text('invalid');
  }
})
