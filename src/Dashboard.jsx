import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { supabase } from './supabaseClient';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-3">
        <Container>
          <Navbar.Brand href="/dashboard" className="fw-bold fs-3">
            <img src="/logo.png" alt="MobApps" style={{ height: '40px', marginRight: '10px', borderRadius: '50%' }} />
            MobApps
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/dashboard" className="px-3">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/workspace" className="px-3">Espace de Travail</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/transactions" className="px-3">Transactions</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/parametres" className="px-3 text-warning">Paramètres</Nav.Link>
              <Button variant="outline-danger" className="ms-3" onClick={handleLogout}>Déconnexion</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-5">
        <div className="bg-white p-5 rounded shadow-sm">
          <Outlet />
        </div>
      </Container>
    </>
  );
}

export default Dashboard;
