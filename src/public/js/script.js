

const socket = io(); // Conecta al servidor de sockets

// Escucha eventos de actualización de productos
socket.on('updateProducts', (products) => {
    updateProductList(products);
});

// Maneja el envío del formulario para agregar nuevos productos
document.getElementById('productForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;

    // Emite el evento para agregar un nuevo producto
    socket.emit('addProduct', { name: productName, price: parseFloat(productPrice) });

    // Limpia el formulario
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
});

// Función para actualizar la lista de productos en la vista
function updateProductList(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpia la lista actual

    // Verifica si products es un array antes de usar forEach
    if (Array.isArray(products)) {
        // Agrega los nuevos productos
        products.forEach(product => {
            const listItem = document.createElement('li');
            listItem.textContent = `${product.name} - Price: $${product.price}`;
            productList.appendChild(listItem);
        });
    } else {
        console.error('Error: products no es un array', products);
    }
}
