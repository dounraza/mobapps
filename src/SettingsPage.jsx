import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Card, Form, Button, Container, Table, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useNotification } from './NotificationContext';

function SettingsPage() {
  const [tiers, setTiers] = useState([]);
  const [newTier, setNewTier] = useState({ operateur: 'Orange', action_type: 'Depot', min: '', max: '', type: 'fixed', value: '' });
  const [bulkData, setBulkData] = useState('');
  const notify = useNotification();

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    const { data, error } = await supabase.from('commission_tiers').select('*').order('min_amount', { ascending: true });
    if (data) setTiers(data);
  };

  const handleAddTier = async (tierData) => {
    const { error } = await supabase.from('commission_tiers').insert({
      operateur: tierData.operateur,
      action_type: tierData.action_type,
      min_amount: tierData.min,
      max_amount: tierData.max,
      commission_type: tierData.type,
      commission_value: tierData.value
    });
    return error;
  };

  const handleSingleSubmit = async () => {
    if (!newTier.min || !newTier.max || !newTier.value) return;
    const error = await handleAddTier(newTier);
    if (error) notify(error.message, 'error');
    else {
      notify('Palier ajouté !');
      fetchTiers();
      setNewTier({ ...newTier, min: '', max: '', value: '' });
    }
  };

  const handleBulkSubmit = async () => {
    const rows = bulkData.split('\n').filter(r => r.trim() !== '');
    const tiersToInsert = rows.map(row => {
      const [operateur, action_type, min, max, type, value] = row.split(',').map(s => s.trim());
      return { operateur, action_type, min_amount: min, max_amount: max, commission_type: type, commission_value: value };
    });

    const { error } = await supabase.from('commission_tiers').insert(tiersToInsert);
    if (error) notify(error.message, 'error');
    else {
      notify(`${tiersToInsert.length} paliers ajoutés !`);
      setBulkData('');
      fetchTiers();
    }
  };

  const handleDeleteTier = async (id) => {
    await supabase.from('commission_tiers').delete().eq('id', id);
    notify('Palier supprimé');
    fetchTiers();
  };

  return (
    <Container className="py-4">
      <Card className="p-4 shadow-sm border-0 rounded-3 mb-4">
        <h4 className="text-primary fw-bold">Application Mobile</h4>
        <p>Téléchargez notre application Android pour une expérience mobile fluide.</p>
        <Button variant="primary" href="/app-release.apk" download>
          Télécharger l'APK
        </Button>
      </Card>
      
      <Card className="p-4 shadow-sm border-0 rounded-3">
        <h3 className="mb-4 text-primary fw-bold">Gestion des Paliers</h3>
        
        <Tabs defaultActiveKey="Orange" className="mb-3" id="operator-tabs">
          {['Orange', 'Airtel', 'MVola'].map(op => (
            <Tab eventKey={op} title={op} key={op}>
              <Table striped bordered hover responsive className="mb-3 align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Action</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Commission</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.filter(t => t.operateur === op).map((tier) => (
                    <tr key={tier.id}>
                      <td>{tier.action_type}</td>
                      <td>{Number(tier.min_amount).toLocaleString()}</td>
                      <td>{Number(tier.max_amount).toLocaleString()}</td>
                      <td>{tier.commission_value} {tier.commission_type === 'percent' ? '%' : 'Ar'}</td>
                      <td><Button variant="outline-danger" size="sm" onClick={() => handleDeleteTier(tier.id)}>Supprimer</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          ))}
        </Tabs>

        <hr className="my-4" />
        <h4 className="mb-3">Ajouter un nouveau palier</h4>
        <Tabs defaultActiveKey="single" className="mb-3">
          <Tab eventKey="single" title="Ajout Unique">
            <Form className="bg-light p-3 rounded">
              <Row>
                <Col md={2}><Form.Select onChange={e => setNewTier({...newTier, operateur: e.target.value})}>
                  <option value="Orange">Orange</option><option value="Airtel">Airtel</option><option value="MVola">MVola</option>
                </Form.Select></Col>
                <Col md={2}><Form.Select onChange={e => setNewTier({...newTier, action_type: e.target.value})}>
                  <option value="Depot">Dépôt</option><option value="Retrait">Retrait</option>
                  <option value="Transfert_org">Transfert_org</option><option value="Transfert_norg">Transfert_norg</option>
                </Form.Select></Col>
                <Col md={2}><Form.Control placeholder="Min" type="number" onChange={e => setNewTier({...newTier, min: e.target.value})} /></Col>
                <Col md={2}><Form.Control placeholder="Max" type="number" onChange={e => setNewTier({...newTier, max: e.target.value})} /></Col>
                <Col md={2}><Form.Select onChange={e => setNewTier({...newTier, type: e.target.value})}>
                  <option value="fixed">Fixe</option><option value="percent">Pourcent</option>
                </Form.Select></Col>
                <Col md={1}><Form.Control placeholder="Valeur" type="number" onChange={e => setNewTier({...newTier, value: e.target.value})} /></Col>
                <Col md={1}><Button variant="success" className="w-100" onClick={handleSingleSubmit}>+</Button></Col>
              </Row>
            </Form>
          </Tab>
          <Tab eventKey="bulk" title="Insertion Multiple (CSV)">
            <Form.Group className="mb-3">
              <Form.Label>Format: Operateur,Action,Min,Max,Type(fixed/percent),Valeur</Form.Label>
              <Form.Control as="textarea" rows={5} value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Orange,Depot,1000,5000,fixed,400" />
            </Form.Group>
            <Button variant="success" onClick={handleBulkSubmit}>Enregistrer tout</Button>
          </Tab>
        </Tabs>
      </Card>
    </Container>
  );
}
export default SettingsPage;
