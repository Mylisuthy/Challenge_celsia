import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import { MapPin, Phone, Clock, User, CheckCircle, Navigation } from 'lucide-react';

const SpecialistDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/specialist/orders');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching specialist orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.post('/appointments/status', { id, status });
            fetchOrders();
        } catch (err) {
            alert('Error al actualizar el estado');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <div className="p-8 text-center font-bold">Cargando tu agenda técnica...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-accent">Mis Citas Asignadas</h1>
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold border border-green-200">
                    Disponibilidad: Activa
                </div>
            </div>

            {orders.length === 0 ? (
                <Card className="p-12 text-center text-secondary">
                    <p className="text-xl">No tienes citas pendientes para hoy.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order.Id} className="p-6 hover:border-primary transition-colors">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <Navigation size={20} />
                                            <span>Estado: {order.Status}</span>
                                        </div>
                                        <div className="text-secondary flex items-center gap-2">
                                            <Clock size={18} />
                                            <span>{order.Date} - {order.Slot}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <User size={20} /> {order.CustomerName}
                                        </h3>
                                        <p className="text-secondary flex items-center gap-2">
                                            <MapPin size={18} className="text-red-500" /> {order.Address || 'Dirección no especificada'}
                                        </p>
                                        <p className="text-secondary flex items-center gap-2">
                                            <Phone size={18} className="text-green-500" /> {order.Phone || 'Sin contacto'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex md:flex-col gap-2 justify-center">
                                    {order.Status === 'Pending' && (
                                        <Button onClick={() => updateStatus(order.Id, 'EnCamino')} className="bg-blue-600">
                                            Iniciar Ruta
                                        </Button>
                                    )}
                                    {order.Status === 'EnCamino' && (
                                        <Button onClick={() => updateStatus(order.Id, 'Active')} className="bg-yellow-600">
                                            Empezar Trabajo
                                        </Button>
                                    )}
                                    {(order.Status === 'Active' || order.Status === 'EnCamino') && (
                                        <Button onClick={() => updateStatus(order.Id, 'Completada')} variant="primary" className="gap-2">
                                            <CheckCircle size={18} /> Finalizar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpecialistDashboard;
