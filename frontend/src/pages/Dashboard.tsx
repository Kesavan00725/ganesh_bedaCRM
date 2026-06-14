import { useEffect, useState } from 'react';
import { dashboardAPI, orderAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { 
  Users, ShoppingBag, TrendingUp, AlertTriangle, Clock, 
  CheckCircle, PlusCircle, UserPlus, Settings, FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface KPI {
  totalCustomers: number;
  totalProducts: number;
  totalSales: number;
  monthlyRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface ActivityItem {
  id: string;
  type: 'customer' | 'sale' | 'order';
  title: string;
  subtitle: string;
  amount?: string;
  date: string;
  badge?: string;
  badgeColor?: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

interface PendingOrder {
  _id: string;
  orderNumber: string;
  productType: string;
  customerId: {
    name: string;
  };
  estimatedCost: number;
  status: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [salesTrendData, setSalesTrendData] = useState<any>(null);
  
  // Role specific states
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load KPIs
      const kpiRes = await dashboardAPI.kpis();
      setKpis(kpiRes.data);

      // Load Recent Activities
      const activitiesRes = await dashboardAPI.recentActivities();
      const { recentCustomers, recentSales, pendingOrders: recOrders } = activitiesRes.data;
      
      // Compile activities
      const list: ActivityItem[] = [];
      
      recentCustomers.forEach((c: any) => {
        list.push({
          id: c._id,
          type: 'customer',
          title: `New Customer: ${c.name}`,
          subtitle: `Joined from ${c.city || 'Unknown City'}`,
          date: c.createdAt
        });
      });

      recentSales.forEach((s: any) => {
        list.push({
          id: s._id,
          type: 'sale',
          title: `Invoice ${s.saleNumber} generated`,
          subtitle: `Customer: ${s.customerId?.name || 'Walk-in'}`,
          amount: `₹${s.total.toLocaleString()}`,
          date: s.createdAt,
          badge: s.paymentMethod
        });
      });

      recOrders.forEach((o: any) => {
        list.push({
          id: o._id,
          type: 'order',
          title: `Order ${o.orderNumber} in production`,
          subtitle: `${o.productType} for ${o.customerId?.name}`,
          amount: `₹${o.estimatedCost.toLocaleString()}`,
          date: o.createdAt,
          badge: o.status
        });
      });

      // Sort activities by date descending
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(list.slice(0, 8));

      // Load Product Distribution Chart
      const distRes = await dashboardAPI.productDistribution();
      const categoriesMapped = distRes.data.labels.map((label: string) => {
        return label.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      });
      setDistributionData({
        labels: categoriesMapped,
        datasets: [{
          data: distRes.data.data,
          backgroundColor: ['#D4AF37', '#85E3FF', '#CCCCCC', '#E5E5E5'],
          borderColor: '#2a2a2a',
          borderWidth: 2,
        }]
      });

      // Load Owner Sales Trend Chart
      if (user?.role === 'owner') {
        const trendRes = await dashboardAPI.salesChart();
        setSalesTrendData({
          labels: trendRes.data.labels,
          datasets: [{
            label: 'Monthly Revenue (₹)',
            data: trendRes.data.data,
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointBackgroundColor: '#D4AF37'
          }]
        });
      }

      // Load Manager queues
      if (user?.role === 'manager' || user?.role === 'owner') {
        // Load Low Stock items
        const stockRes = await productAPI.list({ limit: 100 });
        const lowStock = stockRes.data.products.filter((p: any) => p.stock <= p.minStockLevel);
        setLowStockProducts(lowStock);

        // Load Pending orders
        const ordersRes = await orderAPI.list({ status: 'pending' });
        setPendingOrders(ordersRes.data.orders);
      }

    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick action to restock product (+10 stock)
  const handleRestock = async (productId: string, currentStock: number) => {
    try {
      await productAPI.update(productId, { stock: currentStock + 10 });
      // Reload dashboard stats
      loadDashboardData();
    } catch (error) {
      console.error('Restocking failed', error);
    }
  };

  // Quick action to approve custom order (pending -> approved)
  const handleApproveOrder = async (orderId: string, notes: string) => {
    try {
      await orderAPI.update(orderId, { status: 'approved', notes });
      loadDashboardData();
    } catch (error) {
      console.error('Order approval failed', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading dashboard...</div>;
  }

  if (!kpis) {
    return <div className="text-center py-12 text-red-400">Failed to load dashboard stats.</div>;
  }

  // Define KPI Cards based on roles
  const cards = [
    { label: 'Total Customers', value: kpis.totalCustomers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Products', value: kpis.totalProducts, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Sales', value: kpis.totalSales, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Monthly Revenue', value: `₹${kpis.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Pending Custom Orders', value: kpis.pendingOrders, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Low Stock Items', value: kpis.lowStockProducts, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' }
  ];

  // For staff, hide Monthly Revenue card
  const filteredCards = user?.role === 'staff' 
    ? cards.filter(c => c.label !== 'Monthly Revenue') 
    : cards;

  return (
    <div className="space-y-8">
      {/* Header and User greetings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{user?.role} Access Mode • Live Store Metrics</p>
        </div>
        <div className="text-sm text-gray-400 bg-dark-card border border-dark-border py-2 px-4 rounded-lg">
          📆 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-gold/30 transition shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Owner-Specific Financial Section */}
      {user?.role === 'owner' && salesTrendData && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Monthly Sales Revenue Trend</h2>
                <p className="text-gray-400 text-xs mt-0.5">Annualized historical metrics of store billings</p>
              </div>
              <span className="text-xs text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-full font-bold">Live Financials</span>
            </div>
            <div className="h-64">
              <Line 
                data={salesTrendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888' } },
                    x: { grid: { display: false }, ticks: { color: '#888' } }
                  },
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Middle Grid: Charts, Activities and Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Product Distribution & Target Trackers */}
        <div className="space-y-6">
          {/* Product Distribution Chart */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2">Product Category Distribution</h2>
            <p className="text-gray-400 text-xs mb-6">Visual breakdown of product quantities registered in inventory</p>
            {distributionData ? (
              <div className="h-60 flex justify-center items-center">
                <Doughnut 
                  data={distributionData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right', labels: { color: '#fff', boxWidth: 12, font: { size: 11 } } }
                    }
                  }} 
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No category distribution data</div>
            )}
          </div>

          {/* Staff Specific Target Tracking and Quick Shortcuts */}
          {user?.role === 'staff' && (
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Your Daily Sales Progress</h2>
                <p className="text-gray-400 text-xs mt-0.5">Track your billing progress towards daily store standards</p>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-400">Monthly Revenue: ₹{kpis.monthlyRevenue.toLocaleString()}</span>
                  <span className="text-gold">Quota Target: ₹5,000,000</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-3.5 border border-dark-border overflow-hidden">
                  <div 
                    className="bg-gold h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((kpis.monthlyRevenue / 5000000) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-gray-500 mt-1">
                  Store completion rate: {((kpis.monthlyRevenue / 5000000) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Quick Actions Panel for Staff */}
              <div className="border-t border-dark-border pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Quick Intakes Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/customers" 
                    className="flex items-center justify-between p-3 bg-dark-bg/60 border border-dark-border rounded-lg text-gray-300 hover:text-gold hover:border-gold/30 transition text-sm font-medium"
                  >
                    <span>Check-in Customer</span>
                    <UserPlus size={16} className="text-gold" />
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center justify-between p-3 bg-dark-bg/60 border border-dark-border rounded-lg text-gray-300 hover:text-gold hover:border-gold/30 transition text-sm font-medium"
                  >
                    <span>New Custom Order</span>
                    <PlusCircle size={16} className="text-gold" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Owner Quick Configuration Shortcut Panel */}
          {user?.role === 'owner' && (
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-3">Admin Administrative Shortcuts</h2>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/settings" className="flex flex-col items-center justify-center p-4 bg-dark-bg/60 border border-dark-border rounded-lg hover:border-gold/30 transition text-gray-300 hover:text-gold">
                  <Settings size={20} className="mb-2" />
                  <span className="text-xs text-center font-medium">Shop Setup</span>
                </Link>
                <Link to="/settings" className="flex flex-col items-center justify-center p-4 bg-dark-bg/60 border border-dark-border rounded-lg hover:border-gold/30 transition text-gray-300 hover:text-gold">
                  <Users size={20} className="mb-2" />
                  <span className="text-xs text-center font-medium">Team accounts</span>
                </Link>
                <Link to="/inventory" className="flex flex-col items-center justify-center p-4 bg-dark-bg/60 border border-dark-border rounded-lg hover:border-gold/30 transition text-gray-300 hover:text-gold">
                  <ShoppingBag size={20} className="mb-2" />
                  <span className="text-xs text-center font-medium">Add Products</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chronological Recent Activities */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2">Recent Store Activity</h2>
            <p className="text-gray-400 text-xs mb-6">Real-time trace log of customers, sales, and custom production orders</p>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No activities found</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="flex gap-3.5 items-start p-3 bg-dark-bg/35 border border-dark-border/40 hover:border-dark-border rounded-lg transition">
                    <div className={`p-2 rounded-lg ${
                      act.type === 'customer' ? 'bg-blue-500/10 text-blue-400' :
                      act.type === 'sale' ? 'bg-green-500/10 text-green-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {act.type === 'customer' ? <UserPlus size={16} /> :
                       act.type === 'sale' ? <FileText size={16} /> :
                       <Clock size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{act.title}</h4>
                        {act.amount && <span className="text-xs text-gold font-bold">{act.amount}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{act.subtitle}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-500">{new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.date).toLocaleDateString()}</span>
                        {act.badge && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${
                            act.badge === 'cash' || act.badge === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            act.badge === 'card' || act.badge === 'ready' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {act.badge.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Manager Approval Queues & Low Stock Widgets */}
      {(user?.role === 'manager' || user?.role === 'owner') && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          
          {/* Custom Order Approval Queue */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2">Pending Orders Approval Queue</h2>
            <p className="text-gray-400 text-xs mb-4">Authorize pending custom design orders submitted by staff</p>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No custom orders awaiting authorization</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {pendingOrders.map((order) => (
                  <div key={order._id} className="flex justify-between items-center p-3.5 bg-dark-bg/40 border border-dark-border rounded-lg text-sm">
                    <div className="space-y-0.5">
                      <div className="font-semibold font-mono text-white">{order.orderNumber}</div>
                      <div className="text-xs text-gray-400">
                        {order.productType} for <span className="text-gray-300 font-medium">{order.customerId?.name}</span>
                      </div>
                      <div className="text-xs text-gold">Estimate: ₹{order.estimatedCost.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => handleApproveOrder(order._id, 'Authorized by Manager/Admin')}
                      className="flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-black font-bold py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
                    >
                      <CheckCircle size={14} /> Approve Design
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Warning restock Panel */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2">Inventory Restocking Manager</h2>
            <p className="text-gray-400 text-xs mb-4">Quick supply triggers for items breaching minimal threshold buffers</p>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">All products are healthy in stock</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div key={p._id} className="flex justify-between items-center p-3.5 bg-dark-bg/40 border border-dark-border rounded-lg text-sm">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-xs text-gray-400">SKU: <span className="font-mono text-gray-300">{p.sku}</span></div>
                      <div className="text-xs flex items-center gap-1 text-red-400">
                        <AlertTriangle size={12} /> Stock status: {p.stock} units left
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestock(p._id, p.stock)}
                      className="bg-dark-border hover:bg-dark-border/80 border border-dark-border hover:border-gold/30 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} className="text-gold" /> Restock +10
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
