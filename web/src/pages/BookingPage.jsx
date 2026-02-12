import React, { useState, use, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, User } from 'lucide-react';

const BookingPage = () => {
    const [date, setDate] = useState('');
    const [slot, setSlot] = useState('AM');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Retrieve customer from localStorage
    const customerData = JSON.parse(localStorage.getItem('customer') || '{}');

    const handleSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:7071/api/schedule', {
                nic: customerData.NIC,
                date,
                slot
            });
            navigate('/success');
        } catch (err) {
            setError(err.response?.data?.Message || 'Error al agendar la cita. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Cliente</p>
                    <h3 className="text-xl font-bold text-gray-800">{customerData.Name}</h3>
                    <p className="text-sm text-gray-400">NIC: {customerData.NIC}</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-2" /> Agendar Nueva Cita
                </h2>

                <form onSubmit={handleSchedule} className="space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione una Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> Franja Horaria
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSlot('AM')}
                                className={`py-4 rounded-lg font-bold border-2 transition-all ${slot === 'AM'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                MAÑANA (AM)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSlot('PM')}
                                className={`py-4 rounded-lg font-bold border-2 transition-all ${slot === 'PM'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                TARDE (PM)
                            </button>
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || !date}
                        className="w-full bg-primary text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : 'Confirmar Agenda'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
