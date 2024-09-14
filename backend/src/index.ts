import { Hono } from 'hono'
import { userRouter } from './routes/user';
import { cors } from 'hono/cors';
import { blogRouter } from './routes/blog';

const app = new Hono();

app.use(cors());

app.route('api/v1/users', userRouter);
app.route('api/v1/blogs', blogRouter);

app.get('/', (c)=> c.text('Welcome to blooging platform API'));



export default app
