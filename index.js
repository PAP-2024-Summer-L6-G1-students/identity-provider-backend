const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Users = require('./models/Users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

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
  res.json({"TESTING": "HELP"});
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
    const results = await Users.readOne(req.params.userName);
    res.send(results);
    console.log(results);
    console.log(`GET request received on ${req.body.params} page`);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'An error occurred while finding user' });
  }
});

// Login route
/*
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  user = Users.readOne(username);
  // Validate user credentials (replace with your own validation logic)
  if (username === user.userName && password === user.password) {
    // Create a JWT
    const token = jwt.sign({ user.userName }, SECRET_KEY, { expiresIn: '7h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});
*/

// Update route to update an existing message
app.patch('/:user', async (req, res) => {
  try {
    const { field, fieldUpdate } = req.body;

    // Validate required fields
    if (!field || fieldUpdate === undefined) {
      return res.status(400).json({ error: 'field and fieldUpdate are required' });
    }
    if (field === "interests" || "avaliability") {
      if (!Array.isArray(fieldUpdate)) {
        return res.status(400).json({ error: 'array field required' });
      }
    }
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

// Post route to post a new message
app.post('/create', async (req, res) => {
  try {
    let { user, password, email } = req.body;
    if (!password || email === undefined) {
      return res.status(400).json({ error: 'password and email are required' });
    }
    //hash password with salt
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      await Users.createUser(user, email, hash);
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
    if (!await Users.readOne( userName )) {
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
    app.listen(port, () => console.log(`Server running on port ${port}...`));
  }
  catch (err) {
    console.error(err);
  }
}

start();