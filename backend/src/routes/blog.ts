import {Hono} from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
 import { decode,sign,verify } from 'hono/jwt'
import { createPostInput, updatePostInput } from "@dasishivapranav07/medium-common";
   
 
export const  blogRouter = new Hono<{
  Bindings:{
   DATABASE_URL:string;
   JWT_SECRET:string;
 },Variables:{
  userId:string;
 }
}>()

blogRouter.use("/",async (c,next)=>{
  const authHeadder  =  c.req.header("authorization") || "";
  const user = await verify(authHeadder,c.env.JWT_SECRET);
  if(user){
    //@ts-ignore
    c.set("userId",user.id);
    await next();
  }else{
    c.status(400);
    return c.json({
      "message":"yopu are not logged in"
    })
  }
   
})


blogRouter.post('/', async(c) => {
  const body = await c.req.json();
  const {success}= createPostInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message:"inputs are bot correct"
    })
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.blog.create({
    data:{
      title:body.title,
      content:body.content,
      authorId:Number(authorId)

    }
  })
  return c.json({
    id:blog.id
  })
})

blogRouter.put('/', async (c) => {
  const body = await c.req.json();
   const {success}= updatePostInput.safeParse(body);
   if(!success){
    c.status(411);
    return c.json({
      message:"inputs are bot correct"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.blog.update({
    where:{
      id:body.id
    },
    data:{
      title:body.title,
      content:body.content,
    }
  })
  return c.json({
    id:blog.id
  })
})


//add pagination
blogRouter.get('/bulk', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const blog = await prisma.blog.findMany();
  return c.json({
    blog
  })
})


blogRouter.get('/:id', async (c) => {
  const  id = await c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  try{
    const blog = await prisma.blog.findFirst({
      where:{
        id:Number(id)
      },
    
    })
    return c.json({
      blog
    })
  }catch(e){
    c.status(411);
    return c.json({
      "message":"error whilke fetching blog post"
    })
  }
})

 