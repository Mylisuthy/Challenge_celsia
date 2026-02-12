import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Users, Calendar, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';
import { useNotification } from '../api/NotificationContext';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [specialists, setSpecialists] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchNit, setSearchNit] = useState('');
    const [searchAppNit, setSearchAppNit] = useState('');
    const [selectedApp, setSelectedApp] = useState(null); // For reassign modal
    const [showSpecModal, setShowSpecModal] = useState(false);
    const [selectedSpec, setSelectedSpec] = useState(null); // For specialist management modal
    const [newSpec, setNewSpec] = useState({ NIC: '', Name: '', Email: '', Password: '' });
    const { showNotification } = useNotification();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, spRes, aRes] = await Promise.all([
                apiClient.get('/management/stats'),
                apiClient.get('/management/specialists'),
                apiClient.get('/management/appointments')
            ]);
            setStats(sRes.data);
            setSpecialists(spRes.data);
            setAppointments(aRes.data);
        } catch (err) {
            showNotification('Error al sincronizar datos regulatorios.', 'error');
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSpecialist = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/management/specialists/create', newSpec);
            setShowSpecModal(false);
            setNewSpec({ NIC: '', Name: '', Email: '', Password: '' });
            await fetchData();
            showNotification('Especialista registrado con éxito.', 'success');
        } catch (err) {
            showNotification(err.response?.data?.Message || 'Error al registrar especialista.', 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
        try {
            await apiClient.post('/management/cancel', { id });
            await fetchData();
            showNotification('Cita cancelada correctamente.', 'success');
        } catch (err) {
            showNotification('Error al intentar cancelar la cita.', 'error');
        }
    };

    const handleReassign = async (appId, specialistId) => {
        try {
            await apiClient.post('/management/reassign', { appointmentId: appId, specialistId });
            setSelectedApp(null);
            await fetchData();
            showNotification('Técnico reasignado exitosamente.', 'success');
        } catch (err) {
            showNotification('Error en la reasignación de técnico.', 'error');
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            await apiClient.post('/appointments/status', { id: appId, status: newStatus });
            await fetchData();
            showNotification(`Estado actualizado a: ${newStatus}`, 'success');
        } catch (err) {
            showNotification('Error al actualizar el estado de la cita.', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de eliminar a este técnico? Se anularán sus asignaciones pendientes.')) return;
        try {
            await apiClient.delete(`/management/specialists/delete/${userId}`);
            await fetchData();
            showNotification('Técnico eliminado del sistema.', 'success');
            setSelectedSpec(null);
        } catch (err) {
            showNotification('Error al eliminar el técnico.', 'error');
        }
    };

    const filteredSpecialists = specialists.filter(s =>
        s.NIC.toLowerCase().includes(searchNit.toLowerCase()) ||
        s.Name.toLowerCase().includes(searchNit.toLowerCase())
    );

    if (loading) return <div className="p-12 text-center animate-pulse font-black text-primary">Cargando Sistema Regulatorio...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-accent tracking-tighter">Panel de Gestión</h2>
                    <p className="text-sm font-bold text-secondary uppercase tracking-widest mt-1">Control regulatorio y operativo</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm ring-1 ring-surface w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['stats', 'specialists', 'appointments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'text-secondary hover:text-accent hover:bg-surface'
                                }`}
                        >
                            {tab === 'stats' ? 'Métricas' : tab === 'specialists' ? 'Equipo' : 'Citas'}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'stats' && (
                <div className="space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<Users />} label="Clientes" value={stats?.TotalUsers} color="blue" />
                        <StatCard icon={<Calendar />} label="Agenda Total" value={stats?.TotalAppointments} color="slate" />
                        <StatCard icon={<CheckCircle />} label="Completas" value={stats?.StatusDistribution?.find(s => s.Status === 'Completada')?.Count || 0} color="green" />
                        <StatCard icon={<XCircle />} label="Canceladas" value={stats?.StatusDistribution?.find(s => s.Status === 'Cancelada')?.Count || 0} color="red" />
                    </div>

                    <Card className="p-8">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <RefreshCw className="text-primary" size={20} /> Distribución de Operaciones
                        </h3>
                        <div className="space-y-6">
                            {['Pending', 'Active', 'EnCamino', 'Completada', 'Cancelada'].map(status => {
                                const count = stats?.StatusDistribution?.find(s => s.Status === status)?.Count || 0;
                                const percentage = stats?.TotalAppointments > 0 ? (count / stats.TotalAppointments) * 100 : 0;
                                return (
                                    <div key={status} className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-secondary">
                                            <span>{status}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="h-4 bg-surface rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-1000 rounded-full ${status === 'Completada' ? 'bg-green-500' :
                                                    status === 'Cancelada' ? 'bg-red-500' :
                                                        status === 'Pending' ? 'bg-yellow-500' : 'bg-primary'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'specialists' && (
                <Card className="p-4 md:p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-accent">Equipo Técnico</h3>
                            <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Gestión de especialistas vigentes</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-3.5 text-secondary" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por NIT..."
                                    className="w-full bg-surface/50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-bold"
                                    value={searchNit}
                                    onChange={(e) => setSearchNit(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setShowSpecModal(true)} className="px-6 py-4 flex items-center gap-2">
                                <Users size={18} /> Registrar
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-left text-xs font-black text-secondary uppercase tracking-widest px-4">
                                    <th className="pb-4 pl-4">Técnico</th>
                                    <th className="pb-4">NIT</th>
                                    <th className="pb-4">Carga Actual</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4 text-right pr-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSpecialists.map(s => {
                                    const loadPercentage = Math.min((s.CurrentLoad / 5) * 100, 100);
                                    let loadColor = 'bg-emerald-500';
                                    if (s.CurrentLoad >= 3) loadColor = 'bg-amber-500';
                                    if (s.CurrentLoad >= 5) loadColor = 'bg-rose-500';

                                    return (
                                        <tr key={s.Id} className="bg-white hover:bg-surface/5 transition-colors shadow-sm ring-1 ring-surface rounded-2xl">
                                            <td className="py-4 pl-4 rounded-l-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                                                        {s.Name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-accent leading-tight">{s.Name}</p>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-tight">{s.Email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-mono text-xs font-bold text-secondary">{s.NIC}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2.5 bg-surface rounded-full overflow-hidden shadow-inner">
                                                        <div className={`h-full transition-all duration-1000 ${loadColor}`} style={{ width: `${loadPercentage}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-black">{s.CurrentLoad}/5</span>
                                                </div>
                                            </td>
                                            <td className="text-sm font-medium text-secondary">---</td>
                                            <td className="py-4 pr-4 text-right rounded-r-2xl">
                                                <Button variant="ghost" className="text-xs font-black py-2" onClick={() => setSelectedSpec(s)}>Gestionar</Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'appointments' && (
                <Card className="p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <h3 className="text-2xl font-black text-accent">Registro de Operaciones Globales</h3>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-3.5 text-secondary" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por NIT cliente..."
                                className="w-full bg-surface/50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-bold"
                                value={searchAppNit}
                                onChange={(e) => setSearchAppNit(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {appointments.filter(app => (app.CustomerNIC || '').toLowerCase().includes(searchAppNit.toLowerCase())).map(app => (
                            <div key={app.Id} className="bg-white ring-1 ring-surface p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4 md:gap-6 flex-1 w-full">
                                    <div className="text-center min-w-[80px]">
                                        <p className="text-[10px] font-black uppercase text-secondary mb-1">{app.Date}</p>
                                        <p className="text-lg font-black text-primary leading-tight">{app.Slot}</p>
                                    </div>
                                    <div className="h-10 w-px bg-surface hidden xs:block"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-secondary uppercase truncate">Cliente: {app.CustomerName}</p>
                                        <p className="text-sm font-black text-accent mt-1 flex flex-wrap items-center gap-1 md:gap-2">
                                            Asignado a: <span className="text-primary truncate">{app.SpecialistName || '⚠️ SIN ASIGNAR'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-4">
                                    <select
                                        value={app.Status}
                                        onChange={(e) => handleUpdateStatus(app.Id, e.target.value)}
                                        className="text-[10px] font-black px-3 py-1 rounded-full uppercase cursor-pointer border-2 border-surface bg-white hover:border-primary transition-all outline-none"
                                    >
                                        {['Pending', 'Active', 'EnCamino', 'Completada', 'Cancelada'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                        <Button variant="secondary" className="px-3 md:px-4 py-2 text-xs font-black" onClick={() => setSelectedApp(app)}>Reasignar</Button>
                                        <Button variant="ghost" className="p-2 md:px-4 md:py-2 text-xs font-black text-red-600 hover:bg-red-50" onClick={() => handleCancel(app.Id)}>X</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Reassign Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-8 animate-in slide-in-from-bottom-8">
                        <h4 className="text-xl font-black mb-6">Reasignar Técnico para {selectedApp.CustomerName}</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {specialists.map(s => (
                                <button
                                    key={s.Id}
                                    onClick={() => handleReassign(selectedApp.Id, s.Id)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-surface hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <div>
                                        <p className="font-bold text-accent">{s.Name}</p>
                                        <p className="text-[10px] font-black text-secondary uppercase">Load: {s.CurrentLoad} citas activas</p>
                                    </div>
                                    <div className="font-mono text-[10px] font-bold text-primary">NIT: {s.NIC}</div>
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" fullWidth className="mt-6" onClick={() => setSelectedApp(null)}>Cerrar</Button>
                    </Card>
                </div>
            )}

            {/* Specialist Registration Modal */}
            {showSpecModal && (
                <div className="fixed inset-0 bg-accent/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 p-md-6 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-accent flex items-center gap-3">
                                <Users className="text-primary" /> Registrar Especialista
                            </h3>
                            <button onClick={() => setShowSpecModal(false)} className="text-secondary hover:text-accent p-2 hover:bg-surface rounded-xl transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSpecialist} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="NIT"
                                    placeholder="SPECXXX"
                                    required
                                    value={newSpec.NIC}
                                    onChange={(e) => setNewSpec({ ...newSpec, NIC: e.target.value })}
                                />
                                <Input
                                    label="Nombre Completo"
                                    placeholder="Juan Perez"
                                    required
                                    value={newSpec.Name}
                                    onChange={(e) => setNewSpec({ ...newSpec, Name: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                placeholder="juan@electra.com"
                                required
                                value={newSpec.Email}
                                onChange={(e) => setNewSpec({ ...newSpec, Email: e.target.value })}
                            />
                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={newSpec.Password}
                                onChange={(e) => setNewSpec({ ...newSpec, Password: e.target.value })}
                            />
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowSpecModal(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1">Confirmar Registro</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Specialist Management Modal */}
            {selectedSpec && (
                <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Gestionar Técnico</h3>
                            <button onClick={() => setSelectedSpec(null)}><XCircle /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-surface p-4 rounded-xl">
                                <p className="text-xs font-black text-secondary uppercase">Especialista</p>
                                <p className="text-lg font-bold text-accent">{selectedSpec.Name}</p>
                                <p className="text-xs font-mono">{selectedSpec.NIC}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button variant="ghost" fullWidth onClick={() => { setActiveTab('appointments'); setSelectedSpec(null); setSearchAppNit(selectedSpec.NIC); }}>
                                    Ver Citas Asignadas
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-700" fullWidth onClick={() => handleDeleteUser(selectedSpec.Id)}>
                                    Eliminar del Sistema
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <Card className={`p-6 border-l-4 ${color === 'blue' ? 'border-blue-500' :
        color === 'green' ? 'border-green-500' :
            color === 'red' ? 'border-red-500' : 'border-accent'
        }`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-inner ${color === 'blue' ? 'bg-blue-50 text-blue-600' :
                color === 'green' ? 'bg-green-50 text-green-600' :
                    color === 'red' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-accent'
                }`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black uppercase text-secondary tracking-widest">{label}</p>
                <p className="text-3xl font-black tracking-tighter text-accent">{value || 0}</p>
            </div>
        </div>
    </Card>
);

export default AdminDashboard;
