const express = require("express");
const { MongoClient } = require("mongodb");

const connectionString =
  process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27018";

async function init() {
  const client = new MongoClient(connectionString, {
    useUnifiedTopology: true,
  });
  try {
  await client.connect();
  databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (e) {
    console.error(e);
  }
  const app = express();

  app.get("/get", async (req, res) => {
    const db = client.db("adoption")
    const collection = db.collection("pets");

    const pets = await collection
      .find(
        {
          $text: { $search: req.query.search },
        },
        { _id: 0 }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .toArray();

    res.json({ status: "ok", pets }).end();
  });

  const PORT = process.env.PORT || 3000;
  app.use(express.static("./static"));
  app.listen(PORT);

  console.log(`running on http://localhost:${PORT}`);
}
init();