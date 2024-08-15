const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Users = require('./models/Users');
const SSOAPIKey = require('./models/SSOAPIKey.js');
const LoginAuthorization = require('./models/LoginAuthorization.js');
const {v4:uuidv4} = require("uuid");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;


app.use(cors({
  origin: ['https://localhost:5173', 'https://localhost:3003'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/sso/get-user-info', async (req, res) => {
  console.log("Cookies:", req.cookies);
});

app.get('/sso/get-api-info', async (req, res) => {
  // const token = req.cookies.token;
  // if (token) {
  //     jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
  //         if (err) {
  //           console.log("First error")
  //           return res.status(403).json([]); // Forbidden if token is invalid
  //         } else {
  //           const user = await Users.readOneByUUID(req.params.USER_UUID);
  //           if (user !== null && user.userName !== decoded.username) {
  //             console.log("Second error")
  //               return res.status(403).json([]); // Forbidden if user exists and token not provided
  //           }
  //         }
  //     });
  // }
  // else {
  //   console.log("Third error")
  //   return res.status(403).json([]); // Forbidden if user exists and token not provided
  // }
  const token = req.cookies.token;
  if (token) {
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
          if (err) {
            console.log("First error")
            return res.status(403).json([]); // Forbidden if token is invalid
          } else {
            const user = await Users.readOneByUUID(decoded.UUID);
            if (user === null) {
              console.log("user doesn't exist")
                return res.status(403).json([]); // Forbidden if user exists and token not provided
            } else {
              try {
                  console.log(decoded);
                  const apiKeyInfo = await SSOAPIKey.findOne({ 
                    userUUID: decoded.UUID });
                  if (!apiKeyInfo) {
                      return res.status(404).send('NO API KEY EXSISTS CURRENTLY TRY AGAIN');
                  }
                  res.json(apiKeyInfo);
              } catch (error) {
                  console.error('Error ERRORS ERRORS fetching API Key information:', error);
                  res.status(500).send('Internal Server Error');
              }
            }
          }
      });
  }
  else {
    console.log("Third error")
    return res.status(403).json([]); // Forbidden if user exists and token not provided
  }
});

// Reads all API keys
app.get('/sso/getAll', async (req, res) => {
  const results = await SSOAPIKey.find();
  res.json(results);
  console.log("GET request received on home page");
});


app.put('/sso/save-api-info/:USER_UUID', async (req, res) => {
  try {
      const updateData = {
          apiKey: req.body.apiKey,
          userUUID: req.params.USER_UUID,  
          websiteDomain: req.body.websiteDomain,
          afterSignupRedirectRoute: req.body.afterSignupRedirectRoute,
          afterLoginRedirectRoute: req.body.afterLoginRedirectRoute,
          websiteServerDomain: req.body.websiteServerDomain,
          requiresEmail: req.body.requiresEmail,
          requiresFirstName: req.body.requiresFirstName,
          requiresLastName: req.body.requiresLastName,
          requiresAddress: req.body.requiresAddress,
          requiresPhoneNumber: req.body.requiresPhoneNumber,
          requiresInterests: req.body.requiresInterests,
          requiresBirthdate: req.body.requiresBirthdate,
          requiresAvailability: req.body.requiresAvailability,
          requiresBio: req.body.requiresBio
      };

      const options = { new: true, upsert: true };

      const updatedApiKeyInfo = await SSOAPIKey.findOneAndUpdate(
          { userUUID: req.params.USER_UUID},
          updateData,
          options
      );

      res.json(updatedApiKeyInfo);
  } catch (error) {
      console.error('Error updating API Key information:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.get('/SSO/user', async (req, res) => {
  const { UUID } = req.query;

  if (!UUID) {
      return res.status(400).json({ message: 'UUID is required' });
  }

  try {
      const user = await Users.findOne({ UUID });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});


app.get('/TEST', async (req, res) => {
  const results = await Users.readAll();
  res.json({"TESTING": "HELP"});
  console.log("GET request received on home page");
});
// Reads information of all users
app.get('/', async (req, res) => {
  const results = await Users.readAll();
  res.json(results);
  console.log("GET request received on home page");
});

app.patch('/SSO/update', async (req, res) => {
  try {
      const { email, userName } = req.query;
      const { UUID, ...userData } = req.body;

      if (!email && !userName) {
          return res.status(400).json({ message: 'Either email or userName is required' });
      }

      if (!UUID) {
          return res.status(400).json({ message: 'UUID is required' });
      }

      let query = {};
      if (email) {
          query.email = email;
      } else if (userName) {
          query.userName = userName;
      }

      let user = await Users.findOne(query);

      if (user) {
          user.UUID = UUID;
          Object.assign(user, userData);
          await user.save();
          res.json({ message: 'User updated successfully', user });
      } else {
          const newUser = new Users({
              ...userData,
              UUID: UUID,
              email: email || userData.email,
              userName: userName || userData.userName,
          });
          await newUser.save();
          res.json({ message: 'New user created successfully', user: newUser });
      }
  } catch (error) {
      res.status(500).json({ message: 'ERROR ERROR TRY AGAIN', error });
  }
});


app.get('/HELP', async (req, res) => {
  const results = await Users.readAll();
  res.json({"TESTING": "HELP"});
  console.log("GET request received on home page");
});

app.get('/NO', async (req, res) => {
  const results = await Users.readAll();
  res.json({"TESTING": "Abdiwahid"});
  console.log("GET request received on home page");
});

// Reads information of specific user
app.get('/:userName', async (req, res) => {
  try {
    const results = await Users.readOneByName(req.params.userName);
    res.send(results);
    console.log(results);
    console.log(`GET request received on ${req.body.params} page`);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'An error occurred while finding user' });
  }
});

// Route - Relying party uses this to get info for a user
app.get('/SSO/get-user-info/:userName', async (req, res) => {
  try {
    const results = await Users.readOneByName(req.params.userName);
    res.send(results);
    console.log(results);
    console.log(`GET request received on ${req.body.params} page`);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'An error occurred while finding user' });
  }
});

// Login route
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   user = Users.readOne(username);
//   // Validate user credentials (replace with your own validation logic)
//   if (username === user.userName && password === user.password) {
//     // Create a JWT
//     const token = jwt.sign({ user.userName }, SECRET_KEY, { expiresIn: '7h' });
//     res.json({ token });
//   } else {
//     res.status(401).send('Invalid credentials');
//   }
// });

// Login Route
app.post('/login', async (req, res) => {
  console.log("POST request received on login route");
  const user = req.body;

  const existingUser = await Users.readOneByName(user.userName);
  if (existingUser !== null) {
      bcrypt.compare(user.password, existingUser.password, function(err, result) {
          if (!(err instanceof Error) && result) {
              console.log(user);
              const token = jwt.sign({ UUID: existingUser.UUID }, process.env.JWT_SECRET, { expiresIn: '7d' });
              res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'None',
                secure: true
              });

              return res.sendStatus(200);
          }
          else {
              return res.sendStatus(401);
          }
      });
  }
  else {
      return res.sendStatus(401);
  }
});

// ROUTE - AUTHORIZE SSO LOGIN
app.post('/SSO/authorizelogin', async (req, res) => {
  const authorizationCode = req.body.authorizationCode;
  const existingAuthorization = await LoginAuthorization.findOne({authorizationCode});

  console.log(existingAuthorization, req.body);
  if (existingAuthorization !== null && existingAuthorization.apiKey === req.body.apiKey) {
    // const token = jwt.sign({ userUUID: existingAuthorization.userUUID }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   sameSite: 'None',
    //   secure: true
    // });
    return res.status(200).json({userUUID: existingAuthorization.userUUID});
  }
  return res.sendStatus(404);
});

// ROUTE - SSO LOGIN
app.post('/SSO/login', async (req, res) => {
  console.log("POST request received on login route");
  const {user, websiteDomain} = req.body;
  const existingAPIKey = await SSOAPIKey.findOne({websiteDomain});

  let redirectRoute;
  if (existingAPIKey !== null) {
    redirectRoute = existingAPIKey.websiteDomain + existingAPIKey.afterLoginRedirectRoute;
  } else {
    return res.sendStatus(404);
  }

  const existingUser = await Users.readOneByName(user.userName);
  if (existingUser !== null) {
      bcrypt.compare(user.password, existingUser.password, async function(err, result) {
          if (!(err instanceof Error) && result) {
              const token = jwt.sign({ UUID: existingUser.UUID }, process.env.JWT_SECRET, { expiresIn: '7d' });
              res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'None',
                secure: true
              });
              const response = await LoginAuthorization.create({
                apiKey: existingAPIKey.apiKey,
                authorizationCode: uuidv4(),
                userUUID:existingUser.UUID});
                console.log(response);
              return res.status(200).json({redirect: redirectRoute, authorization: response.authorizationCode});
          }
          else {
            console.log(err);
            return res.sendStatus(401);
          }
      });
  }
  else {
    console.log(user);
    return res.sendStatus(401);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
  });
  res.sendStatus(200);
});

// ROUTE - SIGN UP
app.post('/signup', async (req, res) => {
  console.log("POST request received on signup route");
  const newUser = req.body;

  const existingUser = await Users.usernameExists(newUser.userName);
  if (!existingUser) {
      bcrypt.hash(newUser.password, 10, async function(err, hash) {
          if (!(err instanceof Error)) {
              newUser.password = hash;
              const results = await Users.createUser(newUser.userName, newUser.password);
              console.log(`New user created with id: ${results._id}`);

              const token = jwt.sign({ UUID: results.UUID }, process.env.JWT_SECRET, { expiresIn: '7d' });
              res.cookie('token', token, {
                  httpOnly: true,
                  sameSite: 'None',
                  secure: true
              });

              return res.status(201).json({
                  UUID: results.UUID 
              });
          }
          else {
              return res.sendStatus(500);
          }
      });
  }
  else {
      return res.sendStatus(400);
  }
});


// Update route to update an existing message
app.patch('/:user', async (req, res) => {
  try {
    const { field, fieldUpdate } = req.body;

    // Validate required fields
    if (!field || fieldUpdate === undefined) {
      return res.status(400).json({ error: 'field and fieldUpdate are required' });
    }
    // if (field === "interests" || "avaliability") {
    //   if (!Array.isArray(fieldUpdate)) {
    //     return res.status(400).json({ error: 'array field required' });
    //   }
    // }
    const result = await Users.update(req.params.user, field, fieldUpdate);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }
    res.status(200).json({ message: 'Update successful', result });
    console.log(`PATCH request received on ${req.params.user} route`);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user' });
  }
});

// Post route to post a new user
app.post('/create', async (req, res) => {
  try {
    let { user, password } = req.body;
    if (!password || email === undefined) {
      return res.status(400).json({ error: 'password and email are required' });
    }
    //hash password with salt
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (!(err instanceof Error)) {
        await Users.createUser(user, email, hash);
        const token = jwt.sign({ username: user.userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'None',
          secure: true
        });
      }
    });
    console.log(`User ${user} created`);
    res.sendStatus(201);

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while creating user' });
  }
});

// Delete route to delete an existing user
app.delete('/delete', async (req, res) => {
  try {
    const { userName } = req.body;
    if (!await Users.readOneByName( userName )) {
      return res.status(404).json({ error: 'User not found' });
    }
    const result = await Users.delete(userName);
    if (result.deletedCount === 0) {
      // Handle the case where the delete operation didn't actually remove any document
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    res.sendStatus(200);
    console.log(`User ${userName} deleted`);

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'An error occurred while deleting user' });
  }
});


//* ********************* Launching the server **************** */

const start = async () => {
  try {
    await connectMongoose();

    const httpsOptions = {
      key: fs.readFileSync(path.resolve(__dirname, '../localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../localhost.pem'))
    };

    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`Express API server running on https://localhost:${port}`);
    });
  }
  catch (err) {
    console.error(err);
  }
}

start();