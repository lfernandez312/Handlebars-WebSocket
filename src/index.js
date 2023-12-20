const express = require('express');
const fs = require('fs');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const { port } = require('./config/server.config');
const router = require('./router');
const { Server } = require('socket.io');
const productController = require('./controller/product.controller');

const app = express();
//ruta raiz
app.get('/', (req, res) => {
  res.send('<h1>Haz clic para ir al destino necesario</h1><input type="button" onclick="window.location.href=\'/register\';" value="Registrar" /><input type="button" onclick="window.location.href=\'/lista\';" value="Listausers" /><input type="button" onclick="window.location.href=\'/users\';" value="Usuarios" /><input type="button" onclick="window.location.href=\'/realtimeproducts\';" value="Real Time Products" /><input type="button" onclick="window.location.href=\'/home\';" value="Home Products" />');
});

// Configura el middleware body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Agrego este enrutador para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

router(app);

const hbs = exphbs.create({});
app.engine('handlebars', hbs.engine);
app.set('views', path.join(process.cwd(), 'views'));
//app.set('view engine', 'handlebars') //SE DEFINE PARA NO TENER QUE PONER ES RES.RENDER EL ARTICULO.HANDLEBARS

const httpServer = app.listen(port, () => console.log(`HTTP Puerto ${port}`));//Solo server HTTPS
const io = new Server(httpServer);
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`Usuario ${socket.id} conectado`);

  // Manejar la adición de un nuevo producto
  socket.on('addProduct', (newProduct) => {
    // Lógica para agregar el nuevo producto
    productController.addProduct(newProduct);

    // Emitir evento de actualización a todos los clientes conectados
    io.emit('updateProducts', productController.getAllProducts());

  });

  // Manejar desconexiones de sockets
  socket.on('disconnect', () => {
    console.log(`Usuario ${socket.id} desconectado`);
  });

  app.post('/socket', (req, res) => {
    // Lógica para manejar la solicitud POST...
    // Accede al objeto 'io' desde la aplicación
    const io = req.app.get('socketio');
    // Realiza un 'emit' a todos los clientes conectados
    if (io) {
      io.emit('eventoPersonalizado', { mensaje: '¡Hola desde el servidor!' });
    } else {
      res.status(500).json({ mensaje: 'Error en el servidor: objeto io no definido' });
    }
  });

});