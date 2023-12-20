const { Router } = require('express');
const router = Router();
const productController = require('./product.controller'); // Asegúrate de tener tu controlador de productos

router.get('/home', async (req, res) => {
  try {
      const productList = await productController.getAllProducts();
      console.log('Lista de productos obtenida:', productList);

      res.render('home.handlebars', {productList, style: 'style2.css' });
  } catch (error) {
      console.error('Error al obtener la lista de productos', error);
      res.status(500).send('Error interno del servidor');
  }
});


router.get('/realtimeproducts', (req, res) => {
  const productList = productController.getAllProducts();
  res.render('realTimeProducts.handlebars', { products: productList,style: 'style.css'});
});

router.get('/users', (req, res) => {
  const users = { name:'Leonel',  title: 'Mi Página', body: '¡Hola, Handlebars!' ,role : 'admin' }
  res.render('usuario.handlebars',{users,isAdmin: users.role === 'admin',style: 'style2.css'});
});

router.get('/lista', (req, res) => {
  const users = { name:'Leonel',  title: 'Mi Página', body: '¡Hola, Handlebars!' ,role : 'admin' }
  const lista = [ { id:1 , name: 'PS5', price: 500 },{ id:2 , name: 'XBOX', price: 400 }];
  res.render('lista.handlebars',{lista,users,isAdmin: users.role === 'admin',style: 'style.css'});
});

router.get('/register', (req, res) => {
  res.render('register.handlebars');
});

const usersArray = [];

router.post('/user', (req, res) => {
  if(usersArray){
    // Obtén los datos del formulario desde el cuerpo de la solicitud
    const { name, email, password } = req.body;
    // Crear un nuevo usuario
    const newUser = { name, email, password };
    // Agregar el nuevo usuario al arreglo
    usersArray.push(newUser);
    // Muestra los valores en la respuesta
    res.json({ users: usersArray });
  }
});
module.exports = router;
