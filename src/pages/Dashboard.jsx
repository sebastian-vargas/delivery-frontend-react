import React, { useEffect, useState } from 'react';
import { logisticsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MetricasEnvios from '../components/MetricasEnvios';

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('asignacion'); // 'asignacion' o 'metricas'
  
  const [seleccion, setSeleccion] = useState({
    id_orden_envio: '',
    id_ruta: '',
    id_transportista: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rutasRes, transportistasRes, ordenesRes] = await Promise.all([
          logisticsService.getRutas(),
          logisticsService.getTransportistas(),
          logisticsService.getOrdenes()
        ]);
        
        setRutas(rutasRes.data.data || []);
        setTransportistas(transportistasRes.data.data || []);
        setOrdenes(ordenesRes.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeleccion({
      ...seleccion,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!seleccion.id_orden_envio || !seleccion.id_ruta || !seleccion.id_transportista) {
      setError('Por favor, seleccione todos los campos requeridos.');
      return;
    }
    
    try {
      setLoading(true);
      await logisticsService.create({
        id_orden_envio: parseInt(seleccion.id_orden_envio),
        id_ruta: parseInt(seleccion.id_ruta),
        id_transportista: parseInt(seleccion.id_transportista)
      });
      
      setSuccess('¡Asignación de logística realizada con éxito!');
      setError(null);
      
      // Reset selección
      setSeleccion({
        id_orden_envio: '',
        id_ruta: '',
        id_transportista: ''
      });
    } catch (err) {
      console.error('Error creating logistics assignment:', err);
      setError('Error al asignar la logística. Por favor, intente nuevamente.');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && rutas.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Delivery App</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {/* Tabs para cambiar entre secciones */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('asignacion')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'asignacion'
                  ? 'border-gray-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Asignación Logística
            </button>
            <button
              onClick={() => setActiveTab('metricas')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'metricas'
                  ? 'border-gray-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Métricas de Envíos
            </button>
          </nav>
        </div>

        {activeTab === 'asignacion' ? (
          <>
            <h5 className="text-2xl font-bold text-gray-900 mb-6">Panel de Asignación Logística</h5>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white text-black shadow rounded-lg p-6">
              <div className="mb-6">
                <label htmlFor="id_orden_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Orden de Envío:
                </label>
                <select 
                  id="id_orden_envio" 
                  name="id_orden_envio"
                  value={seleccion.id_orden_envio}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione una orden</option>
                  {ordenes.map(orden => (
                    <option key={orden.id} value={orden.id}>
                      Guía: {orden.guia} - Estado: {orden.estado_actual}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="id_ruta" className="block text-sm font-medium text-gray-700 mb-1">
                  Ruta:
                </label>
                <select 
                  id="id_ruta" 
                  name="id_ruta"
                  value={seleccion.id_ruta}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione una ruta</option>
                  {rutas.map(ruta => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.nombre_ruta} ({ruta.origen} - {ruta.destino}, {ruta.distancia_km} km)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="id_transportista" className="block text-sm font-medium text-gray-700 mb-1">
                  Transportista:
                </label>
                <select 
                  id="id_transportista" 
                  name="id_transportista"
                  value={seleccion.id_transportista}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un transportista</option>
                  {transportistas.map(transportista => (
                    <option key={transportista.id} value={transportista.id} className={!transportista.disponible ? "text-gray-400" : ""}>
                      {transportista.nombre_usuario} - {transportista.tipo_vehiculo} ({transportista.placa_vehiculo})
                      {!transportista.disponible && " - No Disponible"}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading || !seleccion.id_orden_envio || !seleccion.id_ruta || !seleccion.id_transportista}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Procesando...' : 'Asignar Logística'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <MetricasEnvios />
        )}
      </main>
    </div>
  );
}

export default Dashboard; 