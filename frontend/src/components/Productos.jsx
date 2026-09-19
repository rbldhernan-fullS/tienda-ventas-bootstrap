import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';

const initialState = { nomProducto: '', cantidad: 0, precio: 0 };

function Productos() {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const cargarProductos = async () => {
    try {
      const { data } = await api.get('/productos');
      setProductos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  const handleClose = () => { setShow(false); setEditId(null); setFormData(initialState); };
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/productos/${editId}`, formData);
      } else {
        await api.post('/productos', formData);
      }
      cargarProductos();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id_producto);
    setFormData({ nomProducto: p.nomProducto, cantidad: p.cantidad, precio: p.precio });
    handleShow();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Desea eliminar este producto?')) {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    }
  };

  return (
    <Container fluid="md">
      <Row className="mb-3 align-items-center">
        <Col><h2>Productos</h2></Col>
        <Col className="text-end"><Button variant="primary" onClick={handleShow}>+ Nuevo Producto</Button></Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nomProducto}</td>
              <td>{p.cantidad}</td>
              <td>${Number(p.precio).toFixed(2)}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(p)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(p.id_producto)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Producto</Form.Label>
              <Form.Control required value={formData.nomProducto} onChange={e => setFormData({ ...formData, nomProducto: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cantidad (Stock)</Form.Label>
              <Form.Control type="number" required min="0" value={formData.cantidad} onChange={e => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" step="0.01" required min="0" value={formData.precio} onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Productos;