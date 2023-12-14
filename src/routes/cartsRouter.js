import express from 'express';
import fs from 'fs/promises';

const CARTS_FILE_PATH = './carrito.json';
let carts = [];

// Función para leer los carritos desde el archivo
const readCarts = async () => {
  try {
    const cartsData = await fs.readFile(CARTS_FILE_PATH, 'utf8');
    const parsedCarts = JSON.parse(cartsData);

    // Verificar si lo que leemos es un array
    if (Array.isArray(parsedCarts)) {
      carts = parsedCarts;
    } else {
      carts = [];
    }
  } catch (error) {
    carts = [];
  }
};

// Función para escribir los carritos en el archivo
const writeCarts = async () => {
  try {
    await fs.writeFile(CARTS_FILE_PATH, JSON.stringify(carts, null, 2));
    console.log('Carritos guardados exitosamente');
  } catch (error) {
    console.error('Error al escribir en el archivo de carritos', error);
  }
};

// Crear el archivo de carrito.json si no existe
try {
  await fs.access(CARTS_FILE_PATH);
} catch (error) {
  await fs.writeFile(CARTS_FILE_PATH, '[]', 'utf8');
}

// Llamar a la función readCarts después de crear el archivo si no existe
await readCarts();

const router = express.Router();

// Variable para mantener el contador de IDs de carritos
let cartIdCounter = 1;

router.get('/', async (req, res) => {
  try {
    await readCarts(); // Leer los carritos desde el archivo

    res.json({ message: 'Lista de carritos obtenida exitosamente', carts: carts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la lista de carritos' });
  }
});

// Ruta para crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    // Crear un nuevo carrito con un ID único y un array de productos aleatorios
    const newCart = {
      id: `${cartIdCounter++}`, // Autogenerar ID
      products: generateRandomProducts(), // Generar productos aleatorios
    };

    // Agregar el nuevo carrito al almacén
    carts.push(newCart);

    // Guardar los cambios en el archivo
    await writeCarts();

    res.json({ message: 'Nuevo carrito creado exitosamente', cart: newCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

// Función para generar productos aleatorios
const generateRandomProducts = () => {
  const numProducts = Math.floor(Math.random() * 5) + 1; // Generar entre 1 y 5 productos aleatorios
  const products = new Set();

  for (let i = 0; i < numProducts; i++) {
    let randomProductId;
    
    // Generar un nuevo ID único
    do {
      randomProductId = Math.floor(Math.random() * 1000) + 1;
    } while (products.has(randomProductId));

    const randomQuantity = Math.floor(Math.random() * 10) + 1; // Cantidad aleatoria

    // Agregar el producto al conjunto
    products.add(randomProductId);

    // Agregar el producto al array
    products.push({ id: `${randomProductId}`, quantity: randomQuantity });
  }

  return products;
};
;

// Ruta para listar los productos de un carrito específico
router.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid; // Obtener el ID del carrito desde los parámetros

    // Buscar el carrito por ID
    const cart = carts.find((c) => c.id === cartId);

    if (cart) {
      res.json({ message: 'Productos del carrito obtenidos exitosamente', products: cart.products });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos del carrito' });
  }
});

// Ruta para agregar un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid; // Obtener el ID del carrito desde los parámetros
    const productId = req.params.pid; // Obtener el ID del producto desde los parámetros

    // Buscar el carrito por ID
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.find((p) => p.id === productId);

    if (existingProduct) {
      // Si el producto ya existe, incrementar la cantidad
      existingProduct.quantity++;
    } else {
      // Si el producto no existe, agregarlo al carrito con cantidad 1
      cart.products.push({ id: productId, quantity: 1 });
    }

    // Guardar los cambios en el archivo
    await writeCarts();

    res.json({ message: 'Producto agregado al carrito exitosamente', cart: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  }
});

export default router;