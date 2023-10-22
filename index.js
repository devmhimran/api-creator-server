const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
var cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const newsCollection = client.db("api-creation").collection("news-api");

    const pcProductCollection = client
      .db("api-creation")
      .collection("pc-product");
    const pizzaliciousCollection = client
      .db("api-creation")
      .collection("pizzalicious");

    const todoCollection = client.db("todo-drag-and-drop").collection("todo");

    const todoSerialCollection = client
      .db("todo-drag-and-drop")
      .collection("serial");

    const usersCollection = client.db("api-creation").collection("users");

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

    // user authentication system start

    // Register a new user with password encryption
    app.post("/register", async (req, res) => {
      try {
        const userData = req.body;

        // Validate and sanitize user input here before proceeding
        // For example, check if the email or username already exists in your database

        // Hash the user's password securely before storing it
        const saltRounds = 10; // The number of salt rounds for hashing
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        // console.log(registerData, hashedPassword);
        // Replace the plain password with the hashed password

        const registerData = {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        };

        // Insert the user data into the database
        const result = await usersCollection.insertOne(registerData);

        // Respond with a success message
        res.send({ message: "User registered successfully", result: result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error registering user" });
      }
    });

    // User login and password decryption
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        // Find the user by their username
        const user = await usersCollection.findOne({ email });

        // Check if the user exists
        if (!user) {
          return res
            .status(401)
            .send({ message: "Invalid username or password" });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res
            .status(401)
            .send({ message: "Invalid username or password" });
        }

        // Create a JWT token containing the user's ID
        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN, {
          expiresIn: "2h", // Set the token expiration time as needed
        });

        // Respond with the token
        res.json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error logging in" });
      }
    });

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        // Find the user by their username
        const user = await usersCollection.findOne({ email });
        console.log(user, "user");

        // Check if the user exists
        if (!user) {
          return res
            .status(401)
            .send({ message: "Invalid username or password" });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res
            .status(401)
            .send({ message: "Invalid username or password" });
        }

        // Do not create a JWT token; instead, you can return a success message
        res.send({ message: "Login successful" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error logging in" });
      }
    });

    // Protected route to get user data using verifyJWT
    app.get("/user", verifyJWT, async (req, res) => {
      try {
        // User data can be obtained from the decoded JWT token
        // req.decoded.userId contains the user's ID
        const userId = req.decoded.userId;

        // Find the user by their ID
        const user = await usersCollection.findOne({ _id: ObjectId(userId) });

        // Respond with the user data
        res.json(user);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error fetching user data" });
      }
    });

    app.get("/auth/news-data", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = newsCollection.find(query);
      const data = await cursor.toArray();
      res.send(data);
    });

    // user authentication system end
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
