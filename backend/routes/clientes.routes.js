import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET: Listar clientes
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id_cliente DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear cliente
router.post('/', async (req, res) => {
  const { nomCliente, contacto, departamento, ciudad } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO clientes ("nomCliente", contacto, departamento, ciudad) VALUES ($1, $2, $3, $4) RETURNING *',
      [nomCliente, contacto, departamento, ciudad]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Actualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nomCliente, contacto, departamento, ciudad } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE clientes SET "nomCliente" = $1, contacto = $2, departamento = $3, ciudad = $4 WHERE id_cliente = $5 RETURNING *',
      [nomCliente, contacto, departamento, ciudad, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Eliminar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM clientes WHERE id_cliente = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;