// CommonJS to avoid ESM headaches in tests
const express = require("express");
const app = express();
app.use(express.json());

// in-memory data
let USERS = [{ id: 1, name: "Alice" }];

app.get("/users", (_req, res) => res.json(USERS));

app.post("/users", (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  if (USERS.find(u => u.name === name)) return res.status(409).json({ error: "user exists" });
  const id = Math.max(...USERS.map(u => u.id)) + 1;
  const created = { id, name };
  USERS.push(created);
  res.status(201).json(created);
});

function resetData() { USERS = [{ id: 1, name: "Alice" }]; }

module.exports = { default: app, resetData };

// optional manual run: RUN_SERVER=1 node src/provider.js
if (process.env.RUN_SERVER) {
  app.listen(3000, () => console.log("Provider on http://localhost:3000"));
}
