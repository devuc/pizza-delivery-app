import axios from 'axios';
import moment from 'moment';
import Noty from 'noty';
import { initAdmin } from './admin';

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter');
// const io = require('socket.io');

function updateCart(pizza) {
  axios
    .post('/update-cart', pizza)
    .then(res => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Item added to cart',
        progressBar: false,
      }).show();
    })
    .catch(err => {
      new Noty({
        type: 'error',
        timeout: 1000,
        text: 'Something went wrong',
        progressBar: false,
      }).show();
    });
}

addToCart.forEach(btn => {
  btn.addEventListener('click', e => {
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  });
});

//Remove alert message from cart
const alertMsg = document.querySelector('#success-alert');
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

let statuses = document.querySelectorAll('.status-line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order) {
  statuses.forEach(status => {
    status.classList.remove('step-completed');
    status.classList.remove('current-step');
  });
  let stepCompleted = true;
  statuses.forEach(status => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add('step-completed');
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format('hh:mm A');
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add('current-step');
      }
    }
  });
}

updateStatus(order);

let socket = io();
socket.on('connection', socket => {
  console.log('areeee');
});

if (order) {
  socket.emit('join', `order_${JSON.stringify(order._id)}`);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
  initAdmin(socket);
  socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', data => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  new Noty({
    type: 'success',
    timeout: 1000,
    text: 'Order Status Updated',
    progressBar: false,
  }).show();
  updateStatus(updatedOrder);
});
socket.on('orderPlaced', order => {
  console.log(order);
  new Noty({
    type: 'success',
    timeout: 1000,
    text: 'New order!',
    progressBar: false,
  }).show();
});
socket.on('paymentCancelled', () => {
  console.log('huhu');
  new Noty({
    type: 'success',
    timeout: 1000,
    text: 'New order!',
    progressBar: false,
  }).show();
});
