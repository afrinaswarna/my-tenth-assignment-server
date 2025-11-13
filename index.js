const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const reviewCollection = db.collection("reviews");

    app.get("/properties", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {};

        if (email) {
          query.email = email; //
        }

        const cursor = propertyCollection.find(query).sort({ posted_date: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send({ message: "Server error" });
      }
    });
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    });

    app.get("/latest-properties", async (req, res) => {
      const cursor = propertyCollection
        .find()
        .sort({ posted_date: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/properties/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            property_name: updatedData.property_name,
            short_description: updatedData.short_description,
            category: updatedData.category,
            property_price: updatedData.property_price,
            location: updatedData.location,
            image_link: updatedData.image_link,
          },
        };

        const result = await propertyCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.post("/properties", async (req, res) => {
      const newProperty = req.body;
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(query);
      res.send(result);
    });

    // review related apis


    app.get("/user-reviews", async (req, res) => {
      try {
        const userEmail = req.query.email;
        

        if (!userEmail) {
          return res.status(400).send({ message: "User email is required." });
        }

        const query = { reviewer_email: userEmail };

        const cursor = reviewCollection.find(query).sort({ review_date: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).send({ message: "Failed to fetch user reviews" });
      }
    });
    app.post("/reviews", async (req, res) => {
      try {
        const newReview = req.body;
        newReview.review_date = new Date().toISOString();

        const result = await reviewCollection.insertOne(newReview);
        res.send(result);
      } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).send({ message: "Failed to submit review" });
      }
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
