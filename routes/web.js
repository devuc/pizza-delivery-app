const homeController = require('../app/http/controllers/homeController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const guest = require('../app/http/middleware/guest');
const orderController = require('../app/http/controllers/customers/orderController');
const AdminOrderController = require('../app/http/controllers/admin/orderController');
const auth = require('../app/http/middleware/auth');
const admin = require('../app/http/middleware/admin');
const statusController = require('../app/http/controllers/admin/statusController');
const orderConfirmedController = require('../app/http/controllers/customers/orderConfirmedController');
const paymentCancellationController = require('../app/http/controllers/customers/paymentCancellation');
function initRoutes(app) {
  app.get('/', homeController().index);
  app.get('/login', authController().login);
  app.post('/login', authController().postLogin);
  app.post('/logout', authController().logout);
  app.get('/register', guest, authController().register);
  app.post('/register', authController().postRegister);
  app.get('/cart', cartController().index);
  app.post('/update-cart', cartController().update);
  app.post('/orders', auth, orderController().store);
  app.get('/order-confirmation', auth, orderConfirmedController().confirm);
  app.get('/payment-cancellation', auth, paymentCancellationController().index);
  app.get('/customer/orders', auth, orderController().index);
  app.get('/customer/orders/:id', auth, orderController().show);
  app.get('/admin/orders', admin, AdminOrderController().index);
  app.post('/admin/order/status', admin, statusController().update);
}

module.exports = initRoutes;
