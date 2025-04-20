import { useState } from 'react';
import { orderService } from '../services/api';

function CreateShipmentModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    paquete: {
      tipo_envio: 'paqueteria',
      peso: '',
      largo: '',
      ancho: '',
      alto: '',
      tipo_producto: ''
    },
    direccion: {
      calle: '',
      ciudad: '',
      departamento: '',
      codigo_postal: ''
    }
  });

  const handleChange = (e, section, field) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: field === 'peso' || field === 'largo' || field === 'ancho' || field === 'alto' 
          ? parseFloat(value) || '' 
          : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setOrderData(null);

    try {
      const response = await orderService.create(formData);
      setSuccess(true);
      setOrderData(response.data.data);
      // Reiniciar el formulario
      setFormData({
        paquete: {
          tipo_envio: 'paqueteria',
          peso: '',
          largo: '',
          ancho: '',
          alto: '',
          tipo_producto: ''
        },
        direccion: {
          calle: '',
          ciudad: '',
          departamento: '',
          codigo_postal: ''
        }
      });
    } catch (err) {
      console.error('Error al crear el envío:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al crear el envío');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setOrderData(null);
    setError(null);
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace clic directamente en el overlay
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  // Formatear fecha
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
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleOverlayClick}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        {/* Este elemento es para centrar el panel del modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Panel del modal */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50 relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {success ? 'Envío Creado' : 'Crear Nuevo Envío'}
                </h3>

                {error && (
                  <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}

                {success && orderData ? (
                  <div className="mt-4 text-black">
                    <div className="bg-green-100 p-3 rounded mb-4">
                      <p className="text-green-800 font-medium">¡Envío creado exitosamente! Notificación Correo y SMS, ver consola de express.js</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold">Información del Envío</h4>
                        <p>ID: {orderData.id}</p>
                        <p>Guía: <span className="font-medium text-blue-600">{orderData.guia}</span></p>
                        <p>Estado: {orderData.estado_actual}</p>
                        <p>Fecha: {formatDate(orderData.fecha_registro)}</p>
                      </div>

                      <div>
                        <h4 className="font-bold">Detalles del Paquete</h4>
                        <p>Tipo: {orderData.paquete.tipo_envio} - {orderData.paquete.tipo_producto}</p>
                        <p>Dimensiones: {orderData.paquete.dimensiones.largo} x {orderData.paquete.dimensiones.ancho} x {orderData.paquete.dimensiones.alto} cm</p>
                        <p>Peso: {orderData.paquete.peso} kg</p>
                      </div>

                      <div>
                        <h4 className="font-bold">Dirección de Entrega</h4>
                        <p>{orderData.direccion.calle}</p>
                        <p>{orderData.direccion.ciudad}, {orderData.direccion.departamento}</p>
                        <p>CP: {orderData.direccion.codigo_postal}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700">Información del Paquete</h4>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Tipo de Envío</label>
                            <select
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.paquete.tipo_envio}
                              onChange={(e) => handleChange(e, 'paquete', 'tipo_envio')}
                              required
                            >
                              <option value="paqueteria">Paquetería</option>
                              <option value="mensajeria">Mensajería</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.paquete.peso}
                              onChange={(e) => handleChange(e, 'paquete', 'peso')}
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Tipo de Producto</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.paquete.tipo_producto}
                              onChange={(e) => handleChange(e, 'paquete', 'tipo_producto')}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Largo (cm)</label>
                            <input
                              type="number"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.paquete.largo}
                              onChange={(e) => handleChange(e, 'paquete', 'largo')}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Ancho (cm)</label>
                            <input
                              type="number"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.paquete.ancho}
                              onChange={(e) => handleChange(e, 'paquete', 'ancho')}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Alto (cm)</label>
                            <input
                              type="number"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.paquete.alto}
                              onChange={(e) => handleChange(e, 'paquete', 'alto')}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700">Dirección de Entrega</h4>
                        <div className="space-y-3 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Calle</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.direccion.calle}
                              onChange={(e) => handleChange(e, 'direccion', 'calle')}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                              <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                                value={formData.direccion.ciudad}
                                onChange={(e) => handleChange(e, 'direccion', 'ciudad')}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Departamento</label>
                              <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                                value={formData.direccion.departamento}
                                onChange={(e) => handleChange(e, 'direccion', 'departamento')}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black"
                              value={formData.direccion.codigo_postal}
                              onChange={(e) => handleChange(e, 'direccion', 'codigo_postal')}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        disabled={loading}
                      >
                        {loading ? 'Creando envío...' : 'Crear Envío'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateShipmentModal; 