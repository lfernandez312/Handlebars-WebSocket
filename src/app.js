import express from 'express';
import productsRouter from './routes/productsRouter.js';
import cartsRouter from './routes/cartsRouter.js';

const app = express();
const port = 8080;

// Agregar el middleware express.json() para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
  res.send('Bienvenido a la API');
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
