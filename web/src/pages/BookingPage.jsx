import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

const BookingPage = () => {
    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('AM');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const customerData = JSON.parse(localStorage.getItem('customer') || '{}');

    const handleSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.post('/schedule', {
                nic: customerData.NIC,
                date,
                slot
            });
            navigate('/success');
        } catch (err) {
            setError(err.response?.data?.Message || 'Error al agendar. Verifica los 15 días de anticipación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-secondary hover:text-primary transition-colors font-semibold group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Regresar
            </button>

            <div className="bg-primary p-6 rounded-2xl shadow-lg border border-primary/20 flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Identidad Cliente</p>
                        <h3 className="text-xl font-black">{customerData.Name}</h3>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">NIC</p>
                    <p className="font-mono text-lg">{customerData.NIC}</p>
                </div>
            </div>

            <Card>
                <h2 className="text-2xl font-black text-accent mb-8 flex items-center">
                    <Calendar className="w-7 h-7 mr-3 text-primary" />
                    Agendar Cita Técnica
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
                            <Clock className="w-4 h-4 mr-2" /> Franja Horaria (Recomendado)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSlot('AM')}
                                className={`py-8 rounded-2xl font-black text-xl border-4 transition-all ${slot === 'AM'
                                    ? 'border-primary bg-primary/10 text-primary shadow-inner'
                                    : 'border-surface bg-white text-secondary hover:border-primary-light'
                                    }`}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => setSlot('PM')}
                                className={`py-8 rounded-2xl font-black text-xl border-4 transition-all ${slot === 'PM'
                                    ? 'border-primary bg-primary/10 text-primary shadow-inner'
                                    : 'border-surface bg-white text-secondary hover:border-primary-light'
                                    }`}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-medium animate-pulse">{error}</div>}

                    <Button type="submit" disabled={loading || !date} className="py-6 text-xl">
                        {loading ? 'Confirmando...' : 'Confirmar Agenda Técnica'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default BookingPage;
