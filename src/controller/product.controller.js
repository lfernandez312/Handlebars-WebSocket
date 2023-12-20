const products = [];

function getAllProducts() {
    console.log('Obteniendo lista de productos');
    return products; // Asegúrate de que products sea un array
}

function addProduct(newProduct) {
    products.push(newProduct);
}

module.exports = {
    getAllProducts,
    addProduct
};