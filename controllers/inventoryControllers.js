import { client } from "../index.js";

export const getInventory = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM "inventory"`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const getLocationInventory = async (req, res) => {
  try {
    const location_id = req.params.location_id;
    const result = await client.query(`SELECT * FROM "inventory" WHERE location_id = $1`, [location_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const getProductInInventory = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const result = await client.query(`SELECT * FROM "inventory" WHERE product_id = $1`, [product_id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const addInventoryItem = async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];

  // Validate input
  for (const item of items) {
    const { product_id, location_id } = item;
    if (!product_id || !location_id) {
      return res.status(400).json({ error: "Each item must include a product and location ID." });
    }
  }

  try {
    const insertedItems = [];

    for (const item of items) {
      // Check if item is already in inventory at this location
        // Add specififed quantity if so
        // Add 1 if quantity is not specified
      const { product_id, location_id, quantity = 1 } = item;
      const result = await client.query(
        `
        INSERT INTO inventory (product_id, location_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, location_id)
        DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity,
                      updated_at = now()
        RETURNING *;
        `,
        [product_id, location_id, quantity]
      );

      insertedItems.push(result.rows[0]);
    }

    // Return based on single vs. multiple
    res.status(201).json(Array.isArray(req.body) ? insertedItems : insertedItems[0]);

  } catch (error) {
    console.error("Add Item Error:", error.message);
    res.status(500).json({ 
      error: "Server error while adding item(s) to inventory.",
      message: error.message
    });
  }
};