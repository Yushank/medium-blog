import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign } from 'hono/jwt';
import { authMiddleware } from '../middleware/user';
import { Context } from 'hono/jsx';
import { createBlogInput, updateBlogInput } from '@yushank/medium-common';


export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string,
      JWT_TOKEN: string
    }
    Variables: {
        userId: string
    }
  }>();


blogRouter.post('/create-post',authMiddleware , async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try{
        const body: {
            title: string,
            content: string,
        } =  await c.req.json();

        const parsePayload = createBlogInput.safeParse(body);

        if(!parsePayload.success){
            return c.body('Invalid input', 400)
        }
        
        const blog = await prisma.post.create({
            data:{
                title: body.title,
                content: body.content,
                authorId: parseInt(c.get('userId'))
            }
        })

        return c.json({
            msg: 'post created successfully',
            post: {
                id: blog.id,
                title: blog.title,
                content: blog.content,
                createdAt: blog.createdAt
            }
        })
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500)
    }
})


blogRouter.put('/update',authMiddleware ,async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try{
        // const body: {
        //     title: string,
        //     content: string,
        //     id: number
        // } = await c.req.json();

        // const id = c.req.param('id');

        const body = await c.req.json();

        const authenticatedUserId = parseInt(c.get('userId'));

        const parsePayload = updateBlogInput.safeParse(body);

        if(!parsePayload.success){
            return c.body('Invalid input', 400)
        }

        const existingPost = await prisma.post.findFirst({
            where: {
                id: body.id
            }
        })

        if(existingPost == null){
            return c.body("Post doesn't exist", 404)
        }

        if(existingPost.authorId !== authenticatedUserId){
            return c.json({
                error: 'Unauhtorised'
            }, 403)
        }

        const blog = await prisma.post.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        })

        return c.json({
            msg: "Post updated successfully",
            updatePost: {
                id: body.id,
                title: blog.title,
                content: blog.content,
                createdAt: blog.createdAt
            }
        })
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500)
    }

})


blogRouter.get('/post/:id',authMiddleware ,async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try{
        const id = parseInt(c.req.param('id'));

        const blog = await prisma.post.findFirst({
            where: {
                id: id,
                authorId: parseInt(c.get('userId'))
            }
        })

        if(blog == null){
            return c.body("Post doesn't exist", 404)
        }

        return c.json({
            post: {
                id: id,
                title: blog?.title,
                content: blog?.content,
                createdAt: blog?.createdAt
            }
        })
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500)
    }

})


blogRouter.get('/bulk',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try{
        const blog = await prisma.post.findMany();

        return c.json({
            blog
        })
    }
    catch(error){
        return c.body(`Internal server error: ${error}`, 500)
    }
})