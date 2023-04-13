const Order = require('../../../models/order');

function orderConfirmedController(req, res) {
  return {
    confirm(req, res, next) {
      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone: req.session.phone,
        address: req.session.address,
        paymentStatus: true,
      });
      order
        .save()
        .then(result => {
          Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
            delete req.session.cart;
            req.flash(
              'success',
              'Payment successful, Order placed successfully.'
            );
            const eventEmitter = req.app.get('eventEmitter');
            eventEmitter.emit('orderPlaced', result);
            return res.redirect('/customer/orders');
          });
        })
        .catch(err => {
          res.flash('error', 'Something went wrong.');
          return res.redirect('/cart');
        });
    },
  };
}

module.exports = orderConfirmedController;
