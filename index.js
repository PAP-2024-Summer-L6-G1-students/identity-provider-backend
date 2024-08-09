const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');
const Users = require('./models/Users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Read all
app.get('/', async (req, res) => {
  const results = await Users.readAll();
  res.send(results);
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