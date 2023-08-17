const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products)
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  User.findById(req.user._id)
    .populate('cart.items.productId')
    .exec()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    console.log(result);
    res.redirect('/cart');
  })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
      console.log('Deleted cart item')
    })
    .catch(err => console.log(err));
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.items.productId');

    const products = user.cart.items.map(item => {
      return { quantity: item.quantity, productData: item.productId };
    });

    const order = new Order({
      user: {
        name: user.name,
        userId: user._id
      },
      products: products
    });

    await order.save();
    user.cart.items = [];
    await user.save();

    res.redirect('/orders');
  } catch (err) {
    console.log(err);
    next(err); 
  }
};


exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
