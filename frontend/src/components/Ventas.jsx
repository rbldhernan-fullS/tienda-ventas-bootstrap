import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import api from '../services/api';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [show, setShow] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [idCliente, setIdCliente] = useState('');
  const [detalles, setDetalles] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const cargarDatos = async () => {
    try {
      const [resVentas, resClientes, resProductos] = await Promise.all([
        api.get('/ventas'),
        api.get('/clientes'),
        api.get('/productos')
      ]);
      setVentas(resVentas.data);
      setClientes(resClientes.data);
      setProductos(resProductos.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleShow = () => { setErrorMsg(''); setShow(true); };
  const handleClose = () => {
    setShow(false);
    setIdCliente('');
    setDetalles([]);
    setSelectedProducto('');
    setCantidad(1);
  };

  const agregarItem = () => {
    if (!selectedProducto) return;
    const prod = productos.find(p => p.id_producto === parseInt(selectedProducto));
    if (!prod) return;

    if (cantidad > prod.cantidad) {
      setErrorMsg(`Stock insuficiente para "${prod.nomProducto}". Máximo disponible: ${prod.cantidad}`);
      return;
    }

    setErrorMsg('');
    const existeIndex = detalles.findIndex(d => d.id_producto === prod.id_producto);
    if (existeIndex > -1) {
      const nuevosDetalles = [...detalles];
      nuevosDetalles[existeIndex].cantidad += cantidad;
      setDetalles(nuevosDetalles);
    } else {
      setDetalles([...detalles, {
        id_producto: prod.id_producto,
        nomProducto: prod.nomProducto,
        cantidad: cantidad,
        precio_unitario: Number(prod.precio)
      }]);
    }
  };

  const removerItem = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const totalCalculado = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idCliente || detalles.length === 0) {
      setErrorMsg('Seleccione un cliente y añada al menos un producto.');
      return;
    }
    try {
      await api.post('/ventas', { id_cliente: parseInt(idCliente), detalles });
      cargarDatos();
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al procesar la venta');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Desea eliminar este registro de venta?')) {
      await api.delete(`/ventas/${id}`);
      cargarDatos();
    }
  };

  return (
    <Container fluid="md">
      <Row className="mb-3 align-items-center">
        <Col><h2>Ventas</h2></Col>
        <Col className="text-end"><Button variant="primary" onClick={handleShow}>+ Nueva Venta</Button></Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID Venta</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id_venta}>
              <td>{v.id_venta}</td>
              <td>{v.nomCliente}</td>
              <td>{new Date(v.fecha_venta).toLocaleString()}</td>
              <td>${Number(v.total).toFixed(2)}</td>
              <td><span className="badge bg-success">{v.estado}</span></td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(v.id_venta)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton><Modal.Title>Nueva Venta</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Select required value={idCliente} onChange={e => setIdCliente(e.target.value)}>
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nomCliente}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr />
            <h5>Agregar Productos</h5>
            <Row className="mb-3 align-items-end">
              <Col md={5}>
                <Form.Label>Producto</Form.Label>
                <Form.Select value={selectedProducto} onChange={e => setSelectedProducto(e.target.value)}>
                  <option value="">-- Seleccionar --</option>
                  {productos.map(p => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nomProducto} (Stock: {p.cantidad}) - ${Number(p.precio).toFixed(2)}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value) || 1)} />
              </Col>
              <Col md={4}>
                <Button variant="secondary" className="w-100" onClick={agregarItem}>+ Añadir</Button>
              </Col>
            </Row>

            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio U.</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nomProducto}</td>
                    <td>{item.cantidad}</td>
                    <td>${item.precio_unitario.toFixed(2)}</td>
                    <td>${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => removerItem(index)}>X</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="text-end fw-bold fs-5">Total: ${totalCalculado.toFixed(2)}</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="success" type="submit">Completar Venta</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Ventas;