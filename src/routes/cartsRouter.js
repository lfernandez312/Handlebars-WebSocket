import express from 'express';
import fs from 'fs';

const CARTS_FILE_PATH = './carrito.json';
let carts = [];

// Función para leer los carritos desde el archivo
const readCarts = () => {
  try {
    const cartsData = fs.readFileSync(CARTS_FILE_PATH, 'utf8');
    carts = JSON.parse(cartsData);
  } catch (error) {
    carts = [];
  }
};

// Función para escribir los carritos en el archivo
const writeCarts = async () => {
  try {
    await fs.promises.writeFile(CARTS_FILE_PATH, JSON.stringify(carts, null, 2));
  } catch (error) {
    console.error('Error al escribir en el archivo de carritos', error);
  }
};

// Crear el archivo de carrito.json si no existe
fs.access(CARTS_FILE_PATH, fs.constants.F_OK, (err) => {
  if (err) {
    fs.writeFileSync(CARTS_FILE_PATH, '[]', 'utf8');
  } else {
    readCarts();
  }
});

const router = express.Router();

// Ruta para verificar si cartsRouter se está ejecutando
router.get('/', (req, res) => {
    res.json({ message: 'El archivo se está ejecutando correctamente' });
});


// Variable para mantener el contador de IDs de carritos
let cartIdCounter = 1;

// Ruta para crear un nuevo carrito
router.post('/', (req, res) => {
    try {
        // Crear un nuevo carrito con un ID único
        const newCart = {
            id: cartIdCounter++, // Autogenerar ID
            products: [], // Array para almacenar productos en el carrito
        };

        // Agregar el nuevo carrito al almacén
        carts.push(newCart);

        res.json({ message: 'Nuevo carrito creado exitosamente', cart: newCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// Ruta para listar los productos de un carrito específico
router.get('/:cid', (req, res) => {
    try {
        const cartId = Number(req.params.cid); // Convertir el ID del carrito a número

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
router.post('/:cid/product/:pid', (req, res) => {
    try {
        const cartId = Number(req.params.cid); // Convertir el ID del carrito a número
        const productId = Number(req.params.pid); // Convertir el ID del producto a número

        // Buscar el carrito por ID
        const cart = carts.find((c) => c.id === cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Verificar si el producto ya existe en el carrito
        const existingProduct = cart.products.find((p) => p.product === productId);

        if (existingProduct) {
            // Si el producto ya existe, incrementar la cantidad
            existingProduct.quantity++;
        } else {
            // Si el producto no existe, agregarlo al carrito con cantidad 1
            cart.products.push({ product: productId, quantity: 1 });
        }

        res.json({ message: 'Producto agregado al carrito exitosamente', cart: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});

export default router;
