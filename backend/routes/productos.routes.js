import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET: Listar productos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id_producto DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear producto
router.post('/', async (req, res) => {
  const { nomProducto, cantidad, precio } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO productos ("nomProducto", cantidad, precio) VALUES ($1, $2, $3) RETURNING *',
      [nomProducto, cantidad, precio]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Actualizar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nomProducto, cantidad, precio } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE productos SET "nomProducto" = $1, cantidad = $2, precio = $3 WHERE id_producto = $4 RETURNING *',
      [nomProducto, cantidad, precio, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id_producto = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;