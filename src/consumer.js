const fetch = require("node-fetch");

// GET /users -> returns an array of users
async function fetchUsers(baseUrl) {
  const res = await fetch(`${baseUrl}/users`);
  if (!res.ok) {
    throw new Error(`GET /users failed: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

// POST /users -> creates a user { name } and returns the created user { id, name }
async function createUser(baseUrl, name) {
  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  // 201 on success; 4xx/5xx = error paths (your tests expect 201 case)
  if (!res.ok) {
    // you can still return the JSON for debugging if you like:
    const body = await res.text().catch(() => "");
    throw new Error(`POST /users failed: ${res.status} ${res.statusText} ${body}`);
  }
  return await res.json();
}

module.exports = { fetchUsers, createUser };
