import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function LiveTrackingWidget({ idOrden }) {
  const [currentStatus, setCurrentStatus] = useState('No conectado');
  const [statusHistory, setStatusHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Efecto para conectar y desconectar del websocket
  useEffect(() => {
    // Solo intentar conectar si hay una guía válida
    if (!idOrden) {
      setCurrentStatus('Ingrese un número de guía para seguimiento en tiempo real');
      return;
    }

    // Crear conexión al servidor de websockets
    const socketInstance = io('http://localhost:3000');

    // Eventos del socket
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setCurrentStatus('Conectado al servidor, esperando actualizaciones...');
      
      // Suscribirse a la sala específica para esta guía
      const room = `orden_${idOrden}`;
      socketInstance.emit('subscribe', room);
      
      // Añadir al historial
      addToHistory('Conectado al seguimiento en tiempo real');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setCurrentStatus('Desconectado del servidor');
      addToHistory('Desconectado del servidor');
    });

    // Evento para cambios de estado
    socketInstance.on('cambio_estado', (data) => {
      setCurrentStatus(`${data.estado} - ${data.detalles.observaciones || 'Sin observaciones'}`);
      addToHistory(`Actualización: ${data.estado} - ${data.detalles.observaciones || 'Sin observaciones'}`);
    });

    // Limpiar al desmontar
    return () => {
      if (socketInstance) {
        const room = `orden_${idOrden}`;
        socketInstance.emit('unsubscribe', room);
        socketInstance.disconnect();
      }
    };
  }, [idOrden]);

  // Función auxiliar para añadir elementos al historial
  const addToHistory = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setStatusHistory(prev => [{
      time: timestamp,
      message
    }, ...prev]); // Guardar todo el historial
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-medium">Estado en tiempo real</h3>
        <span className={`px-2 py-1 text-xs rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
      
      <div className="border rounded p-3 bg-gray-50 mb-3">
        <p className="text-green-800">{currentStatus}</p>
      </div>

      {statusHistory.length > 0 && (
        <div className="border-t pt-2">
          <p className="text-xs text-gray-500 mb-1">Historial de actualizaciones:</p>
          <div className="max-h-32 overflow-y-auto text-sm">
            {statusHistory.map((item, index) => (
              <div key={index} className="flex flex-col text-xs mb-2 border-b pb-1">
                <span className="text-gray-500">{item.time}</span>
                <span className="mt-1 text-gray-800">{item.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTrackingWidget; 