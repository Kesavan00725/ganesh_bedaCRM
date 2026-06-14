import React, { useEffect, useState } from 'react';
import { salesAPI, customerAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, User, ShoppingCart, PlusCircle, Trash, Eye, Printer, CreditCard } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Sale {
  _id: string;
  saleNumber: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
  };
  items: SaleItem[];
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export const Sales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Billing states
  const [invoiceCustomer, setInvoiceCustomer] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 }
  ]);
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    loadSales();
    loadCustomers();
    loadProducts();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.list();
      let data = response.data.sales;
      
      if (search) {
        const query = search.toLowerCase();
        data = data.filter((s: Sale) => 
          s.saleNumber.toLowerCase().includes(query) ||
          s.customerId?.name.toLowerCase().includes(query) ||
          s.customerId?.phone.includes(query) ||
          s.paymentMethod.toLowerCase().includes(query)
        );
      }
      setSales(data);
    } catch (error) {
      console.error('Failed to load sales', error);
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

  const loadProducts = async () => {
    try {
      const response = await productAPI.list({ limit: 100 });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to load products', error);
    }
  };

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const items = [...invoiceItems];
    items.splice(index, 1);
    setInvoiceItems(items);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...invoiceItems];
    if (field === 'productId') {
      items[index].productId = value;
      // Default quantity to 1 when product selected
      items[index].quantity = 1;
    } else if (field === 'quantity') {
      items[index].quantity = Number(value);
    }
    setInvoiceItems(items);
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((acc, item) => {
      const prod = products.find(p => p._id === item.productId);
      if (prod) {
        return acc + (prod.price * item.quantity);
      }
      return acc;
    }, 0);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate stock
    for (const item of invoiceItems) {
      const prod = products.find(p => p._id === item.productId);
      if (!prod) {
        alert('Please select valid products');
        return;
      }
      if (prod.stock < item.quantity) {
        alert(`Insufficient stock for ${prod.name}. Stock available: ${prod.stock}`);
        return;
      }
    }

    try {
      await salesAPI.create({
        customerId: invoiceCustomer,
        items: invoiceItems,
        discount: Number(discount),
        paymentMethod,
        notes
      });

      // Clear form
      setInvoiceCustomer('');
      setInvoiceItems([{ productId: '', quantity: 1 }]);
      setDiscount('0');
      setPaymentMethod('cash');
      setNotes('');
      setShowCreateModal(false);
      
      // Reload inventory products to update stock displays
      loadProducts();
      loadSales();
    } catch (error: any) {
      console.error('Failed to create sale', error);
      alert(error.response?.data?.error || 'Failed to create sale');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel/delete this invoice? This will restore stock to inventory.')) return;
    try {
      await salesAPI.delete(id);
      loadSales();
      loadProducts();
    } catch (error) {
      console.error('Failed to delete sale', error);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = calculateSubtotal();
  const discValue = Number(discount) || 0;
  const gstValue = (subtotal - discValue) * 0.18;
  const totalValue = subtotal - discValue + gstValue;

  const isOwnerOrManager = user?.role === 'owner' || user?.role === 'manager';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Sales & Billing</h1>
          <p className="text-gray-400 text-sm mt-1">Generate tax invoices, view sales journals, and log customer receipts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 bg-gold hover:bg-gold-dark text-black font-bold py-2.5 px-5 rounded-lg transition shadow-lg shadow-gold/10 self-start sm:self-auto"
        >
          <Plus size={20} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gold w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Invoice #, Customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={loadSales}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading invoices...</div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No invoices found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg/60 border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Invoice No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Subtotal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">GST (18%)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gold uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gold uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-dark-bg/35 transition-colors">
                    <td className="px-6 py-4 text-white font-semibold font-mono">{sale.saleNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{sale.customerId?.name || 'Walk-in'}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{sale.customerId?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-white">₹{sale.subtotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400">₹{sale.gstAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400">-₹{sale.discount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gold font-bold">₹{sale.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-dark-bg text-gray-300 border border-dark-border capitalize">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(sale)}
                        className="text-gold hover:text-gold-light transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {isOwnerOrManager && (
                        <button
                          onClick={() => handleDeleteSale(sale._id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete/Void Invoice"
                        >
                          <Trash size={18} />
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

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:absolute print:inset-0">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Modal header (hide during print) */}
            <div className="p-6 border-b border-dark-border flex items-center justify-between print:hidden">
              <h2 className="text-xl font-bold text-white">Tax Invoice</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 bg-gold hover:bg-gold-dark text-black px-3 py-1.5 rounded-lg text-sm font-bold transition"
                >
                  <Printer size={16} /> Print
                </button>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white font-bold text-lg">&times;</button>
              </div>
            </div>

            {/* Print Area */}
            <div className="p-8 space-y-6 print:text-black">
              {/* Header Details */}
              <div className="flex justify-between items-start border-b border-dark-border/40 pb-4 print:border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gold print:text-black">GANESH BEDA JEWELLERY</h3>
                  <p className="text-gray-400 text-sm mt-1 print:text-gray-600">GSTIN: 27AABCT5055H1Z0</p>
                  <p className="text-gray-400 text-xs print:text-gray-600">123 Jewelry Lane, Premium Mall</p>
                </div>
                <div className="text-right">
                  <h4 className="text-lg font-bold text-white print:text-black uppercase">TAX INVOICE</h4>
                  <p className="font-mono text-gold font-semibold mt-1 print:text-black">{selectedSale.saleNumber}</p>
                  <p className="text-gray-400 text-xs mt-1 print:text-gray-600">Date: {new Date(selectedSale.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider print:text-gray-500">Billed To:</p>
                  <p className="text-white font-bold mt-1 print:text-black">{selectedSale.customerId?.name || 'Walk-in Customer'}</p>
                  <p className="text-gray-400 text-sm mt-0.5 print:text-gray-600">Ph: {selectedSale.customerId?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider print:text-gray-500">Payment Status:</p>
                  <p className="text-green-400 font-bold mt-1 uppercase print:text-green-700">Paid</p>
                  <p className="text-gray-400 text-sm mt-0.5 print:text-gray-600">Via: <span className="uppercase">{selectedSale.paymentMethod}</span></p>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-dark-border/40 bg-dark-bg/20 print:bg-gray-100 print:border-gray-300">
                    <th className="py-2 text-left text-xs font-semibold text-gold print:text-black uppercase">Product Name</th>
                    <th className="py-2 text-right text-xs font-semibold text-gold print:text-black uppercase">Price</th>
                    <th className="py-2 text-center text-xs font-semibold text-gold print:text-black uppercase">Qty</th>
                    <th className="py-2 text-right text-xs font-semibold text-gold print:text-black uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/20 print:divide-gray-200">
                  {selectedSale.items.map((item, idx) => (
                    <tr key={idx} className="print:text-black">
                      <td className="py-2.5 text-white print:text-black">{item.productName}</td>
                      <td className="py-2.5 text-right text-gray-300 print:text-black">₹{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-center text-gray-300 print:text-black">{item.quantity}</td>
                      <td className="py-2.5 text-right text-white font-medium print:text-black">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="border-t border-dark-border/40 pt-4 flex justify-between items-start print:border-gray-300">
                <div className="w-1/2">
                  {selectedSale.notes && (
                    <>
                      <p className="text-gray-400 text-xs font-semibold uppercase print:text-gray-500">Invoice Notes:</p>
                      <p className="text-gray-400 text-sm mt-1 print:text-gray-600 italic">"{selectedSale.notes}"</p>
                    </>
                  )}
                </div>
                <div className="w-1/2 md:w-5/12 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400 print:text-gray-600">
                    <span>Subtotal:</span>
                    <span className="text-white print:text-black">₹{selectedSale.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between text-red-400 print:text-red-600">
                      <span>Discount:</span>
                      <span>-₹{selectedSale.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400 print:text-gray-600">
                    <span>GST ({selectedSale.gstRate}%):</span>
                    <span className="text-white print:text-black">₹{selectedSale.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-dark-border/40 pt-2 print:border-gray-300">
                    <span className="text-gold print:text-black">Grand Total:</span>
                    <span className="text-gold print:text-black">₹{selectedSale.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="text-center text-xs text-gray-500 border-t border-dark-border/20 pt-6 mt-8 print:text-gray-500 print:border-gray-200">
                <p>This is a computer-generated tax invoice. No signature is required.</p>
                <p className="mt-1">Thank you for your business with Ganesh Beda Jewellery!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Billing Builder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart size={20} className="text-gold" />
                <span>New Tax Invoice Billing</span>
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Customer Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User size={16} className="text-gold" /> Select Customer
                </label>
                <select
                  value={invoiceCustomer}
                  onChange={(e) => setInvoiceCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <ShoppingCart size={16} className="text-gold" /> Invoice Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-gold hover:text-gold-light flex items-center gap-1 font-bold"
                  >
                    <PlusCircle size={14} /> Add Product Row
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map((item, idx) => {
                    const selectedProduct = products.find(p => p._id === item.productId);
                    const stockText = selectedProduct ? `Stock: ${selectedProduct.stock}` : '';
                    const priceText = selectedProduct ? `₹${selectedProduct.price.toLocaleString()}` : '';

                    return (
                      <div key={idx} className="flex gap-3 items-end bg-dark-bg/30 border border-dark-border/40 p-3 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Product</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-white text-sm focus:outline-none focus:border-gold"
                            required
                          >
                            <option value="">-- Choose Item --</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} (SKU: {p.sku}) [Price: ₹{p.price.toLocaleString()} | Stock: {p.stock}]
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            max={selectedProduct?.stock || 999}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-white text-sm focus:outline-none focus:border-gold text-center font-bold"
                            required
                          />
                        </div>
                        <div className="w-28 text-right self-center pt-4">
                          <div className="text-[10px] text-gray-500">Unit: {priceText || '-'}</div>
                          <div className="text-gold font-bold text-sm">
                            ₹{selectedProduct ? (selectedProduct.price * item.quantity).toLocaleString() : '0'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={invoiceItems.length === 1}
                          className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition disabled:opacity-30"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Details & Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark-border pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <CreditCard size={16} className="text-gold" /> Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="check">Check</option>
                      <option value="online">Online / UPI Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">GST Discount (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="bg-dark-bg/40 border border-dark-border/40 p-4 rounded-lg flex flex-col justify-between space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Billing Invoice Summary</h4>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-white">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {discValue > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Discount:</span>
                        <span>-₹{discValue.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span className="text-white">₹{gstValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gold border-t border-dark-border/40 pt-2 mt-2">
                      <span>Grand Total:</span>
                      <span>₹{totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Store / Invoice Remarks</label>
                <textarea
                  placeholder="Invoice remarks or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save & Bill Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
