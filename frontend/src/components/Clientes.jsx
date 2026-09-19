import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';

const initialState = { nomCliente: '', contacto: '', departamento: '', ciudad: '' };

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const cargarClientes = async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const handleClose = () => { setShow(false); setEditId(null); setFormData(initialState); };
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/clientes/${editId}`, formData);
      } else {
        await api.post('/clientes', formData);
      }
      cargarClientes();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id_cliente);
    setFormData({ nomCliente: c.nomCliente, contacto: c.contacto, departamento: c.departamento, ciudad: c.ciudad });
    handleShow();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Desea eliminar este cliente?')) {
      await api.delete(`/clientes/${id}`);
      cargarClientes();
    }
  };

  return (
    <Container fluid="md">
      <Row className="mb-3 align-items-center">
        <Col><h2>Clientes</h2></Col>
        <Col className="text-end"><Button variant="primary" onClick={handleShow}>+ Nuevo Cliente</Button></Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td>{c.id_cliente}</td>
              <td>{c.nomCliente}</td>
              <td>{c.contacto}</td>
              <td>{c.departamento}</td>
              <td>{c.ciudad}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(c)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(c.id_cliente)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control required value={formData.nomCliente} onChange={e => setFormData({ ...formData, nomCliente: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contacto</Form.Label>
              <Form.Control required value={formData.contacto} onChange={e => setFormData({ ...formData, contacto: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Departamento</Form.Label>
              <Form.Control required value={formData.departamento} onChange={e => setFormData({ ...formData, departamento: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control required value={formData.ciudad} onChange={e => setFormData({ ...formData, ciudad: e.target.value })} />
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

export default Clientes;