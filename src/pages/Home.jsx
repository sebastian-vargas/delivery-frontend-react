import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';
import CreateShipmentModal from '../components/CreateShipmentModal';
import LiveTrackingWidget from '../components/LiveTrackingWidget';

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [guia, setGuia] = useState("");
  const [orderGuia, setOrderGuia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    /*const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener productos y órdenes del backend
        const [ordersResponse] = await Promise.all([
          orderService.getByGuia(guia)
        ]);

        setOrders(ordersResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();*/
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const [ordersResponse] = await Promise.all([
        orderService.getByGuia(guia)
      ]);
      setOrderGuia(ordersResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Delivery App</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:items-start mb-6">
          <div className="flex-grow bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                  Número de Guía
                </label>
                <input
                  type="text"
                  id="guia"
                  value={guia}
                  onChange={(e) => setGuia(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
          </div>
          
          <div className="md:w-64 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">Acciones Rápidas</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Crear Nuevo Envío
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-3">Información del Envío</h2>

              <div className="border rounded-lg overflow-hidden">
                {guia && orderGuia ? (
                  <div className="divide-y">
                      <div key={orderGuia.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-lg">Información del Envío</h3>
                              <p className="font-medium">Guía: <span className="text-blue-600">{orderGuia.orden.guia}</span></p>
                              <p>Estado: <span className="font-semibold">{orderGuia.orden.estado_actual}</span></p>
                              <p>Fecha de creación: {formatDate(orderGuia.orden.created_at)}</p>
                              <p>Entrega estimada: {formatDate(orderGuia.orden.fecha_entrega)}</p>
                            </div>

                            <div>
                              <h3 className="font-bold">Dirección de Entrega</h3>
                              <p>{orderGuia.direccion.calle}</p>
                              <p>{orderGuia.direccion.ciudad}, {orderGuia.direccion.departamento}</p>
                              <p>CP: {orderGuia.direccion.codigo_postal}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold">Detalles del Paquete</h3>
                              {orderGuia.paquete.map((pkg) => (
                                <div key={pkg.id} className="border-b pb-2 mb-2 last:border-0">
                                  <p>Tipo: {pkg.tipo_envio} - {pkg.tipo_producto}</p>
                                  <p>Dimensiones: {pkg.largo} x {pkg.ancho} x {pkg.alto} cm</p>
                                  <p>Peso: {pkg.peso} kg</p>
                                </div>
                              ))}
                            </div>

                            <div>
                              <h3 className="font-bold">Historial de Envío</h3>
                              <div className="mt-2 space-y-2">
                                {orderGuia.historial.map((hist) => (
                                  <div key={hist.id} className="text-sm">
                                    <p className="font-medium">{formatDate(hist.fecha_hora)}</p>
                                    <p className="text-gray-700">{hist.observaciones}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 border-b">
                    <p className="text-sm font-medium">No se ha encontrado información</p>
                    <p className="text-sm text-gray-500">Introduzca un número de guía válido para ver el estado del envío</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            {orderGuia && <LiveTrackingWidget idOrden={orderGuia.orden.id} />}
          </div>
        </div>
      </main>

      <CreateShipmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default Home; 