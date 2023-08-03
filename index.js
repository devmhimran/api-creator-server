const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.4oearpf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const newsCollection = client.db("api-creation").collection("news-api");

    const pcProductCollection = client
      .db("api-creation")
      .collection("pc-product");
    const pizzaliciousCollection = client;

    const todoCollection = client.db("todo-drag-and-drop").collection("todo");

    const todoSerialCollection = client
      .db("todo-drag-and-drop")
      .collection("serial");

    // GET ALL NEWS DATA
    app.get("/news-data", async (req, res) => {
      const query = {};
      const cursor = newsCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    // GET ALL PIZZA DATA
    app.get("/pizzalicious/pizzalicious-data", async (req, res) => {
      const query = {};
      const cursor = pizzaliciousCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    // GET SINGLE PIZZA DATA
    app.get("/pizzalicious/pizzalicious/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await pizzaliciousCollection.findOne(query);
      res.send(result);
    });

    app.get("/news-data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await newsCollection.findOne(query);
      res.send(result);
    });

    // GET ALL PC PRODUCT DATA
    app.get("/pc-product", async (req, res) => {
      const query = {};
      const cursor = pcProductCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    // UPLOAD NEWS DATA
    app.post("/news-upload", (req, res) => {
      const addData = req.body;
      const result = newsCollection.insertOne(addData);
      res.send(result);
    });

    //GET ALL TODO DATA
    app.get("/pc-product", async (req, res) => {
      const query = {};
      const cursor = pcProductCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });
    app.get("/todo", async (req, res) => {
      const query = {};
      const cursor = todoCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    //POST TODO DATA
    app.post("/todo-add", async (req, res) => {
      const addData = req.body;
      const result = await todoCollection.insertOne(addData);
      res.send(result);
    });

    //DELETE TODO DATA
    app.delete("/delete-todo/:id", async (req, res) => {
      const id = req.params.id;
      const result = await todoCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to api creator");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
