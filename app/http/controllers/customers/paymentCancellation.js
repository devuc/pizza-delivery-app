function paymentCancellationController(req, res) {
  return {
    index(req, res, next) {
      const eventEmitter = req.app.get('eventEmitter');
      eventEmitter.emit('paymentCancelled');
      return res.redirect('/cart');
    },
  };
}

module.exports = paymentCancellationController;
