import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './src/backends/Routes/auth'; // Import your routes
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use('/api', userRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
