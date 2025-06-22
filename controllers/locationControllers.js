import { client } from "../index.js";
import bcrypt from 'bcrypt';

export const getAllLocations = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM location`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const getLocationByID = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const result = await client.query(`SELECT * FROM location WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Location not found');
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

export const getLocationByCity = async (req, res) => {
  const city = req.params.city;
  console.log(city);
  try {
    const result = await client.query(`SELECT * FROM location WHERE city ILIKE $1`, [city]);
    if (result.rows.length === 0) {
      return res.status(404).send('Location not found');
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const getLocationByState = async (req, res) => {
  const state = req.params.state;
  console.log(state);
  try {
    const result = await client.query(`SELECT * FROM location WHERE state ILIKE $1`, [state]);
    if (result.rows.length === 0) {
      return res.status(404).send('Location not found');
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const createLocation = async (req, res) => {
  const locations = Array.isArray(req.body) ? req.body : [req.body];
  // Validate input
  for (const location of locations) {
    if (!location.name || !location.street || !location.city || !location.state || !location.zipcode) {
      return res.status(400).json({ error: "Each location must have name and address." });
    }
  }

  try {
    const values = [];
    const placeholders = locations.map((location, index) => {
      const baseIndex = index * 5;
      values.push(location.name, location.street, location.city, location.state, location.zipcode);
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`;
    }).join(", ");

    const query = `
      INSERT INTO location(name, street, city, state, zipcode)
      VALUES ${placeholders}
      RETURNING *
    `;

    const result = await client.query(query, values);

    // Return one or all based on original input
    if (Array.isArray(req.body)) {
      res.status(201).json(result.rows); // Multiple locations
    } else {
      res.status(201).json(result.rows[0]); // Single location
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
};

export const deleteLocation = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(
      `DELETE FROM location WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Location not found');
    }
    res.status(200).json({
      message: 'Deleted location:',
      Location: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
};