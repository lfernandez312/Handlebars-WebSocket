// Importamos el módulo 'fs' para trabajar con el sistema de archivos
import { promises as fs } from 'fs';

// Definimos la clase ProductManager para gestionar productos
class ProductManager {
    // Constructor que inicializa propiedades de la clase
    constructor(filePath) {
        this.products = []; // Arreglo que almacenará los productos
        this.productIdCounter = 1; // Contador para asignar IDs a los productos
        this.path = filePath; // Ruta del archivo donde se guardarán los productos

        // Si se proporciona una ruta de archivo, intentamos cargar los productos desde ese archivo
        if (filePath) {
            this.loadFromFile();
        }
    }

    // Método para agregar un nuevo producto al arreglo y guardarlo en el archivo
    async addProduct(product) {
        product.id = this.productIdCounter++; // Asignamos un nuevo ID al producto
        this.products.push(product); // Agregamos el producto al arreglo
        await this.saveToFile(); // Guardamos los productos en el archivo
        console.log("Producto agregado:", product);
    }

    // Método para obtener la lista de productos
    async getProducts(limit) {
        await this.loadFromFile(); // Cargamos los productos desde el archivo
    
        if (limit) {
            // Si se proporciona un límite, devolvemos solo la cantidad especificada de productos
            return this.products.slice(0, limit);
        } else {
            // Si no se proporciona un límite, devolvemos todos los productos
            return this.products;
        }
    }

    // Método para obtener un producto por su ID
    async getProductById(id) {
        await this.loadFromFile(); // Cargamos los productos desde el archivo

        const product = this.products.find((product) => product.id === id); // Buscamos el producto por ID

        // Si encontramos el producto, lo devolvemos; de lo contrario, mostramos un mensaje de error
        if (product) {
            return product;
        } else {
            console.error("Producto no encontrado");
        }
    }

    // Método para actualizar un producto por su ID
    async updateProduct(id, updatedProduct) {
        await this.loadFromFile(); // Cargamos los productos desde el archivo

        const index = this.products.findIndex((product) => product.id === id); // Buscamos el índice del producto por ID

        // Si encontramos el producto, actualizamos sus propiedades y guardamos los productos en el archivo
        if (index !== -1) {
            updatedProduct.id = id;
            this.products[index] = updatedProduct;
            await this.saveToFile();
            console.log("Producto actualizado:", updatedProduct);
        } else {
            console.error("Producto no encontrado");
        }
    }

    // Método para eliminar un producto por su ID
    async deleteProduct(id) {
        await this.loadFromFile(); // Cargamos los productos desde el archivo

        const index = this.products.findIndex((product) => product.id === id); // Buscamos el índice del producto por ID

        // Si encontramos el producto, lo eliminamos del arreglo y guardamos los productos en el archivo
        if (index !== -1) {
            const deletedProduct = this.products.splice(index, 1)[0];
            await this.saveToFile();
            console.log("Producto eliminado:", deletedProduct);
        } else {
            console.error("Producto no encontrado");
        }
    }

    // Método para guardar los productos en el archivo
    async saveToFile() {
        try {
            const data = JSON.stringify(this.products, null, 2); // Convertimos los productos a formato JSON
            await fs.writeFile(this.path, data); // Escribimos los productos en el archivo
            console.log(`Productos guardados en ${this.path}`);
        } catch (error) {
            console.error(`Error al guardar productos en el archivo: ${error.message}`);
        }
    }

    // Método para cargar los productos desde el archivo
    async loadFromFile() {
        try {
            const data = await fs.readFile(this.path, 'utf8'); // Leemos los datos del archivo

            // Verificamos si el archivo está vacío o no existe
            if (data.trim() === '') {
                console.log(`El archivo ${this.path} está vacío. Inicializando con un arreglo vacío...`);
                this.products = [];
            } else {
                // Convertimos los datos JSON a objetos
                this.products = JSON.parse(data);
                console.log(`Productos cargados desde ${this.path}`);
            }
        } catch (error) {
            // Manejamos el caso en que el archivo no exista
            if (error.code === 'ENOENT') {
                console.log(`El archivo ${this.path} no existe. Creando un archivo vacío...`);
                await this.saveToFile(); // Creamos un archivo vacío si no existe
            } else {
                console.error(`Error al cargar productos desde el archivo: ${error.message}`);
            }
        }
    }
}

export default ProductManager;

// Crear una instancia de la clase ProductManager con el nombre del archivo
const productManager = new ProductManager('productos.json');

// Función para inicializar 12 productos de ejemplo
async function initializeProducts() {
    for (let i = 0; i <= 15; i++) {
        await productManager.addProduct({
            title: `Producto ${i}`,
            description: `Descripción del Producto ${i}`,
            price: 500 + i,
            thumbnail: `ruta/imagen/producto_${i}.jpg`,
            code: `code${i}`,
            stock: 100 - i,
        });
    }
}

// Ejecutar la función de inicialización y luego las operaciones de ejemplo
(async () => {
    await initializeProducts();
})();