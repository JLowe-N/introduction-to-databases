const express = require("express");
const { Pool } = require("pg"); // Pool of connections

const pool = new Pool({
  connectionString:
    "postgresql://postgres:mysecretpassword@localhost:5432/message_boards",
});
// typically would use secret manager like keyvault for this connection string!

async function init() {
  const app = express();

  app.get("/get", async (req, res) => {
    const client = await pool.connect();
    const [commentRes, boardRes] = await Promise.all([
      client.query(
        "SELECT * FROM comments NATURAL LEFT JOIN rich_content WHERE board_id = $1",
        [req.query.search]
      ),
      client.query("SELECT * FROM boards WHERE board_id = $1", [
        req.query.search,
      ]),
    ]);

    res.json({
      status: "ok",
      board: boardRes.rows[0] || {},
      posts: commentRes.rows,
    });
  });

  const PORT = 3000;
  app.use(express.static("./static"));
  app.listen(PORT);
  console.log(`running on http://localhost:${PORT}`);
}

init();
