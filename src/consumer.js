// src/consumer.js
import axios from "axios";

// GET all
export async function listItems(baseUrl) {
    const res = await axios.get(`${baseUrl}/items`);
    return res.data;
}

// GET by id
export async function getItem(baseUrl, id) {
    const res = await axios.get(`${baseUrl}/items/${id}`);
    return res.data;
}

// POST create
export async function createItem(baseUrl, { name, price }) {
    const res = await axios.post(`${baseUrl}/items`, { name, price });
    return res.data;
}

// PUT replace
export async function replaceItem(baseUrl, id, { name, price }) {
    const res = await axios.put(`${baseUrl}/items/${id}`, { name, price });
    return res.data;
}

// PATCH update
export async function updateItem(baseUrl, id, patch) {
    const res = await axios.patch(`${baseUrl}/items/${id}`, patch);
    return res.data;
}

// DELETE
export async function deleteItem(baseUrl, id) {
    const res = await axios.delete(`${baseUrl}/items/${id}`);
    return res.status; // should be 204
}
