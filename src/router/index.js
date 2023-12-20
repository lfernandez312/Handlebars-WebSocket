const templatesController = require ('../controller/template.controller');

const router = app => {
    app.use('/', templatesController)
}

module.exports = router;
