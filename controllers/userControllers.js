import { client } from "../index.js";
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM "user"`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
}

export const getUsersWithLocations = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        json_agg(
          json_build_object('id', l.id, 'name', l.name)
        ) FILTER (WHERE l.id IS NOT NULL) AS locations
      FROM "user" u
      LEFT JOIN user_location_access ula ON ula.user_id = u.id
      LEFT JOIN location l ON l.id = ula.location_id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.id;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Server error.",
      message: error.message
    });
  }
};

export const getUserByID = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(`SELECT * FROM "user" WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
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

export const getUserByIDWithLocations = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(`
      SELECT u.id, u.name, u.email, u.role,
        json_agg(
          json_build_object('id', l.id, 'name', l.name)
        ) FILTER (WHERE l.id IS NOT NULL) AS locations
      FROM "user" u
      LEFT JOIN user_location_access ula ON ula.user_id = u.id
      LEFT JOIN location l ON l.id = ula.location_id
      WHERE u.id = $1
      GROUP BY u.id;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Server error.",
      message: error.message
    });
  }
};

export const getUsersByRole = async (req, res) => {
  const role = req.params.role;
  try {
    const result = await client.query(`SELECT * FROM "user" WHERE role = $1`, [role]);
    if (result.rows.length === 0) {
      return res.status(404).send('User(s) not found');
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

export const createUser = async (req, res) => {
  let users = req.body;

  // Normalize input: if a single object, wrap it into an array
  if (!Array.isArray(users)) {
    users = [users];
  }

  try {
    const createdUsers = [];

    for (const user of users) {
      const { name, password, email, role, location_ids } = user;

      // Basic validation
      if (!password || typeof password !== 'string' || password.trim() === '') {
        return res.status(400).json({ error: 'Password is required and must be a non-empty string.' });
      }
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ error: 'Email is required and must be a non-empty string.' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert user
      const result = await client.query(
        `INSERT INTO "user"(name, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, hashedPassword, email, role]
      );

      const newUser = result.rows[0];

      // Grant access to locations if provided
      if (Array.isArray(location_ids) && location_ids.length > 0) {
        const values = location_ids.map((locId, index) => `($1, $${index + 2})`).join(", ");
        const params = [newUser.id, ...location_ids];

        await client.query(
          `INSERT INTO user_location_access (user_id, location_id) VALUES ${values} ON CONFLICT DO NOTHING`,
          params
        );
      }

      createdUsers.push(newUser);
    }

    // If only one user was sent, return an object, else array
    res.status(201).json(users.length === 1 ? createdUsers[0] : createdUsers);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Server error.",
      message: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, role } = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    // Check for which fields are being updated
    if (name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (email !== undefined) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }
    if (password !== undefined) {
      // Hash the new password before saving
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      fields.push(`password = $${index++}`);
      values.push(password);
    }
    if (role !== undefined) {
      fields.push(`role = $${index++}`);
      values.push(role);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    values.push(id);

    const query = `
      UPDATE "user"
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await client.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await client.query(
      `DELETE FROM "user" WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.status(200).json({
      message: 'Deleted user:',
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      error: "Server error.",
      message: error.message
    });
  }
};

export const getUserAccessibleLocations = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await client.query(`
      SELECT location.*
      FROM location
      JOIN user_location_access ula ON ula.location_id = location.id
      WHERE ula.user_id = $1;
    `, [userId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Server error.",
      message: error.message
    });
  }
};

export const revokeUserAccessToLocation = async (req, res) => {
  const { userId, locationId } = req.body;

  try {
    const result = await client.query(`
      DELETE FROM user_location_access
      WHERE user_id = $1 AND location_id = $2
      RETURNING *;
    `, [userId, locationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Access not found' });
    }

    res.status(200).json({ message: 'Access revoked', access: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Server error.",
      message: error.message
    });
  }
};
