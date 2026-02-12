import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Calendar, Clock, User, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../api/AuthContext';
import { useNotification } from '../api/NotificationContext';

const BookingPage = () => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('AM');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState('');
    const [adminSearchQuery, setAdminSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const { showNotification } = useNotification();

    const fetchHistory = async (targetUserId = null) => {
        try {
            const url = targetUserId && authUser.Role === 'Admin'
                ? `/management/customer/${targetUserId}/appointments`
                : '/appointments/me';
            const res = await apiClient.get(url);
            setAppointments(res.data);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    useEffect(() => {
        fetchHistory(selectedCustomer?.Id);
    }, [selectedCustomer]);

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setAdminSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const res = await apiClient.get(`/management/customers/search?q=${query}`);
            setSearchResults(res.data);
            setShowResults(true);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setAdminSearchQuery(customer.Name);
        setShowResults(false);
        showNotification(`Cliente: ${customer.Name} seleccionado`, 'success');
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const targetNIC = authUser.Role === 'Admin' ? selectedCustomer?.NIC : authUser.NIC;
        if (!targetNIC) {
            showNotification('Debes seleccionar un cliente primero.', 'error');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/schedule', {
                nic: targetNIC,
                date,
                slot,
                time
            });
            showNotification('¡Cita agendada con éxito!', 'success');
            navigate('/success');
        } catch (err) {
            showNotification(err.response?.data?.Message || 'Error al agendar. Verifica los 5 días de anticipación.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = {
        AM: ['08:00', '09:00', '10:00', '11:00'],
        PM: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left Column: Form */}
            <div className="lg:col-span-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-secondary hover:text-primary mb-6 transition-colors font-semibold group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Regresar
                </button>
            </div>

            <div className="lg:col-span-7 space-y-6">
                {authUser.Role === 'Admin' ? (
                    <Card className="p-6 border-dashed border-2 border-primary/30 overflow-visible relative z-20 mb-8">
                        <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" /> Buscar Cliente (NIC o Nombre)
                        </h3>
                        <div className="relative">
                            <Input
                                placeholder="Escribe para buscar..."
                                value={adminSearchQuery}
                                onChange={handleSearchChange}
                                className="w-full"
                                onFocus={() => adminSearchQuery.length >= 2 && setShowResults(true)}
                            />
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-primary/20 max-h-60 overflow-y-auto divide-y divide-primary/5 animation-in slide-in-from-top-2">
                                    {searchResults.map((res) => (
                                        <button
                                            key={res.Id}
                                            onClick={() => handleSelectCustomer(res)}
                                            className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors group"
                                        >
                                            <div>
                                                <p className="font-black text-accent group-hover:text-primary">{res.Name}</p>
                                                <p className="text-xs text-secondary font-mono opacity-70">NIC: {res.NIC}</p>
                                            </div>
                                            <Search className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedCustomer && (
                            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between animate-in zoom-in-95">
                                <div>
                                    <p className="text-xs font-black text-secondary uppercase">Cliente Seleccionado</p>
                                    <p className="text-xl font-black text-accent">{selectedCustomer.Name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-secondary uppercase">NIC</p>
                                    <p className="font-mono text-lg font-bold">{selectedCustomer.NIC}</p>
                                </div>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="bg-primary p-4 md:p-6 rounded-2xl shadow-lg border border-primary/20 flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 p-2.5 md:p-3 rounded-xl">
                                <User className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80">Cliente</p>
                                <h3 className="text-lg md:text-xl font-black">{authUser.Name}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <Card className="relative z-10">
                    <h2 className="text-2xl font-black text-accent mb-8 flex items-center">
                        <Calendar className="w-7 h-7 mr-3 text-primary" />
                        {authUser.Role === 'Admin' ? 'Agendar para el Cliente' : 'Agendar Nueva Cita'}
                    </h2>

                    <form onSubmit={handleSchedule} className="space-y-8">
                        <Input
                            label="Selecciona la fecha"
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="text-lg"
                        />

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-accent/80 ml-1 flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> Franja Horaria
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSlot('AM')}
                                    className={`py-6 md:py-8 rounded-2xl font-black text-xl border-4 transition-all ${slot === 'AM'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-surface bg-white text-secondary hover:border-primary-light'
                                        }`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSlot('PM')}
                                    className={`py-6 md:py-8 rounded-2xl font-black text-xl border-4 transition-all ${slot === 'PM'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-surface bg-white text-secondary hover:border-primary-light'
                                        }`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-accent/80 ml-1 flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> Hora Específica
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {timeSlots[slot].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTime(t)}
                                        className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${time === t
                                            ? 'border-primary bg-primary text-white shadow-lg'
                                            : 'border-surface bg-white text-secondary hover:border-primary/50'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={loading || !date || !time || (authUser.Role === 'Admin' && !selectedCustomer)} className="py-6 text-xl">
                            {loading ? 'Confirmando...' : 'Confirmar Agenda'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Right Column: History Preview */}
            <div className="lg:col-span-5">
                <Card className="bg-surface/50 border-dashed border-2 border-surface h-full">
                    <h3 className="text-lg font-black text-accent mb-6 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-primary" />
                        {authUser.Role === 'Admin' ? (selectedCustomer ? `Historial de ${selectedCustomer.Name}` : 'Historial del Cliente') : 'Tus Citas Recientes'}
                    </h3>

                    <div className="space-y-4">
                        {appointments.length === 0 ? (
                            <div className="text-center py-12 text-secondary opacity-60">
                                <Calendar className="mx-auto mb-3 opacity-20" size={48} />
                                <p className="text-sm font-medium">No hay citas en el historial.</p>
                            </div>
                        ) : (
                            appointments.slice(0, 5).map(app => (
                                <div key={app.Id} className="bg-white p-4 rounded-xl shadow-sm border border-surface flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-primary uppercase">{app.Date}</p>
                                        <p className="text-sm font-bold text-accent">{app.Slot === 'AM' ? 'Mañana' : 'Tarde'}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${app.Status === 'Completada' ? 'bg-green-100 text-green-700' :
                                        app.Status === 'Cancelada' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {app.Status}
                                    </span>
                                </div>
                            ))
                        )}
                        {appointments.length > 5 && (
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full py-2 text-xs font-black text-primary hover:underline"
                            >
                                Ver historial completo
                            </button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BookingPage;
