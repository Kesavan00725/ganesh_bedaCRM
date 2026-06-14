import React, { useEffect, useState } from 'react';
import { orderAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Calendar, DollarSign, FileText, User, Tag, Edit2, Trash2 } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface CustomOrder {
  _id: string;
  orderNumber: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
  };
  productType: string;
  description: string;
  estimatedCost: number;
  status: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

export const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    customerId: '',
    productType: '',
    description: '',
    estimatedCost: '',
    deliveryDate: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    status: '',
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const response = await orderAPI.list(params);
      
      // Filter clientside by search term if search is active
      let filteredOrders = response.data.orders;
      if (search) {
        const query = search.toLowerCase();
        filteredOrders = filteredOrders.filter((o: CustomOrder) => 
          o.orderNumber.toLowerCase().includes(query) ||
          o.productType.toLowerCase().includes(query) ||
          o.customerId?.name.toLowerCase().includes(query) ||
          o.customerId?.phone.includes(query)
        );
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.list({ limit: 100 });
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderAPI.create({
        ...createForm,
        estimatedCost: Number(createForm.estimatedCost)
      });
      setCreateForm({
        customerId: '',
        productType: '',
        description: '',
        estimatedCost: '',
        deliveryDate: '',
        notes: ''
      });
      setShowCreateModal(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  const handleEditOrderClick = (order: CustomOrder) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
      notes: order.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await orderAPI.update(selectedOrder._id, editForm);
      setShowEditModal(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this custom order?')) return;
    try {
      await orderAPI.delete(id);
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'in_production': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'ready': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const isStaff = user?.role === 'staff';
  const isOwner = user?.role === 'owner';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Custom Orders</h1>
          <p className="text-gray-400 text-sm mt-1">Design, trace, and manage personalized customer jewelry orders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 bg-gold hover:bg-gold-dark text-black font-bold py-2.5 px-5 rounded-lg transition shadow-lg shadow-gold/10 self-start sm:self-auto"
        >
          <Plus size={20} />
          <span>New Custom Order</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gold w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Order #, Category, Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={loadOrders}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in_production">In Production</option>
            <option value="ready">Ready for Pickup</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No custom orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg/60 border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Order No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Product Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Est. Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-dark-bg/35 transition-colors">
                    <td className="px-6 py-4 text-white font-semibold font-mono">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{order.customerId?.name || 'Unknown'}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{order.customerId?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-white capitalize">{order.productType}</td>
                    <td className="px-6 py-4 text-gold font-medium">₹{order.estimatedCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleEditOrderClick(order)}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Edit Order"
                      >
                        <Edit2 size={18} />
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Custom Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User size={16} className="text-gold" /> Select Customer
                </label>
                <select
                  value={createForm.customerId}
                  onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Tag size={16} className="text-gold" /> Product Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gold Engagement Ring"
                    value={createForm.productType}
                    onChange={(e) => setCreateForm({ ...createForm, productType: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={16} className="text-gold" /> Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={createForm.estimatedCost}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedCost: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-gold" /> Promised Delivery Date
                </label>
                <input
                  type="date"
                  value={createForm.deliveryDate}
                  onChange={(e) => setCreateForm({ ...createForm, deliveryDate: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <FileText size={16} className="text-gold" /> Description
                </label>
                <textarea
                  placeholder="Provide details of the custom jewelry specifications, purity requirement, stones, weight etc."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold h-20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Additional Notes</label>
                <textarea
                  placeholder="Store notes, remarks or special handling details..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold h-16 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-bg hover:bg-dark-border text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold hover:bg-gold-dark text-black font-bold rounded-lg transition"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Update Custom Order</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white font-bold">&times;</button>
            </div>
            <form onSubmit={handleUpdateOrder} className="p-6 space-y-4">
              <div className="bg-dark-bg/50 border border-dark-border/40 rounded-lg p-3 text-sm space-y-1">
                <div><span className="text-gold font-semibold">Order:</span> <span className="font-mono text-white">{selectedOrder.orderNumber}</span></div>
                <div><span className="text-gold font-semibold">Customer:</span> <span className="text-white">{selectedOrder.customerId?.name}</span></div>
                <div><span className="text-gold font-semibold">Product:</span> <span className="text-white">{selectedOrder.productType}</span></div>
                <div><span className="text-gold font-semibold">Est. Cost:</span> <span className="text-white">₹{selectedOrder.estimatedCost.toLocaleString()}</span></div>
                <div><span className="text-gold font-semibold">Description:</span> <span className="text-gray-400">{selectedOrder.description}</span></div>
              </div>

              {isStaff ? (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-lg">
                  💡 Staff Mode: You can only edit the order notes. Status and delivery date updates are locked for staff roles.
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Order Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isStaff}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="in_production">In Production</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Delivery Date</label>
                  <input
                    type="date"
                    value={editForm.deliveryDate}
                    onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isStaff}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Order Notes</label>
                <textarea
                  placeholder="Notes..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold h-28 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-dark-bg hover:bg-dark-border text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold hover:bg-gold-dark text-black font-bold rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
