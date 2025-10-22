import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { orderService } from '../../services/orderService';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const STATUTS = [
  { value: 'en_attente', label: 'En attente', color: '#f59e0b' },
  { value: 'confirmee', label: 'Confirmée', color: '#3b82f6' },
  { value: 'livree', label: 'Livrée', color: '#10b981' },
  { value: 'annulee', label: 'Annulée', color: '#ef4444' }
];

const Statistics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year', 'all'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les commandes selon la période
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.date_commande);
      
      switch(period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
        case 'year':
          return orderDate.getFullYear() === selectedYear;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  // Statistiques globales
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredOrders = filteredOrders.filter(o => o.statut === 'livree').length;
  const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders * 100) : 0;
// Après la ligne `const deliveryRate = ...`, ajoutez :
const totalProfit = filteredOrders
  .filter(o => o.statut === 'livree')
  .reduce((sum, order) => {
    const orderProfit = order.articles?.reduce((articleSum, article) => {
      return articleSum + (parseFloat(article.revenu || 0) * article.quantite);
    }, 0) || 0;
    return sum + orderProfit;
  }, 0);

const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
  // Commandes par statut
  const ordersByStatus = STATUTS.map(statut => ({
    name: statut.label,
    value: filteredOrders.filter(o => o.statut === statut.value).length,
    color: statut.color
  }));

  // Ventes par mois (pour l'année sélectionnée)
 const salesByMonth = () => {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  
  const data = months.map((month, index) => {
    const monthOrders = orders.filter(order => {
      const date = new Date(order.date_commande);
      return date.getMonth() === index && date.getFullYear() === selectedYear;
    });
    
    const revenu = monthOrders
      .filter(o => o.statut === 'livree')
      .reduce((sum, order) => {
        const orderProfit = order.articles?.reduce((articleSum, article) => {
          return articleSum + (parseFloat(article.revenu || 0) * article.quantite);
        }, 0) || 0;
        return sum + orderProfit;
      }, 0);
    
    return {
      month,
      commandes: monthOrders.length,
      revenus: monthOrders.reduce((sum, o) => sum + parseFloat(o.total), 0),
      profit: revenu
    };
  });
  
  return data;
};

  // Top wilayas
  const topWilayas = () => {
    const wilayaStats = {};
    
    filteredOrders.forEach(order => {
      if (!wilayaStats[order.wilaya]) {
        wilayaStats[order.wilaya] = {
          name: order.wilaya,
          commandes: 0,
          revenus: 0
        };
      }
      wilayaStats[order.wilaya].commandes++;
      wilayaStats[order.wilaya].revenus += parseFloat(order.total);
    });
    
    return Object.values(wilayaStats)
      .sort((a, b) => b.revenus - a.revenus)
      .slice(0, 5);
  };

  // Évolution des ventes (derniers 7 jours)
const last7DaysSales = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.date_commande);
      return orderDate.toDateString() === date.toDateString();
    });
    
    const profit = dayOrders
      .filter(o => o.statut === 'livree')
      .reduce((sum, order) => {
        const orderProfit = order.articles?.reduce((articleSum, article) => {
          return articleSum + (parseFloat(article.revenu || 0) * article.quantite);
        }, 0) || 0;
        return sum + orderProfit;
      }, 0);
    
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      commandes: dayOrders.length,
      revenus: dayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0),
      profit: profit
    });
  }
  return data;
};

  // Obtenir les années disponibles
  const getAvailableYears = () => {
    const years = new Set(orders.map(order => new Date(order.date_commande).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  const availableYears = getAvailableYears();

  return (
    <Layout>
      <div className="p-6">
      {/* Header */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-pink-500" />
        Statistiques et Analyses
      </h1>
      <p className="text-gray-600 font-medium">
        Tableau de bord des performances
      </p>
    </div>
  </div>

  {/* Filtres de période */}
  <div className="mt-6">
    <label className="block text-sm font-bold text-gray-700 mb-3">Période d'analyse</label>
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            period === 'week'
              ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          7 derniers jours
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            period === 'month'
              ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Ce mois
        </button>
        <button
          onClick={() => setPeriod('year')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            period === 'year'
              ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cette année
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`px-4 py-2 rounded-xl font-bold transition ${
            period === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tout
        </button>
      </div>

      {period === 'year' && (
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-medium"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  </div>
</div>
        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Commandes */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <ArrowUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-pink-100 mb-1">Total Commandes</h3>
            <p className="text-3xl font-bold mb-1">{totalOrders}</p>
            <p className="text-xs text-pink-100">Toutes les commandes</p>
          </div>
          {/* Revenu Total */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <ArrowUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-purple-100 mb-1">CA Total</h3>
            <p className="text-3xl font-bold mb-1">{totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-purple-100">DA</p>
          </div>

      {/* Revenu Net */}
<div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
  <div className="flex items-center justify-between mb-4">
    <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
      <TrendingUp className="w-6 h-6" />
    </div>
    <ArrowUp className="w-5 h-5" />
  </div>
  <h3 className="text-sm font-medium text-emerald-100 mb-1">Revenu Net</h3>
  <p className="text-3xl font-bold mb-1">{totalProfit.toFixed(2)}</p>
  <p className="text-xs text-emerald-100">DA (Commandes livrées)</p>
</div>

        </div>

        {/* Graphiques */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Évolution des ventes */}
<div className="bg-white rounded-2xl shadow-lg p-6">
  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <Calendar className="w-5 h-5 text-pink-500" />
    Évolution des ventes (7 derniers jours)
  </h3>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={last7DaysSales()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis yAxisId="left" label={{ value: 'Commandes', angle: -90, position: 'insideLeft' }} />
      <YAxis yAxisId="right" orientation="right" label={{ value: 'Montant (DA)', angle: 90, position: 'insideRight' }} />
      <Tooltip 
        formatter={(value, name) => {
          if (name === 'Commandes') return [value, name];
          return [value.toFixed(2) + ' DA', name];
        }}
      />
      <Legend />
      <Line 
        yAxisId="left"
        type="monotone" 
        dataKey="commandes" 
        stroke="#ec4899" 
        strokeWidth={3}
        name="Commandes"
        dot={{ fill: '#ec4899', r: 5 }}
      />
      <Line 
        yAxisId="right"
        type="monotone" 
        dataKey="revenus" 
        stroke="#8b5cf6" 
        strokeWidth={3}
        name="CA (DA)"
        dot={{ fill: '#8b5cf6', r: 5 }}
      />
      <Line 
        yAxisId="right"
        type="monotone" 
        dataKey="profit" 
        stroke="#10b981" 
        strokeWidth={3}
        name="Revenu Net (DA)"
        dot={{ fill: '#10b981', r: 5 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

          {/* Commandes par statut */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-500" />
              Commandes par statut
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventes par mois */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            Ventes par mois ({selectedYear})
          </h3>
          <ResponsiveContainer width="100%" height={350}>
  <BarChart data={salesByMonth()}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis yAxisId="left" />
    <YAxis yAxisId="right" orientation="right" />
    <Tooltip />
    <Legend />
    <Bar 
      yAxisId="left"
      dataKey="commandes" 
      fill="#ec4899" 
      name="Commandes"
      radius={[10, 10, 0, 0]}
    />
    <Bar 
      yAxisId="right"
      dataKey="revenus" 
      fill="#8b5cf6" 
      name="CA (DA)"
      radius={[10, 10, 0, 0]}
    />
    <Bar 
      yAxisId="right"
      dataKey="profit" 
      fill="#10b981" 
      name="Revenu Net (DA)"
      radius={[10, 10, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
        </div>

        {/* Top Wilayas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            Top 5 Wilayas
          </h3>
          <div className="space-y-4">
            {topWilayas().map((wilaya, index) => (
              <div key={wilaya.name} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white`}
                     style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800">{wilaya.name}</span>
                    <span className="text-sm text-gray-600">{wilaya.commandes} commandes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(wilaya.revenus / topWilayas()[0].revenus) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{wilaya.revenus.toFixed(2)} DA</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;