import express from 'express';
import bodyParser from 'body-parser';
import { Client } from 'pg';

export const client = new Client({
  host: 'localhost',
  user: 'crmeyer',
  port: 5432,
  password: 'Kikirex!10!31!',
  database: 'inventory-manager-tester'
});

const app = express();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

client.connect();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Inventory Manager API is running');
});

import userRoutes from './routes/userRoutes.js';
app.use('/users', userRoutes);

import customerRoutes from './routes/customerRoutes.js';
app.use('/customers', customerRoutes);