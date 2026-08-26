import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Card, Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNotification } from './NotificationContext';

function SecurityPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const notify = useNotification();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      notify('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      notify(error.message, 'error');
    } else {
      notify('Mot de passe mis à jour avec succès !');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Container className="py-4">
      <Card className="p-4 shadow-sm border-0 rounded-3">
        <h3 className="mb-4 text-primary fw-bold">Changement de mot de passe</h3>
        <Form>
          <Row>
            <Col md={5}><Form.Control type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></Col>
            <Col md={5}><Form.Control type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></Col>
            <Col md={2}><Button variant="primary" className="w-100" onClick={handlePasswordChange}>Modifier</Button></Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
}
export default SecurityPage;
