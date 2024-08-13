const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const Users = require('./models/Users');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/TEST', async (req, res) => {
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

// Read one
app.get('/:userName', async (req, res) => {
  const results = await Users.readOne(req.params.userName);
  res.send(results);
  console.log(results);
  console.log("GET request received on home page");
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