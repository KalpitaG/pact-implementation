// src/consumer.js
// Consumer client for pact-provider-demo API
// This module provides functions to interact with the API endpoints defined in the provider.

import axios from "axios";

// ===========================================================================
// ITEMS
// ===========================================================================

/**
 * GET /items — returns { items: [...], total: N }
 * Optional query params: category, inStock
 */
export async function listItems(baseUrl, { category, inStock } = {}) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (inStock !== undefined) params.append("inStock", String(inStock));

  const query = params.toString();
  const url = `${baseUrl}/items${query ? `?${query}` : ""}`;
  const res = await axios.get(url);
  return res.data; // { items: [...], total: N }
}

/**
 * GET /items/:id — returns single Item object
 */
export async function getItem(baseUrl, id) {
  const res = await axios.get(`${baseUrl}/items/${id}`);
  return res.data;
}

/**
 * GET /items/search?q=term — returns { results: [...], query: "...", count: N }
 * The q parameter is REQUIRED — provider returns 400 without it.
 */
export async function searchItems(baseUrl, query) {
  if (!query) {
    throw new Error('Search query "q" is required');
  }
  const res = await axios.get(
    `${baseUrl}/items/search?q=${encodeURIComponent(query)}`
  );
  return res.data; // { results: [...], query: "...", count: N }
}

/**
 * POST /items — returns 201 with created Item
 * Requires name and price in body.
 */
export async function createItem(baseUrl, { name, price, category, inStock }) {
  const res = await axios.post(`${baseUrl}/items`, {
    name,
    price,
    category,
    inStock,
  });
  return res.data;
}

/**
 * PUT /items/:id — full replace, returns 200 with updated Item
 * Requires name and price in body.
 */
export async function replaceItem(
  baseUrl,
  id,
  { name, price, category, inStock }
) {
  const res = await axios.put(`${baseUrl}/items/${id}`, {
    name,
    price,
    category,
    inStock,
  });
  return res.data;
}

/**
 * PATCH /items/:id — partial update, returns 200 with updated Item
 */
export async function updateItem(baseUrl, id, patch) {
  const res = await axios.patch(`${baseUrl}/items/${id}`, patch);
  return res.data;
}

/**
 * DELETE /items/:id — returns 204 (no content) on success, 404 if not found
 */
export async function deleteItem(baseUrl, id) {
  const res = await axios.delete(`${baseUrl}/items/${id}`);
  return res.status; // 204
}

// ===========================================================================
// CATEGORIES
// ===========================================================================

/**
 * GET /categories — returns { categories: [...], total: N }
 */
export async function listCategories(baseUrl) {
  const res = await axios.get(`${baseUrl}/categories`);
  return res.data; // { categories: [...], total: N }
}

/**
 * GET /categories/:id — returns single Category object
 */
export async function getCategoryById(baseUrl, categoryId) {
  const res = await axios.get(`${baseUrl}/categories/${categoryId}`);
  return res.data;
}

/**
 * GET /categories/:id/items — returns { category: "name", items: [...], count: N }
 */
export async function getItemsByCategory(baseUrl, categoryId) {
  const res = await axios.get(`${baseUrl}/categories/${categoryId}/items`);
  return res.data; // { category: "Electronics", items: [...], count: N }
}

/**
 * POST /categories — returns 201 with created Category
 * Requires name. Slug is auto-generated if not provided.
 */
export async function createCategory(baseUrl, { name, slug }) {
  const res = await axios.post(`${baseUrl}/categories`, { name, slug });
  return res.data;
}

// ===========================================================================
// USERS
// ===========================================================================

/**
 * GET /users/:id — returns public user info (email excluded for privacy)
 * Returns { id, username, role } — NOT name or email.
 */
export async function getUserById(baseUrl, userId) {
  try {
    const res = await axios.get(`${baseUrl}/users/${userId}`);
    return res.data; // { id, username, role }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * GET /users/:id/profile — returns full user profile INCLUDING email
 * Returns { id, username, email, role }
 */
export async function getUserProfile(baseUrl, userId) {
  try {
    const res = await axios.get(`${baseUrl}/users/${userId}/profile`);
    return res.data; // { id, username, email, role }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}