import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt, sign } from 'hono/jwt';
import { signinInput, signupInput } from '@yushank/medium-common';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL : string,
        JWT_TOKEN: string
    }
}>();

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())


    try {
        const body: {
            email: string,
            name: string,
            password: string
        } = await c.req.json();

        const parsePayload = signupInput.safeParse(body);

        if(!parsePayload.success){
            return c.body('Invalid input', 400)
        }

        const isUserExist = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password
            }
        })

        if (isUserExist) {
            return c.body('User already exist', 400)
        }

        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                password: body.password
            }
        })

        const token = await sign({ id: user.id }, c.env.JWT_TOKEN);

        return c.json({
            msg: "Account created succesfully",
            jwt: token,
            user: {
                userId: user.id,
                email: user.email,
            }
        })
    }
    catch (error) {
        return c.body(`Internal server error: ${error}`, 500)
    }
})


userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body: {
            email: string,
            password: string
        } = await c.req.json();

        const parsePayload = signinInput.safeParse(body);

        if(!parsePayload.success){
            return c.body('Invalid input', 400)
        }

        const isUserExist = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password
            }
        });

        if (isUserExist == null) {
            return c.body("user doesn't exist", 400)
        }

        const token = await sign({ id: isUserExist.id }, c.env.JWT_TOKEN);

        return c.json({
            msg: "login successful",
            token: token,
            user: {
                userId: isUserExist.id,
                email: isUserExist.email,
            }
        })
    }
    catch (error) {
        return c.body(`Internal server error: ${error}`, 500)
    }
})