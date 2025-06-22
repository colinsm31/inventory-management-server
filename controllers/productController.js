import { client } from "../index.js";

export const getAllProducts = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM "product"`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}

export const getProductByID = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await client.query(`SELECT * FROM "product" WHERE id = $1`, [id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}

export const getProductByCategory = async (req, res) => {
  try {
    const cat_id = req.params.category_id;
    const result = await client.query(`SELECT * FROM "product" WHERE category_id = $1`, [cat_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}

async function generateUniqueSku(client) {
  let sku;
  let exists = true;

  while (exists) {
    const prefix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const suffix = Date.now().toString().slice(-5);
    sku = `${prefix}-${suffix}`;

    const check = await client.query(
      `SELECT 1 FROM product WHERE sku = $1 LIMIT 1`,
      [sku]
    );

    exists = check.rowCount > 0;
  }
  return sku;
}

export const createProduct = async (req, res) => {
  const products = Array.isArray(req.body) ? req.body : [req.body];

  // Validate input
  for (const product of products) {
    const { name, description, category_id, price_in_cents, cost_in_cents } = product;
    if (!name || !description || !category_id || !price_in_cents || !cost_in_cents) {
      return res.status(400).json({ error: "Each product must include name, description, category_id, price_in_cents, and cost_in_cents." });
    }
  }

  try {
    const insertedProducts = [];

    for (const product of products) {
      const {
        name,
        description,
        category_id,
        price_in_cents,
        cost_in_cents,
        is_active = true
      } = product;

      const sku = await generateUniqueSku(client);

      const result = await client.query(
        `
        INSERT INTO product 
        (name, sku, description, category_id, price_in_cents, cost_in_cents, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `,
        [name, sku, description, category_id, price_in_cents, cost_in_cents, is_active]
      );

      insertedProducts.push(result.rows[0]);
    }

    // Return based on single vs. multiple
    res.status(201).json(Array.isArray(req.body) ? insertedProducts : insertedProducts[0]);

  } catch (error) {
    console.error("Create Product Error:", error.message);
    res.status(500).json({ error: "Server error while creating product(s)." });
  }
};
