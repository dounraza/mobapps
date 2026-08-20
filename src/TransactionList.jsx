import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Table, Spinner, Alert } from 'react-bootstrap';

function TransactionList({ actionType: defaultActionType }) {
  const [actionType, setActionType] = useState(defaultActionType);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [searchOperator, setSearchOperator] = useState('');

  const types = [
    { label: 'Dépôts', value: 'Depot' },
    { label: 'Retraits', value: 'Retrait' },
    { label: 'Transferts (Même op - Mops)', value: 'Transfert_mops' },
    { label: 'Transferts (Autre op - Dops)', value: 'Transfert_dops' },
  ];

  useEffect(() => {
    fetchTransactions();
  }, [actionType]);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('action_type', actionType)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setTransactions(data);
    setLoading(false);
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesDate = !searchDate || new Date(t.transaction_date || t.created_at).toISOString().split('T')[0] === searchDate;
    const matchesOperator = !searchOperator || t.operateur === searchOperator;
    return matchesDate && matchesOperator;
  });

  if (loading && transactions.length === 0) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="mb-4">
        {types.map(type => (
          <button
            key={type.value}
            onClick={() => setActionType(type.value)}
            className={`btn ${actionType === type.value ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
          >
            {type.label}
          </button>
        ))}
      </div>
      <div className="mb-3 d-flex gap-3">
        <div>
          <label className="me-2">Date :</label>
          <input 
            type="date" 
            value={searchDate} 
            onChange={(e) => setSearchDate(e.target.value)} 
            className="form-control d-inline-block w-auto"
          />
        </div>
        <div>
          <label className="me-2">Opérateur :</label>
          <select 
            value={searchOperator} 
            onChange={(e) => setSearchOperator(e.target.value)} 
            className="form-control d-inline-block w-auto"
          >
            <option value="">Tous</option>
            <option value="Orange">Orange</option>
            <option value="Airtel">Airtel</option>
            <option value="MVola">MVola</option>
          </select>
        </div>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Opérateur</th>
            <th>Montant</th>
            <th>Commission</th>
            <th>Nom Client</th>
            <th>Numéro Client</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.transaction_date || t.created_at).toLocaleDateString()}</td>
              <td>{t.operateur}</td>
              <td>{t.montant} Ar</td>
              <td>{t.commission} Ar</td>
              <td>{t.nom_client || '-'}</td>
              <td>{t.numero_client}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="mt-3 p-3 bg-light rounded shadow-sm">
        <h5>Total Montant: {filteredTransactions.reduce((sum, t) => sum + Number(t.montant), 0)} Ar</h5>
        <h5>Total Commission: {filteredTransactions.reduce((sum, t) => sum + Number(t.commission), 0)} Ar</h5>
      </div>
    </>
  );
}

export default TransactionList;
