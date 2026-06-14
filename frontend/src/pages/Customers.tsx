import { useEffect, useState } from 'react';
import { customerAPI } from '../services/api';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  totalSpent: number;
  isVIP: boolean;
}

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', city: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.list({ search });
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerAPI.create(formData);
      setFormData({ name: '', phone: '', email: '', city: '' });
      setShowForm(false);
      loadCustomers();
    } catch (error) {
      console.error('Failed to add customer', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await customerAPI.delete(id);
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Customers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
          <form onSubmit={handleAddCustomer} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-2 px-4 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="col-span-2 bg-gold hover:bg-gold-dark text-black font-bold py-2 rounded transition"
            >
              Save Customer
            </button>
          </form>
        </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gold w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={loadCustomers}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Total Spent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">VIP</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-t border-dark-border hover:bg-dark-bg/50">
                    <td className="px-6 py-3 text-white">{customer.name}</td>
                    <td className="px-6 py-3 text-gray-400">{customer.phone}</td>
                    <td className="px-6 py-3 text-gray-400">{customer.email || '-'}</td>
                    <td className="px-6 py-3 text-gold">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-3">{customer.isVIP ? <span className="text-gold">★ VIP</span> : '-'}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button className="text-blue-400 hover:text-blue-300"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(customer._id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
