const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.4oearpf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
  
      const newsCollection = client.db('api-creation').collection('news-api');
      const pcProductCollection = client.db('api-creation').collection('pc-product');
      app.get('/news-data', async (req, res) =>{
        const query = {};
        const cursor = newsCollection.find(query);
        const data = await cursor.toArray();
        res.send(data);
      })
      app.get('/pc-product', async (req, res) =>{
        const query = {};
        const cursor = pcProductCollection.find(query);
        const data = await cursor.toArray();
        res.send(data);
      })
  
      app.post('/news-upload', (req, res) => {
        const addData = req.body;
        const result = newsCollection.insertOne(addData)
        res.send(result)
  
      })
    } finally {
      // await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Welcome to api creator')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
