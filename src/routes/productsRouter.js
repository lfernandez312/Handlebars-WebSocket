// productsRouter.js
import express from 'express';
import fs from 'fs/promises';
const router = express.Router();

const PRODUCTS_FILE_PATH = 'productos.json';

// Función para leer los productos desde el archivo
const readProducts = async () => {
    try {
        // Verificar si el archivo existe, si no, crearlo con un array vacío
        await fs.access(PRODUCTS_FILE_PATH);
    } catch (error) {
        await writeProducts([]);
    }

    try {
        const data = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo de productos:', error);
        throw error;
    }
};

// Función para escribir los productos en el archivo
const writeProducts = async (products) => {
    try {
        await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error al escribir en el archivo de productos:', error);
        throw error;
    }
};

// Ruta raíz para obtener todos los productos con posible limitación
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ?? 10; // Utilizamos el operador de fusión nula
        const products = await readProducts();

        // Lógica para limitar la cantidad de productos
        const limitedProducts = products.slice(0, limit);

        res.json({ message: 'Lista de productos obtenida exitosamente', productos: limitedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la lista de productos' });
    }
});


// Ruta para obtener un producto por su ID
router.get('/:pid', async (req, res) => {
    const productId = Number(req.params.pid); // Convertir el ID a número

    try {
        const products = await readProducts();
        const product = products.find((p) => p.id === productId);

        if (product) {
            res.json({ message: 'Producto obtenido exitosamente', producto: product });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

let productIdCounter = 1; // Inicializamos el contador de IDs

// Ruta para agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];

        // Verificar que todos los campos obligatorios estén presentes
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Campos obligatorios faltantes: ${missingFields.join(', ')}` });
        }

        const products = await readProducts();

        // Verificar que el nuevo ID no esté en uso
        let isIdInUse = products.some((product) => product.id === productIdCounter);
        while (isIdInUse) {
            productIdCounter++;
            isIdInUse = products.some((product) => product.id === productIdCounter);
        }

        const newProduct = {
            id: productIdCounter++,
            title: req.body.title,
            description: req.body.description,
            code: req.body.code,
            price: req.body.price,
            status: req.body.status !== undefined ? req.body.status : true,
            stock: req.body.stock,
            category: req.body.category,
            thumbnails: req.body.thumbnails || [],
        };

        if (isIdInUse) {
            return res.status(400).json({ error: 'ID repetido. Se ha asignado un nuevo ID automáticamente.' });
        } else {
            products.push(newProduct);
            await writeProducts(products);
            return res.json({ message: 'Producto agregado exitosamente', producto: newProduct });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al agregar el producto' });
    }
});


// Ruta para actualizar un producto por su ID
router.put('/:pid', async (req, res) => {
    const productId = Number(req.params.pid); // Convertir el ID a número

    try {
        const products = await readProducts();
        const index = products.findIndex((p) => p.id === productId);

        if (index !== -1) {
            // No actualizar ni eliminar el ID
            const updatedProduct = {
                id: products[index].id,
                title: req.body.title || products[index].title,
                description: req.body.description || products[index].description,
                code: req.body.code || products[index].code,
                price: req.body.price || products[index].price,
                status: req.body.status !== undefined ? req.body.status : products[index].status,
                stock: req.body.stock || products[index].stock,
                category: req.body.category || products[index].category,
                thumbnails: req.body.thumbnails || products[index].thumbnails,
            };

            products[index] = updatedProduct;
            await writeProducts(products);

            res.json({ message: 'Producto actualizado exitosamente', producto: updatedProduct });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Ruta para eliminar un producto por su ID
router.delete('/:pid', async (req, res) => {
    const productId = Number(req.params.pid); // Convertir el ID a número

    try {
        const products = await readProducts();
        const filteredProducts = products.filter((p) => p.id !== productId);

        console.log('Productos antes de la eliminación:', products);

        if (filteredProducts.length < products.length) {
            await writeProducts(filteredProducts);
            console.log('Productos después de la eliminación:', filteredProducts);
            res.json({ message: 'Producto eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;
