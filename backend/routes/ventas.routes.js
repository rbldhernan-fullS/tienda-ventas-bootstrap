import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET: Listar ventas con información del cliente
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT v.id_venta, v.fecha_venta, v.total, v.estado, c."nomCliente" 
      FROM ventas v 
      JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_venta DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Registrar venta con transacción y control de stock
router.post('/', async (req, res) => {
  const { id_cliente, detalles } = req.body; // detalles: [{ id_producto, cantidad, precio_unitario }]
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalVenta = 0;
    for (const item of detalles) {
      // Validar stock existente
      const prodRes = await client.query('SELECT cantidad FROM productos WHERE id_producto = $1', [item.id_producto]);
      if (prodRes.rows.length === 0 || prodRes.rows[0].cantidad < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ID: ${item.id_producto}`);
      }
      totalVenta += item.cantidad * item.precio_unitario;
    }

    // Insertar venta
    const ventaRes = await client.query(
      'INSERT INTO ventas (id_cliente, total, estado) VALUES ($1, $2, $3) RETURNING id_venta',
      [id_cliente, totalVenta, 'Completada']
    );
    const id_venta = ventaRes.rows[0].id_venta;

    // Insertar detalle y actualizar stock
    for (const item of detalles) {
      const subtotal = item.cantidad * item.precio_unitario;
      await client.query(
        'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [id_venta, item.id_producto, item.cantidad, item.precio_unitario, subtotal]
      );
      await client.query(
        'UPDATE productos SET cantidad = cantidad - $1 WHERE id_producto = $2',
        [item.cantidad, item.id_producto]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id_venta, total: totalVenta, message: 'Venta procesada con éxito' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// DELETE: Eliminar venta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM ventas WHERE id_venta = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json({ message: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;