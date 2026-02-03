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

// GET user by ID
export async function getUserById(baseUrl, userId) {
    try {
        const res = await axios.get(`${baseUrl}/users/${userId}`);
        return res.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw new Error(`Failed to get user: ${error.response?.status || error.message}`);
    }
}

// Search items by name or price range
export async function searchItems(baseUrl, { q, minPrice, maxPrice } = {}) {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (minPrice !== undefined) params.append('minPrice', minPrice);
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice);
    
    const queryString = params.toString();
    const url = `${baseUrl}/items/search${queryString ? `?${queryString}` : ''}`;
    
    const res = await axios.get(url);
    return res.data;
}

// Get item statistics - aggregated data
export async function getItemStats(baseUrl) {
    const res = await axios.get(`${baseUrl}/items/stats`);
    return res.data;
}