import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [nic, setNic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:7071/api/validate', { nic });
            if (response.status === 200) {
                localStorage.setItem('customer', JSON.stringify(response.data));
                navigate('/booking');
            }
        } catch (err) {
            setError(err.response?.data || 'NIC no válido o no encontrado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-extrabold text-primary mb-6">Bienvenido a FieldConnect</h2>
            <p className="text-gray-600 mb-8">Ingrese su Número de Identificación de Cliente (NIC) para agendar su cita.</p>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
                    <input
                        id="nic"
                        type="text"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        placeholder="Ej: 123456"
                        required
                    />
                </div>

                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {loading ? 'Verificando...' : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
