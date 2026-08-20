import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Container, Form, Button, Card } from 'react-bootstrap';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate('/dashboard');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card style={{ width: '400px', borderRadius: '15px' }} className="p-4 shadow-lg border-0">
        <div className="text-center mb-3">
          <img src="/logo.png" alt="MobApps" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
        </div>
        <h2 className="text-center mb-4 text-primary fw-bold">Connexion</h2>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-pill" />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-pill" />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 rounded-pill shadow">Se connecter</Button>
        </Form>
      </Card>
    </Container>
  );
}

export default LoginPage;
