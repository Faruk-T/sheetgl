import React, { useMemo, useState } from 'react';
import { SheetGL, ColumnDef } from './datagrid';

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Active',
    bg: '#DCFCE7',
    fg: '#166534',
    darkBg: 'rgba(48, 209, 88, 0.16)',
    darkFg: '#30D158',
  },
  {
    value: 'pending',
    label: 'Pending',
    bg: '#FEF3C7',
    fg: '#92400E',
    darkBg: 'rgba(255, 159, 10, 0.16)',
    darkFg: '#FF9F0A',
  },
  {
    value: 'review',
    label: 'In Review',
    bg: '#E0F2FE',
    fg: '#075985',
    darkBg: 'rgba(10, 132, 255, 0.16)',
    darkFg: '#64D2FF',
  },
  {
    value: 'rejected',
    label: 'Cancelled',
    bg: '#FEE2E2',
    fg: '#991B1B',
    darkBg: 'rgba(255, 69, 58, 0.16)',
    darkFg: '#FF453A',
  },
];

// 10,000 Row Enterprise / Financial Demo Data Generator
function generateDemoData(count: number = 10000) {
  const cities = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Singapore', 'Sydney', 'Toronto'];
  const categories = [
    'Enterprise SaaS',
    'Aerospace',
    'FinTech',
    'Biotechnology',
    'Logistics',
    'Robotics',
    'Clean Energy',
  ];
  const companies = [
    'Acme Global Holding',
    'Nexus Cloud Technologies',
    'Apex Logistics International',
    'Vertex BioPharma Labs',
    'Quantum Dynamics Corp.',
    'Hyperion Infrastructure',
    'Starlight AI Robotics',
    'Nova Clean Materials',
    'Horizon Digital Systems',
    'Vanguard Enterprise FinTech',
  ];

  const rows: any[] = [];
  for (let i = 1; i <= count; i++) {
    const city = cities[i % cities.length];
    const category = categories[i % categories.length];
    const status = STATUS_OPTIONS[i % STATUS_OPTIONS.length];
    const company = `${companies[i % companies.length]} #${i}`;
    const balance = Math.round((Math.sin(i) * 50000 + 45000) * 100) / 100;
    const progress = (i * 7) % 101;
    const rating = (i % 5) + 1;
    const isApproved = i % 3 === 0;

    // 7-day sparkline trend data points
    const sparkline = [
      Math.abs(Math.sin(i) * 50) + 10,
      Math.abs(Math.cos(i) * 60) + 15,
      Math.abs(Math.sin(i + 1) * 80) + 20,
      Math.abs(Math.cos(i + 2) * 45) + 30,
      Math.abs(Math.sin(i + 3) * 95) + 25,
      Math.abs(Math.cos(i + 4) * 70) + 40,
      Math.abs(Math.sin(i + 5) * 85) + 50,
    ];

    const d = new Date(2025, (i % 12), (i % 28) + 1);

    rows.push({
      id: i,
      code: `ACC-${100000 + i}`,
      company,
      city,
      category,
      status: status.value,
      balance,
      rating,
      progress,
      sparkline,
      date: d.toISOString().split('T')[0],
      isApproved,
    });
  }
  return rows;
}

export function App() {
  const [data] = useState(() => generateDemoData(10000));

  const columns = useMemo<ColumnDef[]>(() => [
    {
      id: 'id',
      title: 'ID',
      type: 'number',
      width: 70,
      pinned: 'left',
      readonly: true,
      sortable: true,
      filterable: true,
    },
    {
      id: 'code',
      title: 'Account Code',
      type: 'text',
      width: 120,
      pinned: 'left',
      sortable: true,
      filterable: true,
    },
    {
      id: 'company',
      title: 'Company / Organization',
      type: 'text',
      width: 250,
      pinned: 'left',
      sortable: true,
      filterable: true,
    },
    {
      id: 'city',
      title: 'Region / City',
      type: 'text',
      width: 130,
      sortable: true,
      filterable: true,
      groupable: true,
    },
    {
      id: 'category',
      title: 'Industry Sector',
      type: 'text',
      width: 150,
      sortable: true,
      filterable: true,
      groupable: true,
    },
    {
      id: 'status',
      title: 'Status',
      type: 'select',
      width: 140,
      sortable: true,
      filterable: true,
      options: STATUS_OPTIONS,
    },
    {
      id: 'balance',
      title: 'Balance ($)',
      type: 'currency',
      width: 150,
      currencySymbol: '$',
      decimalDigits: 2,
      sortable: true,
      filterable: true,
    },
    {
      id: 'isApproved',
      title: 'Approved',
      type: 'boolean',
      width: 90,
      sortable: true,
      filterable: true,
    },
    {
      id: 'rating',
      title: 'Trust Score',
      type: 'rating',
      width: 130,
      sortable: true,
      filterable: true,
    },
    {
      id: 'progress',
      title: 'Target Quota',
      type: 'progress',
      width: 130,
      sortable: true,
      filterable: true,
    },
    {
      id: 'sparkline',
      title: '7-Day Trend',
      type: 'sparkline',
      width: 140,
      sparklineColor: '#2563EB',
    },
    {
      id: 'date',
      title: 'Registered Date',
      type: 'date',
      width: 130,
      sortable: true,
      filterable: true,
    },
    {
      id: 'actions',
      title: 'Actions',
      type: 'action',
      width: 100,
      buttonText: 'View',
      onActionClick: (row) => {
        alert(`Selected Record:\nID: ${row.id}\nCompany: ${row.company}\nBalance: $${row.balance}`);
      },
    },
  ], []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <SheetGL
        dataSource={data}
        columns={columns}
        theme="apple-dark"
        locale="en"
        onCellChange={(row, colId, val) => {
          console.log('Cell modified:', { id: row.id, colId, val });
        }}
      />
    </div>
  );
}

export default App;
