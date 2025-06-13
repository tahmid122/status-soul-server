require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const postsCollection = client.db("statusSoulDB").collection("posts");
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

    //posts
    //get posts
    app.get("/posts", async (req, res) => {
      try {
        const { email } = req.query;
        const result = await postsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    app.get("/user-posts", async (req, res) => {
      try {
        const { email } = req.query;
        const result = await postsCollection.find({ email }).toArray();
        res.send(result);
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    //create a new post
    app.post("/posts", async (req, res) => {
      const { email } = req.query;
      try {
        const newPost = req.body;
        const result = await postsCollection.insertOne(newPost);
        if (result.insertedId) {
          const result = await postsCollection.find({ email }).toArray();
          res.send(result);
        }
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    //delete posts
    app.delete("/posts", async (req, res) => {
      try {
        const id = req.query.id;
        const query = { _id: new ObjectId(id) };
        const result = await postsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send({ message: error.message });
      }
    });
    //update like
    app.patch("/posts/like", async (req, res) => {
      try {
        const { id, email } = req.query;
        const post = await postsCollection.findOne({ _id: new ObjectId(id) });
        const isLiked = post.likedBy.includes(email);
        const updateDoc = isLiked
          ? {
              $pull: { likedBy: email },
            }
          : {
              $push: { likedBy: email },
            };
        const result = await postsCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDoc
        );
        res.send({ liked: isLiked ? false : true });
      } catch (error) {}
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
