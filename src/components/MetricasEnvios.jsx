import React, { useState, useEffect } from 'react';
import { reportesService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MetricasEnvios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reporteData, setReporteData] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaInicio: null,
    fechaFin: null,
    estado: '',
    idTransportista: '',
    ciudad: '',
    tipoPaquete: '',
    page: 1,
    limit: 10
  });

  // Estados de los envíos para el selector
  const estadosEnvio = [
    { value: '', label: 'Todos' },
    { value: 'en_espera', label: 'En espera' },
    { value: 'en_transito', label: 'En tránsito' },
    { value: 'entregado', label: 'Entregado' }
  ];

  // Tipos de paquetes para el selector
  const tiposPaquete = [
    { value: '', label: 'Todos' },
    { value: 'mensajeria', label: 'Mensajería' },
    { value: 'paqueteria', label: 'Paquetería' }
  ];

  useEffect(() => {
    fetchReportes();
  }, [filtros.page, filtros.limit]);

  const fetchReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparamos los filtros para la API
      const filtrosParaEnviar = { ...filtros };
      
      // Convertir fechas a formato ISO si existen
      if (filtros.fechaInicio) {
        filtrosParaEnviar.fechaInicio = new Date(filtros.fechaInicio).toISOString();
      }
      
      if (filtros.fechaFin) {
        filtrosParaEnviar.fechaFin = new Date(filtros.fechaFin).toISOString();
      }
      
      // Convertir idTransportista a número si existe
      if (filtros.idTransportista) {
        filtrosParaEnviar.idTransportista = parseInt(filtros.idTransportista);
      }
      
      const response = await reportesService.getAll(filtrosParaEnviar);
      setReporteData(response.data.data);
    } catch (err) {
      console.error('Error fetching reportes:', err);
      setError('Error al cargar los datos del reporte. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value ? value : null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Resetear a la primera página cuando se aplican nuevos filtros
    setFiltros({
      ...filtros,
      page: 1
    });
    fetchReportes();
  };

  const handlePageChange = (newPage) => {
    setFiltros({
      ...filtros,
      page: newPage
    });
  };

  // Preparar datos para el gráfico de barras
  const prepareChartData = () => {
    if (!reporteData || !reporteData.metricas) return [];
    
    const { metricas } = reporteData;
    return [
      { name: 'Tiempo Promedio Entrega (h)', value: metricas.tiempoPromedioEntrega },
      { name: 'Total Envíos', value: metricas.totalEnvios },
      { name: 'Envíos Entregados', value: metricas.enviosEntregados },
      { name: 'Envíos En Tránsito', value: metricas.enviosEnTransito },
      { name: 'Envíos En Espera', value: metricas.enviosEnEspera }
    ];
  };

  // Formatear fecha para mostrar en la tabla
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Métricas de Envíos</h2>
      
      {/* Formulario de filtros */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-gray-500">
        {/* Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio:
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio || ''}
            onChange={handleDateChange}
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin:
          </label>
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin || ''}
            onChange={handleDateChange}
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado:
          </label>
          <select
            name="estado"
            value={filtros.estado}
            onChange={handleFilterChange}
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {estadosEnvio.map(estado => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad:
          </label>
          <input
            type="text"
            name="ciudad"
            value={filtros.ciudad}
            onChange={handleFilterChange}
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Tipo Paquete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Paquete:
          </label>
          <select
            name="tipoPaquete"
            value={filtros.tipoPaquete}
            onChange={handleFilterChange}
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {tiposPaquete.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Transportista */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Transportista:
          </label>
          <input
            type="number"
            name="idTransportista"
            value={filtros.idTransportista}
            onChange={handleFilterChange}
            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Botón de Filtrar */}
        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Cargando...' : 'Aplicar Filtros'}
          </button>
        </div>
      </form>

      {/* Indicador de carga */}
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
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

      {/* Gráfico de métricas */}
      {reporteData && reporteData.metricas && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Resumen de Métricas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500">Tiempo Promedio Entrega</h4>
              <p className="text-2xl font-bold text-gray-500">{reporteData.metricas.tiempoPromedioEntrega.toFixed(1)} h</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500">Porcentaje Entregados</h4>
              <p className="text-2xl font-bold text-gray-500">{reporteData.metricas.porcentajeEntregados.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500">Total Envíos</h4>
              <p className="text-2xl font-bold text-gray-500">{reporteData.metricas.totalEnvios}</p>
            </div>
          </div>
          
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4f46e5" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla de envíos */}
      {reporteData && reporteData.envios && reporteData.envios.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Detalles de Envíos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guía</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportista</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reporteData.envios.map((envio) => (
                  <tr key={envio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{envio.guia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${envio.estado_actual === 'entregado' ? 'bg-green-100 text-green-800' : 
                          envio.estado_actual === 'en_transito' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {envio.estado_actual}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{envio.direccion?.ciudad || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(envio.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(envio.fecha_entrega)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{envio.transportista?.nombre || 'No asignado'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{envio.paquete?.tipo_envio || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {reporteData.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{reporteData.envios.length}</span> de <span className="font-medium">{reporteData.totalItems}</span> resultados
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, filtros.page - 1))}
                  disabled={filtros.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, reporteData.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        pageNum === filtros.page ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(Math.min(reporteData.totalPages, filtros.page + 1))}
                  disabled={filtros.page === reporteData.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </div>
      ) : reporteData ? (
        <div className="text-center py-4 text-gray-500">No se encontraron envíos con los filtros aplicados.</div>
      ) : null}
    </div>
  );
}

export default MetricasEnvios; 