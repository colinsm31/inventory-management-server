import { client } from "../index.js";
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM "user"`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}

export const getUserByID = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const result = await client.query(`SELECT * FROM "user" WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error')
  }
}

export const getUsersByRole = async (req, res) => {
  const role = req.params.role;
  console.log(role);
  try {
    const result = await client.query(`SELECT * FROM "user" WHERE role = $1`, [role]);
    if (result.rows.length === 0) {
      return res.status(404).send('User(s) not found');
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error')
  }
}

export const createUser = async (req, res) => {
  const { name, password, email, role } = req.body;
  try {
    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await client.query(
      `INSERT INTO "user"(name, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, hashedPassword, email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
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
    res.status(500).send('Server Error');
  }
};