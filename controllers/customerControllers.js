import { client } from "../index.js";

export const getAllCustomers = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM customer`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}

export const getCustomerByID = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(`SELECT * FROM customer WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Customer not found');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error')
  }
}

export const createCustomer = async (req, res) => {
  const customers = Array.isArray(req.body) ? req.body : [req.body];
  // Validate input
  for (const customer of customers) {
    if (!customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ error: "Each customer must have name, email, and phone." });
    }
  }

  try {
    const values = [];
    const placeholders = customers.map((customer, index) => {
      const baseIndex = index * 3;
      values.push(customer.name, customer.email, customer.phone);
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
    }).join(", ");

    const query = `
      INSERT INTO customer(name, email, phone)
      VALUES ${placeholders}
      RETURNING *
    `;

    const result = await client.query(query, values);

    // Return one or all based on original input
    if (Array.isArray(req.body)) {
      res.status(201).json(result.rows); // Multiple customers
    } else {
      res.status(201).json(result.rows[0]); // Single customer
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


export const deleteCustomer = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(
      `DELETE FROM customer WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Customer not found');
    }
    res.status(200).json({
      message: 'Deleted customer:',
      customer: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};