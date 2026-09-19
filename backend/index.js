import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import ventasRoutes from './routes/ventas.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
  res.send(' Servidor Backend PostgreSQL corriendo...');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});