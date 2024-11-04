import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Connect_DB from './database_con';
import userRoutes from '../backends/Routes/auth'; // Import your routes
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT;

Connect_DB();


app.use(cors());
app.use(bodyParser.json());
app.use('/api', userRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
