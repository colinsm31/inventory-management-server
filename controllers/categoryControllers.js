import { client } from "../index.js";

export const getAllCategories = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM "category"`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}


export const getCategoryByID = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(`SELECT * FROM "category" WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const createCategory = async (req, res) => {
  const categories = Array.isArray(req.body) ? req.body : [req.body];
  // Validate input
  for (const category of categories) {
    if (!category.name || !category.description) {
      return res.status(400).json({ error: "Each category must have name and description." });
    }
  }

  try {
    const values = [];
    const placeholders = categories.map((category, index) => {
      const baseIndex = index * 2;
      values.push(category.name, category.description);
      return `($${baseIndex + 1}, $${baseIndex + 2})`;
    }).join(", ");

    const query = `
      INSERT INTO category(name, description)
      VALUES ${placeholders}
      RETURNING *
    `;

    const result = await client.query(query, values);

    // Return one or all based on original input
    if (Array.isArray(req.body)) {
      res.status(201).json(result.rows); // Multiple categories
    } else {
      res.status(201).json(result.rows[0]); // Single category
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(
      `DELETE FROM "category" WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json({
      message: 'Deleted Category:',
      category: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
};