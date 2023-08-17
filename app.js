const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findUserById("64dc8812e7dd13ffeaa10292")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
.connect('mongodb+srv://kiranagiwale123:WoL69WM4r3igFNyF@cluster0.6k3nc2k.mongodb.net/shop?retryWrites=true&w=majority')
.then((result) => {
  User.findOne().then(user => {
    if(!user) {
      const user = new User({
        name: 'Kiran',
        cart: {
          items: []
        }
      });
      user.save();
    }
  })
  app.listen(3000);
}).catch(err => {
  console.log(err)
})
