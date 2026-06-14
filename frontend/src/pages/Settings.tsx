import React, { useEffect, useState } from 'react';
import { settingsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Users, UserPlus, Save, ShieldAlert, Trash2, CheckCircle2, User } from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
}

export const Settings = () => {
  const { user: currentUser } = useAuth();
  const [shopSettings, setShopSettings] = useState({
    shopName: '',
    gstNumber: '',
    address: '',
    phone: '',
    email: '',
    logo: ''
  });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'users'

  // User form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: ''
  });
  const [userSuccessMessage, setUserSuccessMessage] = useState('');
  const [userErrorMessage, setUserErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
    if (currentUser?.role === 'owner') {
      loadUsers();
    }
  }, [currentUser]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      if (response.data) {
        setShopSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await settingsAPI.listUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await settingsAPI.update(shopSettings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessMessage('');
    setUserErrorMessage('');
    try {
      await authAPI.register(newUser);
      setUserSuccessMessage(`Successfully registered ${newUser.name} as ${newUser.role}`);
      setNewUser({ name: '', email: '', password: '', role: 'staff', phone: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Failed to create user', error);
      setUserErrorMessage(error.response?.data?.error || 'Registration failed. Check if email exists.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own profile');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await settingsAPI.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const isOwner = currentUser?.role === 'owner';

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading settings...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure shop details, taxation rules, and security credentials</p>
      </div>

      {isOwner ? (
        <div className="flex space-x-4 mb-6 border-b border-dark-border">
          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-3 px-2 font-semibold transition ${activeTab === 'shop' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="flex items-center gap-2">
              <SettingsIcon size={18} /> Store Configuration
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 font-semibold transition ${activeTab === 'users' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="flex items-center gap-2">
              <Users size={18} /> Team & User Accounts
            </span>
          </button>
        </div>
      ) : null}

      {/* Shop Settings Tab */}
      {(activeTab === 'shop' || !isOwner) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <SettingsIcon size={20} className="text-gold" />
              <span>Store Configuration Profiles</span>
            </h2>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Shop / Business Name</label>
                  <input
                    type="text"
                    value={shopSettings.shopName}
                    onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50"
                    disabled={!isOwner}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">GST Identification Number (GSTIN)</label>
                  <input
                    type="text"
                    value={shopSettings.gstNumber}
                    onChange={(e) => setShopSettings({ ...shopSettings, gstNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50"
                    disabled={!isOwner}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Store Support Phone</label>
                  <input
                    type="text"
                    value={shopSettings.phone}
                    onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50"
                    disabled={!isOwner}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Store Email Address</label>
                  <input
                    type="email"
                    value={shopSettings.email}
                    onChange={(e) => setShopSettings({ ...shopSettings, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50"
                    disabled={!isOwner}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Physical Store Address</label>
                <textarea
                  value={shopSettings.address}
                  onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold h-24 resize-none disabled:opacity-50"
                  disabled={!isOwner}
                  required
                />
              </div>

              {isOwner ? (
                <div className="flex justify-end pt-4 border-t border-dark-border">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-black font-bold py-2.5 px-6 rounded-lg transition disabled:opacity-50 shadow-md shadow-gold/10"
                  >
                    <Save size={18} />
                    <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              ) : null}
            </form>
          </div>

          <div className="space-y-6">
            {/* User Profile Info */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-gold" />
                <span>Your Account Profile</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gold text-black rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{currentUser?.name}</h3>
                    <p className="text-gray-400 text-xs capitalize">{currentUser?.role}</p>
                  </div>
                </div>
                <div className="border-t border-dark-border pt-4 text-sm space-y-2 text-gray-300">
                  <div><span className="text-gray-500">Email:</span> {currentUser?.email}</div>
                  <div><span className="text-gray-500">ID:</span> <span className="font-mono text-xs">{currentUser?.id}</span></div>
                </div>
              </div>
            </div>

            {/* Readonly info notice */}
            {!isOwner && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm p-4 rounded-xl flex gap-3">
                <ShieldAlert size={20} className="flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Role Restrictions Apply</h4>
                  <p className="mt-1 text-xs text-gray-400">
                    Store settings, User profiles additions, and GST tax codes can only be modified by the business Owner. Contact administrative owner for security overrides.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Tab (Owner only) */}
      {activeTab === 'users' && isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users size={20} className="text-gold" />
              <span>Register Team User Directory</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg/60 border-b border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gold uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gold uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gold uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gold uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 text-sm">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-dark-bg/35 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                          u.role === 'owner' ? 'bg-gold/15 text-gold border border-gold/30' :
                          u.role === 'manager' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{u.phone || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          disabled={u._id === currentUser?.id}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Form */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus size={20} className="text-gold" />
              <span>Create Account</span>
            </h2>

            {userSuccessMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500/25 text-green-300 text-xs rounded-lg mb-4 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>{userSuccessMessage}</span>
              </div>
            )}

            {userErrorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-300 text-xs rounded-lg mb-4 flex items-center gap-1.5">
                <ShieldAlert size={16} />
                <span>{userErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@ganeshbeda.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Mobile Phone</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Access Permission Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                >
                  <option value="staff">Staff (Limited view)</option>
                  <option value="manager">Manager (Production/Inventory)</option>
                  <option value="owner">Owner (Full Admin permissions)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Credentials Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-black font-bold py-2.5 rounded-lg transition font-semibold shadow-md shadow-gold/10"
              >
                Create Account Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
