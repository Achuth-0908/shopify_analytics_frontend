'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, ShoppingBag, Package, DollarSign, Star, Activity, RefreshCw, Store, ChevronDown, Bell } from 'lucide-react';

// API Client
class XenoAPI {
  constructor(tenantId, baseURL) {
    this.tenantId = tenantId;
    this.baseURL = baseURL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '');
  }

  async request(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'x-tenant-id': this.tenantId,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async getDashboard() { return this.request('/api/analytics/dashboard'); }
  async getTopCustomers() { return this.request('/api/analytics/top-customers?limit=5'); }
  async getRevenueTrends() { return this.request('/api/analytics/revenue-trends?period=30'); }
  async getAllTenants() { 
    const response = await fetch(`${this.baseURL}/api/tenants`);
    return response.json();
  }
  async triggerSync() { 
    return fetch(`${this.baseURL}/api/sync/trigger`, {
      method: 'POST',
      headers: { 'x-tenant-id': this.tenantId }
    }).then(r => r.json());
  }
}

// Store Selector Component
const StoreSelector = ({ tenants, selectedTenant, onTenantChange, isLoading }) => (
  <div className="relative">
    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-lg rounded-xl border border-slate-200/50 px-4 py-2 min-w-[200px] shadow-lg">
      <Store className="w-4 h-4 text-indigo-600" />
      <select 
        value={selectedTenant} 
        onChange={(e) => onTenantChange(e.target.value)}
        className="appearance-none bg-transparent border-none outline-none text-sm font-medium text-slate-800 pr-8 flex-1"
        disabled={isLoading}
      >
        {tenants.map(tenant => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.storeName}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  </div>
);

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, trend, colorScheme, prefix = '' }) => {
  const colorClasses = {
    emerald: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-100',
      gradient: 'from-emerald-500/10 to-emerald-600/10'
    },
    blue: {
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-100',
      gradient: 'from-blue-500/10 to-blue-600/10'
    },
    violet: {
      text: 'text-violet-700',
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      border: 'border-violet-100',
      gradient: 'from-violet-500/10 to-violet-600/10'
    },
    amber: {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-100',
      gradient: 'from-amber-500/10 to-amber-600/10'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border ${colors.border} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br ${colors.gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${colors.text}`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center mt-3">
              <div className="flex items-center px-2 py-1 bg-emerald-100 rounded-full">
                <TrendingUp className="w-3 h-3 text-emerald-600 mr-1" />
                <span className="text-emerald-700 text-xs font-semibold">{trend}</span>
              </div>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${colors.bg} shadow-lg`}>
          <Icon className={`w-8 h-8 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
};

// Top Customers Component
const TopCustomers = ({ customers }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-200/50">
    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
      <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl mr-3">
        <Star className="w-5 h-5 text-white" />
      </div>
      Top Customers by Spend
    </h3>
    <div className="space-y-4">
      {customers.length > 0 ? customers.map((customer, index) => {
        const rankColors = [
          'from-yellow-400 to-yellow-500', // Gold
          'from-slate-400 to-slate-500',   // Silver
          'from-orange-400 to-orange-500', // Bronze
          'from-indigo-400 to-indigo-500', // Default
          'from-violet-400 to-violet-500'  // Default
        ];
        
        return (
          <div key={customer.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all duration-200 border border-slate-200/50">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 bg-gradient-to-r ${rankColors[index]} shadow-lg`}>
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-slate-600 text-sm">{customer.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-700 text-lg">₹{customer.totalSpent}</p>
              <p className="text-slate-600 text-sm">{customer.ordersCount} orders</p>
            </div>
          </div>
        );
      }) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No customers data available</p>
        </div>
      )}
    </div>
  </div>
);

// Recent Orders Component
const RecentOrders = ({ orders }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-200/50">
    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
        <Activity className="w-5 h-5 text-white" />
      </div>
      Recent Orders
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-4 px-3 font-semibold text-slate-700 bg-slate-50 rounded-l-lg">Order</th>
            <th className="text-left py-4 px-3 font-semibold text-slate-700 bg-slate-50">Customer</th>
            <th className="text-left py-4 px-3 font-semibold text-slate-700 bg-slate-50">Amount</th>
            <th className="text-left py-4 px-3 font-semibold text-slate-700 bg-slate-50">Status</th>
            <th className="text-left py-4 px-3 font-semibold text-slate-700 bg-slate-50 rounded-r-lg">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders && orders.length > 0 ? orders.slice(0, 8).map((order, index) => (
            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-3 font-mono text-sm text-indigo-600 font-semibold">{order.orderNumber}</td>
              <td className="py-4 px-3">
                <div>
                  <p className="font-medium text-slate-800">
                    {order.Customer ? `${order.Customer.firstName} ${order.Customer.lastName}` : 'Guest'}
                  </p>
                  <p className="text-slate-600 text-sm">{order.email}</p>
                </div>
              </td>
              <td className="py-4 px-3 font-bold text-emerald-600 text-lg">₹{order.totalPrice}</td>
              <td className="py-4 px-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {order.financialStatus}
                </span>
              </td>
              <td className="py-4 px-3 text-slate-600 text-sm font-medium">
                {new Date(order.shopifyCreatedAt).toLocaleDateString('en-IN')}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No orders data available</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Revenue Chart Component
const RevenueChart = ({ data }) => {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.revenue || 0),
    orders: item.orderCount || 0
  }));

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-200/50">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl mr-3">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        Revenue Trends (Last 30 Days)
      </h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                color: '#8b5cf6'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="url(#revenueGradient)"
              strokeWidth={4}
              dot={{ fill: '#8b5cf6', strokeWidth: 3, r: 6, stroke: '#fff' }}
              activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 3, fill: '#fff' }}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-medium">No revenue data available</p>
        </div>
      )}
    </div>
  );
};

// Product Performance Chart
const ProductChart = ({ orders }) => {
  const productData = {};
  
  if (orders && orders.length > 0) {
    orders.forEach(order => {
      if (order.lineItems) {
        order.lineItems.forEach(item => {
          const title = item.title;
          if (!productData[title]) {
            productData[title] = { name: title, revenue: 0, quantity: 0 };
          }
          productData[title].revenue += parseFloat(item.price) * item.quantity;
          productData[title].quantity += item.quantity;
        });
      }
    });
  }

  const chartData = Object.values(productData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-200/50">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-3">
          <Package className="w-5 h-5 text-white" />
        </div>
        Product Performance
      </h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#1e293b" 
              fontSize={13}
              fontWeight={600}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#1e293b" 
              fontSize={13}
              fontWeight={600}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip 
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                color: '#059669'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="url(#productGradient)" 
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-medium">No product data available</p>
        </div>
      )}
    </div>
  );
};

// Animated SVG Background for production polish
const AnimatedBackground = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.07" />
      </radialGradient>
    </defs>
    <circle cx="60%" cy="30%" r="400" fill="url(#bgGradient)" />
    <ellipse cx="20%" cy="80%" rx="250" ry="120" fill="#8b5cf6" opacity="0.08" />
    <ellipse cx="80%" cy="70%" rx="180" ry="80" fill="#3b82f6" opacity="0.06" />
  </svg>
);

// Toast Notification Component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'} animate-fade-in`}>
    <div className="flex items-center space-x-2">
      {/* Make sure Bell is imported from lucide-react */}
      <Bell className="w-5 h-5" />
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-700 font-bold">&times;</button>
    </div>
  </div>
);

// ChartCard Component using recharts and custom UI
const ChartCard = ({ data, title, description, trend }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 p-0 mb-8">
    <div className="px-6 pt-6">
      <h3 className="text-xl font-bold text-slate-800 flex items-center mb-2">
        <TrendingUp className="w-5 h-5 text-violet-500 mr-2" />
        {title}
      </h3>
      <p className="text-slate-500 text-sm mb-4">{description}</p>
    </div>
    <div className="px-6 pb-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === 'desktop' ? 'Desktop' : 'Mobile'
            ]}
            labelStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
            contentStyle={{
              backgroundColor: 'rgba(245, 243, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.1)'
            }}
          />
          <Line
            dataKey="desktop"
            type="monotone"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: "#8b5cf6" }}
            activeDot={{ r: 6 }}
          />
          <Line
            dataKey="mobile"
            type="monotone"
            stroke="#059669"
            strokeWidth={3}
            dot={{ fill: "#059669" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="px-6 pb-6 flex flex-col items-start gap-2 text-sm">
      <div className="flex gap-2 leading-none font-medium">
        {trend} <TrendingUp className="h-4 w-4" />
      </div>
      <div className="text-slate-400 leading-none">
        Showing total visitors for the last 6 months
      </div>
    </div>
  </div>
);

// Main Dashboard Component
const XenoDashboard = ({ defaultTenant, onBackToLanding }) => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(defaultTenant?.id || '');
  const [dashboardData, setDashboardData] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);

  // Use tenant from LandingPage.js for API
  const envTenantId = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_TENANT_ID : '';
  const apiBase = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '';
  const defaultTenantId = defaultTenant?.id || envTenantId || 'a81106b0-256d-478e-a528-e049103b404d';
  const defaultApi = new XenoAPI(defaultTenantId, apiBase);

  const fetchTenants = async () => {
    try {
      const response = await defaultApi.getAllTenants();
      setTenants(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedTenant(defaultTenantId || response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setSelectedTenant(defaultTenantId);
      setTenants([{
        id: defaultTenantId,
        storeName: defaultTenant?.storeName || 'FDE Xeno Demo Store',
        shopDomain: defaultTenant?.shopDomain || 'fde-xeno.myshopify.com'
      }]);
    }
  };

  const fetchData = async (tenantId) => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const api = new XenoAPI(tenantId, apiBase);
      const [dashboard, customers, trends] = await Promise.all([
        api.getDashboard(),
        api.getTopCustomers(),
        api.getRevenueTrends()
      ]);
      setDashboardData(dashboard.data);
      setTopCustomers(customers.data || []);
      setRevenueTrends(trends.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setDashboardData({
        overview: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 },
        recentOrders: []
      });
      setTopCustomers([]);
      setRevenueTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantChange = (newTenantId) => {
    setSelectedTenant(newTenantId);
    fetchData(newTenantId);
  };

  const handleSync = async () => {
    if (!selectedTenant) return;
    setSyncing(true);
    try {
      const api = new XenoAPI(selectedTenant, apiBase);
      await api.triggerSync();
      await fetchData(selectedTenant);
      setToast({ message: 'Sync completed successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Sync failed. Please try again.', type: 'error' });
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchData(selectedTenant);
    }
  }, [selectedTenant]);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-indigo-100 mx-auto animate-ping"></div>
          </div>
          <p className="text-xl font-semibold text-slate-700 mb-2">Loading your analytics...</p>
          <p className="text-slate-500">Fetching data from your Shopify store</p>
        </div>
      </div>
    );
  }

  const { overview, recentOrders } = dashboardData || { 
    overview: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 }, 
    recentOrders: [] 
  };

  const currentTenant = tenants.find(t => t.id === selectedTenant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <AnimatedBackground />
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg shadow-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Shopify Analytics Dashboard
              </h1>
              <p className="text-slate-600 mt-2 font-medium">
                Shopify Multi-Tenant Business Intelligence
                {currentTenant && (
                  <span className="inline-flex items-center ml-2 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 border border-indigo-200">
                    <Store className="w-4 h-4 mr-1" />
                    {currentTenant.storeName}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              )}
              <StoreSelector 
                tenants={tenants}
                selectedTenant={selectedTenant}
                onTenantChange={handleTenantChange}
                isLoading={loading}
              />
              {lastUpdated && (
                <div className="text-right bg-white/60 backdrop-blur-lg rounded-lg px-3 py-2 border border-slate-200/50">
                  <p className="text-xs text-slate-600 font-medium">Last updated</p>
                  <p className="font-semibold text-slate-800">{lastUpdated.toLocaleTimeString()}</p>
                </div>
              )}
              <button
                onClick={handleSync}
                disabled={syncing || !selectedTenant}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl font-semibold"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={overview.totalRevenue}
            icon={DollarSign}
            colorScheme="emerald"
            prefix="₹"
            trend="+12.5% this month"
          />
          <MetricCard
            title="Total Orders"
            value={overview.totalOrders}
            icon={ShoppingBag}
            colorScheme="blue"
            trend="+8.2% this week"
          />
          <MetricCard
            title="Active Customers"
            value={overview.totalCustomers}
            icon={Users}
            colorScheme="violet"
            trend="+15.3% growth"
          />
          <MetricCard
            title="Products"
            value={overview.totalProducts}
            icon={Package}
            colorScheme="amber"
            trend="100% in stock"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data={revenueTrends} />
          <ProductChart orders={recentOrders} />
        </div>

        {/* Data Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrders orders={recentOrders} />
          </div>
          <div className="lg:col-span-1">
            <TopCustomers customers={topCustomers} />
          </div>
        </div>

        {/* Footer Stats */}
        {overview.totalOrders > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-slate-200/50">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                <p className="text-2xl font-bold text-emerald-700">
                  ₹{overview.totalOrders > 0 ? Math.round(overview.totalRevenue / overview.totalOrders).toLocaleString() : 0}
                </p>
                <p className="text-emerald-600 font-medium">Average Order Value</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">
                  {overview.totalCustomers > 0 ? Math.round(overview.totalRevenue / overview.totalCustomers).toLocaleString() : 0}
                </p>
                <p className="text-blue-600 font-medium">Revenue per Customer</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border border-violet-200">
                <p className="text-2xl font-bold text-violet-700">
                  {overview.totalOrders > 0 && recentOrders.length > 0
                    ? `${Math.round((recentOrders.filter(o => o.financialStatus === 'paid').length / recentOrders.length) * 100)}%`
                    : '0%'}
                </p>
                <p className="text-violet-600 font-medium">Order Success Rate</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                <p className="text-2xl font-bold text-amber-700">
                  {overview.totalCustomers > 0
                    ? (Math.round((overview.totalOrders / overview.totalCustomers) * 10) / 10)
                    : 0}
                </p>
                <p className="text-amber-600 font-medium">Orders per Customer</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XenoDashboard;