import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';

function WorkspacePage() {
  const [formData, setFormData] = useState({
    action_type: 'Depot',
    operateur: 'Orange',
    montant: '',
    numero_client: '',
    nom_client: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const calculateCommission = async (amount, operator, actionType) => {
    const { data: tier, error } = await supabase
      .from('commission_tiers')
      .select('*')
      .eq('operateur', operator)
      .eq('action_type', actionType)
      .lte('min_amount', amount)
      .gte('max_amount', amount)
      .single();

    if (error || !tier) {
      console.warn("Aucun palier trouvé, application du taux par défaut (2%)");
      return amount * 0.02;
    }
      
    return tier.commission_type === 'fixed' 
      ? Number(tier.commission_value) 
      : amount * (Number(tier.commission_value) / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: 'danger', text: 'Utilisateur non connecté' });
      setLoading(false);
      return;
    }
    
    const commission = await calculateCommission(Number(formData.montant), formData.operateur, formData.action_type);

    const payload = { 
      ...formData, 
      user_id: user.id, 
      commission: commission, 
      transaction_date: new Date().toISOString() 
    };
    if (!payload.nom_client) delete payload.nom_client;

    const { error } = await supabase.from('transactions').insert(payload);
    if (error) setMessage({ type: 'danger', text: error.message });
    else {
      setMessage({ type: 'success', text: `Transaction enregistrée ! Commission appliquée : ${commission} Ar` });
      setFormData({ action_type: 'Depot', operateur: 'Orange', montant: '', numero_client: '', nom_client: '' });
    }
    setLoading(false);
  };

  return (
    <Container style={{ maxWidth: '600px' }}>
      <Card className="p-4 shadow-sm">
        <div className="text-center mb-4">
          <img src="/logo.png" alt="Logo" style={{ maxWidth: '100px' }} />
        </div>
        <h4 className="mb-4 text-center">Nouvelle Transaction</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Type d'action</Form.Label>
            <div className="d-flex gap-3">
              {['Depot', 'Retrait', 'Transfert_mops', 'Transfert_dops'].map((type) => (
                <Form.Check
                  key={type}
                  type="radio"
                  label={
                    type === 'Transfert_mops' ? 'Transfert sur même opérateur' :
                    type === 'Transfert_dops' ? 'Transfert sur autres opérateur' :
                    type
                  }
                  name="action_type"
                  value={type}
                  checked={formData.action_type === type}
                  onChange={e => setFormData({...formData, action_type: e.target.value})}
                />
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Opérateur</Form.Label>
            <div className="d-flex gap-3">
              {[
                { name: 'Orange', img: '/orange.png' },
                { name: 'Airtel', img: '/airtel.png' },
                { name: 'MVola', img: '/mvola.png' }
              ].map((op) => (
                <Form.Check
                  key={op.name}
                  type="radio"
                  name="operateur"
                  value={op.name}
                  checked={formData.operateur === op.name}
                  onChange={e => setFormData({...formData, operateur: e.target.value})}
                  label={
                    <img 
                      src={op.img} 
                      alt={op.name} 
                      style={{ width: '50px', height: 'auto', cursor: 'pointer', border: formData.operateur === op.name ? '2px solid #007bff' : '1px solid #ddd', borderRadius: '5px' }} 
                    />
                  }
                />
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Montant (Ar)</Form.Label>
            <Form.Control type="number" value={formData.montant} onChange={e => setFormData({...formData, montant: e.target.value})} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Numéro Client</Form.Label>
            <Form.Control type="text" value={formData.numero_client} onChange={e => setFormData({...formData, numero_client: e.target.value})} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nom du client (Optionnel)</Form.Label>
            <Form.Control type="text" value={formData.nom_client} onChange={e => setFormData({...formData, nom_client: e.target.value})} />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading} className="w-100">Valider</Button>
        </Form>
        {message && <Alert variant={message.type} className="mt-3">{message.text}</Alert>}
      </Card>
    </Container>
  );
}
export default WorkspacePage;
