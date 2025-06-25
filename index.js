import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Client } from 'pg';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';



const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors());
app.use(logger);

client.connect();

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Inventory Manager API is running');
});

import userRoutes from './routes/userRoutes.js';
app.use('/users', userRoutes);

import customerRoutes from './routes/customerRoutes.js';
app.use('/customers', customerRoutes);

import locationRoutes from './routes/locationRoutes.js';
app.use('/locations', locationRoutes);

import categoryRoutes from './routes/categoryRoutes.js';
app.use('/categories', categoryRoutes);

import productRoutes from './routes/productRoutes.js';
app.use('/products', productRoutes);

import inventoryRoutes from './routes/inventoryRoutes.js';
app.use('/inventory', inventoryRoutes);


app.use(errorHandler);
