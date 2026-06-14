import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import { Plus, Search, AlertTriangle } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStockLevel: number;
  purity: string;
}

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'gold_jewelry',
    purity: '22K',
    price: '',
    stock: '',
    weight: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.list({ search });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productAPI.create({ ...formData, price: Number(formData.price), stock: Number(formData.stock) });
      setFormData({ name: '', sku: '', category: 'gold_jewelry', purity: '22K', price: '', stock: '', weight: '' });
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to add product', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-2 px-4 py-2 bg-dark-bg border border-dark-border rounded text-white" required />
            <input type="text" placeholder="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white" required />
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white">
              <option value="gold_jewelry">Gold Jewelry</option>
              <option value="diamond_jewelry">Diamond Jewelry</option>
              <option value="silver_jewelry">Silver Jewelry</option>
              <option value="platinum_jewelry">Platinum Jewelry</option>
            </select>
            <input type="number" placeholder="Price (₹)" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white" required />
            <input type="number" placeholder="Stock Quantity" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-white" required />
            <button type="submit" className="col-span-2 bg-gold hover:bg-gold-dark text-black font-bold py-2 rounded transition">Save Product</button>
          </form>
        </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gold w-5 h-5" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyUp={loadProducts} className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded text-white" />
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">SKU</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gold">Stock</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gold">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const lowStock = product.stock <= product.minStockLevel;
                  return (
                    <tr key={product._id} className={`border-t border-dark-border hover:bg-dark-bg/50 ${lowStock ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-3 text-white font-mono">{product.sku}</td>
                      <td className="px-6 py-3 text-white">{product.name}</td>
                      <td className="px-6 py-3 text-gray-400 capitalize">{product.category.replace('_', ' ')}</td>
                      <td className="px-6 py-3 text-gold">₹{product.price.toLocaleString()}</td>
                      <td className="px-6 py-3 text-white">{product.stock} units</td>
                      <td className="px-6 py-3 text-center">
                        {lowStock ? (
                          <span className="flex items-center justify-center text-red-400 space-x-1">
                            <AlertTriangle size={16} />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="text-green-400">In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
