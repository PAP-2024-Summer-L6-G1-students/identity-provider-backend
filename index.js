const cors = require('cors');
const express = require('express');
const { connectMongoose } = require('./connect');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

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