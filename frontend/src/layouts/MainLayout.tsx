import { useState, useEffect, useRef, FC, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { 
  Menu, X, LogOut, Home, Users, Package, ShoppingCart, 
  BookOpen, Settings, Bell, AlertTriangle, Gift, Info, Trash2, Check 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const MainLayout: FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Notification states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.list();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing or item click
    try {
      await notificationAPI.delete(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Inventory', icon: Package, path: '/inventory' },
    { label: 'Sales', icon: ShoppingCart, path: '/sales' },
    { label: 'Orders', icon: BookOpen, path: '/orders' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle size={16} className="text-red-400" />;
      case 'new_order': return <ShoppingCart size={16} className="text-gold" />;
      case 'birthday':
      case 'anniversary': return <Gift size={16} className="text-pink-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-dark-card border-r border-dark-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold text-gold tracking-wide">Ganesh Beda</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-dark-bg rounded transition"
            >
              {sidebarOpen ? <X size={20} className="text-gold" /> : <Menu size={20} className="text-gold" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-bg text-gray-400 hover:text-gold transition"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="text-sm">
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 p-2 text-red-400 hover:bg-red-500/10 rounded transition"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-dark-card border-b border-dark-border px-8 py-4 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Welcome, {user?.name}</h2>
            
            <div className="flex items-center space-x-6">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 hover:bg-dark-bg rounded-lg text-gray-400 hover:text-gold transition relative"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white font-bold rounded-full w-4.5 h-4.5 text-[10px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="p-3.5 border-b border-dark-border flex items-center justify-between bg-dark-bg/40">
                      <h3 className="text-sm font-bold text-white">Notifications ({unreadCount})</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-bold text-gold hover:text-gold-light hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto divide-y divide-dark-border/40">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-500">No alerts or notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                            className={`p-3 flex gap-2.5 items-start transition cursor-pointer hover:bg-dark-bg/20 ${!notif.isRead ? 'bg-gold/5 border-l-2 border-gold' : ''}`}
                          >
                            <div className="p-1.5 rounded bg-dark-bg mt-0.5">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                              <div className="text-[9px] text-gray-500 mt-1.5">{new Date(notif.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col gap-1 items-end self-stretch justify-between">
                              {!notif.isRead && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                                  className="text-gold hover:text-gold-light" 
                                  title="Mark Read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button 
                                onClick={(e) => handleDeleteNotification(notif._id, e)}
                                className="text-gray-500 hover:text-red-400 transition" 
                                title="Delete alert"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-400 border-l border-dark-border pl-6 hidden sm:block">
                CRM Management System
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
