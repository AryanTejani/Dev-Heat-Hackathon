import express from 'express';
import morgan from 'morgan';
import connectDb from './Db/connectDb.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import messageRoutes from "./routes/message.routes.js"
import cookieParser from 'cookie-parser';
import cors from 'cors';
connectDb();


const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://aicollab-9jul.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use("/ai", aiRoutes)
app.use('/messages', messageRoutes);



app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app; 