const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');

const server = jsonServer.create();
const router = jsonServer.router('./data/database.json');
const userDb = JSON.parse(fs.readFileSync('./data/users.json', 'UTF-8'));

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = '123456789';
const expiresIn = '12h';

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, {expiresIn})
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database and return it
function isAuthenticated({email, password}) {
  return userDb.users.find(user => user.email === email && user.password === password);
}

// Register New User
server.post('/auth/register', (req, res) => {
  const {email, password} = req.body;
  const user = isAuthenticated({email, password});

  if(user) {
    const status = 401;
    const message = 'Email and Password already exist';
    res.status(status).json({status, message});
    return
  }

  fs.readFile("./data/users.json", (err, content) => {

    if(err) {
      const status = 401;
      const message = err;
      res.status(status).json({status, message});
      return
    }

    // Get current users data
    const data = JSON.parse(content.toString());
    const last_item_id = data.users[data.users.length - 1].id;
    const newUser = {id: last_item_id + 1, email: email, password: password};
    const access_token = createToken({email, password});

    data.users.push(newUser); //add some data

    fs.writeFile("./data/users.json", JSON.stringify(data), (err, result) => {
      if(err) {
        const status = 401;
        const message = err;
        res.status(status).json({status, message});
      } else {
        res.status(200).json({id: newUser.id, email: newUser.email, access_token})
      }
    });
  });

});

// Login to one of the users from ./users.json
server.post('/auth/login', (req, res) => {
  const {email, password} = req.body;
  const user = isAuthenticated({email, password});

  if(!user) {
    const status = 401;
    const message = 'Incorrect email or password';

    res.status(status).json({status, message});
  } else {
    const access_token = createToken({email, password});
    res.status(200).json({id: user.id, email: user.email, access_token})
  }
});

//todo: UNCOMMENT TO ENABLE AUTH ROUTES

// server.use(/^(?!\/auth).*$/, (req, res, next) => {
//   if(req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
//     const status = 401;
//     const message = 'Error in authorization format';
//     res.status(status).json({status, message});
//     return
//   }
//   try {
//     let verifyTokenResult;
//     verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);
//
//     if(verifyTokenResult instanceof Error) {
//       const status = 401;
//       const message = 'Access token not provided';
//       res.status(status).json({status, message});
//       return
//     }
//     next()
//   } catch (err) {
//     const status = 401;
//     const message = 'Error access_token is revoked';
//     res.status(status).json({status, message})
//   }
// });

server.use(router);

server.listen(8000, () => {
  console.log('API Server up and running on port: 8000')
});
