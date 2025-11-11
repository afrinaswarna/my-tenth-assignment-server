const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.PROPERTY_USER}:${process.env.PROPERTY_PASS}@cluster0.52cv5mu.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", (req, res) => {
  res.send("smart server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("property_db");
    const propertyCollection = db.collection("properties");

    app.get("/properties", async (req, res) => {
      const cursor = propertyCollection.find().sort({posted_date:-1});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/latest-properties',async(req,res)=>{
      const cursor = propertyCollection.find().sort({posted_date:-1}).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })
    
    app.post("/properties", async (req, res) => {
      const newProperty = req.body;
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart server is running on port :${port}`);
});
