import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Form, Button, Card, Container, Alert, Tab, Tabs } from 'react-bootstrap';

function WorkspacePage() {
  const [formData, setFormData] = useState({
    action_type: 'Depot',
    operateur: 'Orange',
    montant: '',
    numero_client: '',
    nom_client: '',
  });
  const [bulkData, setBulkData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const calculateCommission = async (amount, operator, actionType) => {
    // 1. Chercher le palier correspondant
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
      return amount * 0.02; // Commission par défaut
    }
      
    // 2. Calculer selon le type
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
    
    // Calcul de la commission en temps réel
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

  const handleBulkSubmit = async () => {
    setLoading(true);
    setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Simple CSV parser: type,operator,amount,phone,name
    const rows = bulkData.split('\n').filter(r => r.trim() !== '');
    const transactions = [];

    for (const row of rows) {
      const [action_type, operateur, montant, numero_client, nom_client] = row.split(',').map(s => s.trim());
      const commission = await calculateCommission(Number(montant), operateur, action_type);
      transactions.push({
        action_type, operateur, montant: Number(montant), numero_client, nom_client: nom_client || null,
        user_id: user.id, commission, transaction_date: new Date().toISOString()
      });
    }

    const { error } = await supabase.from('transactions').insert(transactions);
    if (error) setMessage({ type: 'danger', text: error.message });
    else {
      setMessage({ type: 'success', text: `${transactions.length} transactions enregistrées !` });
      setBulkData('');
    }
    setLoading(false);
  };

  return (
    <Container style={{ maxWidth: '600px' }}>
      <Card className="p-4 shadow-sm">
        <Tabs defaultActiveKey="single" className="mb-3">
          <Tab eventKey="single" title="Transaction Simple">
            <Form onSubmit={handleSubmit}>
              {/* ... (form fields) ... */}
              <Form.Group className="mb-3">
                <Form.Label>Type d'action</Form.Label>
                <Form.Select value={formData.action_type} onChange={e => setFormData({...formData, action_type: e.target.value})}>
                  <option value="Depot">Dépôt</option>
                  <option value="Retrait">Retrait</option>
                  <option value="Transfert_mops">Transfert (Même opérateur - Mops)</option>
                  <option value="Transfert_dops">Transfert (Vers autre opérateur - Dops)</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Opérateur</Form.Label>
                <Form.Select value={formData.operateur} onChange={e => setFormData({...formData, operateur: e.target.value})}>
                  <option value="Orange">Orange</option>
                  <option value="Airtel">Airtel</option>
                  <option value="MVola">MVola</option>
                </Form.Select>
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
          </Tab>
          <Tab eventKey="bulk" title="Insertion Multiple (CSV)">
            <Form.Group className="mb-3">
              <Form.Label>Format: Type,Opérateur,Montant,Numéro,Nom(opt)</Form.Label>
              <Form.Control as="textarea" rows={5} value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Depot,Orange,5000,0320000000,Jean" />
            </Form.Group>
            <Button variant="success" onClick={handleBulkSubmit} disabled={loading} className="w-100">Enregistrer tout</Button>
          </Tab>
        </Tabs>
        {message && <Alert variant={message.type} className="mt-3">{message.text}</Alert>}
      </Card>
    </Container>
  );
}
export default WorkspacePage;
