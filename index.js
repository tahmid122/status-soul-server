require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpgnftk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

//mongoDb Part
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    //Collections
    const usersCollection = client.db("statusSoulDB").collection("users");
    //All Requests
    //get a specific user
    app.get("/users", async (req, res) => {
      try {
        const { email } = req.query;
        const query = { email: email };
        const result = await usersCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    //create a new user
    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    app.put("/users", async (req, res) => {
      try {
        const { email } = req.query;
        const filter = { email: email };
        const updateDoc = { $set: req.body };
        const result = await usersCollection.updateOne(filter, updateDoc);
        if (result.modifiedCount) {
          const result = await usersCollection.findOne(filter);
          res.send(result);
        }
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    //All Requests
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
//mongoDb Part
//Default routes
app.get("/", (req, res) => {
  res.send("welcome to server...");
});
app.listen(port, () => {
  console.log(`Running at ${port}`);
});
