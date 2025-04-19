import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService, orderService } from '../services/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Estas rutas son ejemplos, ajústalas según la estructura de tu API
        const [usersData, ordersData] = await Promise.all([
          userService.getProfile(),
          orderService.getAll()
        ]);
        
        setStats({
          users: usersData.data?.totalUsers || 0,
          orders: ordersData.data?.length || 0,
          products: ordersData.data?.totalProducts || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-gray-600">Manage system users</p>
            <div className="mt-2 text-2xl font-bold text-blue-700">{stats.users}</div>
            <button className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm">
              View Details
            </button>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-gray-600">View and manage orders</p>
            <div className="mt-2 text-2xl font-bold text-green-700">{stats.orders}</div>
            <button className="mt-3 bg-green-500 text-white px-3 py-1 rounded text-sm">
              View Details
            </button>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-gray-600">Manage product inventory</p>
            <div className="mt-2 text-2xl font-bold text-purple-700">{stats.products}</div>
            <button className="mt-3 bg-purple-500 text-white px-3 py-1 rounded text-sm">
              View Details
            </button>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h2 className="text-xl font-semibold mb-2">Analytics</h2>
            <p className="text-gray-600">View system analytics</p>
            <button className="mt-3 bg-yellow-500 text-white px-3 py-1 rounded text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 