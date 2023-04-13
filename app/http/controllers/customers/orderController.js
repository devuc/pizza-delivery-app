const moment = require('moment');
const Order = require('../../../models/order');
const stripe = require('stripe')(
  'sk_test_51MmywXSCUAtU98NVwhqxZW42z4mlV5jIVWeAN6M5d2kF6UJ1ZTin8GPymnNzVPE6D1Zl1kbGqnYNwN6vwKuseho800G9SvooRk'
);

function orderController() {
  return {
    store(req, res) {
      const { phone, address, paymentType } = req.body;
      req.session.phone = phone;
      req.session.address = address;
      if (!phone || !address) {
        req.flash('error', 'All fields are required');
        return res.redirect('/cart');
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
      });
      const checkoutLogic = async () => {
        if (paymentType === 'card') {
          const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price_data: {
                  currency: 'inr',
                  unit_amount: req.session.cart.totalPrice * 100,
                  product_data: {
                    description: 'Pizza Order : ' + req.user._id,
                    name: 'Pizza Order Amount',
                  },
                },
                quantity: 1,
              },
            ],

            mode: 'payment',

            success_url: `https://pizzetti.onrender.com/order-confirmation`,
            cancel_url: `https://pizzetti.onrender.com/payment-cancellation`,
          });
          return res.redirect(303, session.url);
        } else {
          order
            .save()
            .then(result => {
              Order.populate(
                result,
                { path: 'customerId' },
                (err, placedOrder) => {
                  delete req.session.cart;
                  req.flash('success', 'Order placed successfully.');
                  const eventEmitter = req.app.get('eventEmitter');
                  eventEmitter.emit('orderPlaced', result);
                  return res.redirect('/customer/orders');
                }
              );
            })
            .catch(err => {
              res.flash('error', 'Something went wrong.');
              return res.redirect('/cart');
            });
        }
      };
      checkoutLogic();
    },

    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header('Cache-Control', 'no-store');

      res.render('customers/orders', { orders: orders, moment: moment });
    },
    async show(req, res) {
      const order = await Order.findById(req.params.id);
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render('customers/singleOrder.ejs', {
          order,
        });
      } else {
        return res.redirect('/');
      }
    },
  };
}

module.exports = orderController;
