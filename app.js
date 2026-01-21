require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const MONGO_URL = process.env.MONGO_URI;
const DB_NAME = "shop";
const COLLECTION_NAME = "products";

let products;

MongoClient.connect(MONGO_URL)
  .then((client) => {
    const db = client.db(DB_NAME);
    products = db.collection(COLLECTION_NAME);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.json({ message: "Practice Task 11 API is running" });
});

app.get("/api/products", async (req, res) => {
  const list = await products.find({}).toArray();
  res.json({ count: list.length, products: list });
});

app.get("/api/products/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const product = await products.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

app.post("/api/products", async (req, res) => {
  const { name, price, category } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const result = await products.insertOne({ name, price, category });
  res.status(201).json({ _id: result.insertedId, name, price, category });
});

app.put("/api/products/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  await products.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );

  res.json({ message: "Product updated" });
});

app.delete("/api/products/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  await products.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: "Product deleted" });
});
