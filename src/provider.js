// src/provider.js
import express from "express";

const app = express();
app.use(express.json());

// in-memory db
let ITEMS = [
    { id: 1, name: "Alpha", price: 10 },
    { id: 2, name: "Bravo", price: 20 },
];

function nextId() {
    return ITEMS.length ? Math.max(...ITEMS.map(i => i.id)) + 1 : 1;
}

// GET all
app.get("/items", (_req, res) => {
    res.json(ITEMS);
});

// GET by id
app.get("/items/:id", (req, res) => {
    const item = ITEMS.find(i => i.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: "not found" });
    res.json(item);
});

// POST create
app.post("/items", (req, res) => {
    const { name, price } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "name required" });
    const created = { id: nextId(), name, price: price ?? 0 };
    ITEMS.push(created);
    res.status(201).json(created);
});

// PUT replace
app.put("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const { name, price } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "name required" });
    const idx = ITEMS.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: "not found" });
    ITEMS[idx] = { id, name, price: price ?? 0 };
    res.json(ITEMS[idx]);
});

// PATCH partial update
app.patch("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = ITEMS.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: "not found" });
    const { name, price } = req.body ?? {};
    if (name != null) item.name = name;
    if (price != null) item.price = price;
    res.json(item);
});

// DELETE
app.delete("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const exists = ITEMS.some(i => i.id === id);
    if (!exists) return res.status(404).json({ error: "not found" });
    ITEMS = ITEMS.filter(i => i.id !== id);
    res.status(204).send();
});

// export for tests
export function resetData() {
    ITEMS = [
        { id: 1, name: "Alpha", price: 10 },
        { id: 2, name: "Bravo", price: 20 },
    ];
}

export default app;

// optional: run as server
if (process.env.RUN_SERVER) {
    app.listen(3000, () => console.log("Provider on http://localhost:3000"));
}
