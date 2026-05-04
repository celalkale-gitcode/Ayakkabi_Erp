import express from 'express';
import cors from 'cors';
import sayimRoutes from './routes/sayim.routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Rotaları
app.use('/api/v1/sayim', sayimRoutes);

export default app;

