import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function DashboardHome() {
  const [stats, setStats] = useState({ Depot: 0, Retrait: 0, Transfert: 0, totalCommission: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStats(selectedDate);
  }, [selectedDate]);

  async function fetchStats(date) {
    setLoading(true);
    
    // Fetch all transactions for the selected date
    const { data, error } = await supabase
      .from('transactions')
      .select('action_type, commission, operateur, montant')
      .gte('transaction_date', date)
      .lt('transaction_date', new Date(new Date(date).setDate(new Date(date).getDate() + 1)).toISOString().split('T')[0]);

    if (!error && data) {
      const counts = { 
        Depot: 0, Retrait: 0, Transfert: 0, totalCommission: 0, 
        OrangeDepot: 0, AirtelDepot: 0, MVolaDepot: 0,
        OrangeRetrait: 0, AirtelRetrait: 0, MVolaRetrait: 0
      };
      data.forEach(t => {
        if (counts.hasOwnProperty(t.action_type)) counts[t.action_type]++;
        counts.totalCommission += Number(t.commission || 0);
        
        const key = `${t.operateur}${t.action_type}`;
        if (counts.hasOwnProperty(key)) {
            counts[key] += Number(t.montant || 0);
        }
      });
      setStats(counts);
    }
    setLoading(false);
  }

  const barData = {
    labels: ['Dépôts', 'Retraits', 'Transferts'],
    datasets: [{
      label: 'Nombre de Transactions',
      data: [stats.Depot, stats.Retrait, stats.Transfert],
      backgroundColor: ['#28a745', '#dc3545', '#fd7e14'],
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <>
      {/* ... header and stats cards (same as before) ... */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
        <h2 className="mb-0">Tableau de bord</h2>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          className="form-control d-inline-block w-auto"
        />
      </div>
      
      <Row className="mb-4">
        {['Dépôts', 'Retraits', 'Transferts'].map((label, i) => {
          const keys = ['Depot', 'Retrait', 'Transfert'];
          return (
            <Col md={4} key={label} className="mb-3">
                <Card className="h-100 shadow-sm border-0 rounded-3">
                    <Card.Body className="text-center">
                        <Card.Title className="text-muted">{label}</Card.Title>
                        <Card.Text className="fs-2 fw-bold">{stats[keys[i]]}</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
          );
        })}
      </Row>

      <Row className="mb-4">
        <Col md={6}>
            <h4 className="mb-3">Dépôts par Opérateur</h4>
            {['Orange', 'Airtel', 'MVola'].map(op => (
                <Card key={op} className="mb-2 shadow-sm border-0">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img src={`/${op.toLowerCase()}.png`} alt={op} style={{ width: '30px', marginRight: '10px' }} />
                            <span className="fw-bold">{op}</span>
                        </div>
                        <span className="text-success">{stats[`${op}Depot`].toLocaleString()} Ar</span>
                    </Card.Body>
                </Card>
            ))}
        </Col>
        <Col md={6}>
            <h4 className="mb-3">Retraits par Opérateur</h4>
            {['Orange', 'Airtel', 'MVola'].map(op => (
                <Card key={op} className="mb-2 shadow-sm border-0">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <img src={`/${op.toLowerCase()}.png`} alt={op} style={{ width: '30px', marginRight: '10px' }} />
                            <span className="fw-bold">{op}</span>
                        </div>
                        <span className="text-danger">{stats[`${op}Retrait`].toLocaleString()} Ar</span>
                    </Card.Body>
                </Card>
            ))}
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="p-4 shadow-sm border-0 rounded-3">
            <Card.Title className="mb-4">Nombre de Transactions par type</Card.Title>
            <Bar data={barData} options={barOptions} />
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-4 shadow-sm border-0 rounded-3 bg-primary text-white">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center h-100">
                <Card.Title>Total Commission</Card.Title>
                <Card.Text className="fs-1 fw-bold">{stats.totalCommission.toLocaleString()} Ar</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DashboardHome;
