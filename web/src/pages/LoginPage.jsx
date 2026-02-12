import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { ShieldAlert } from 'lucide-react';

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
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/validate`, { nic });
            if (response.status === 200) {
                localStorage.setItem('customer', JSON.stringify(response.data));
                navigate('/booking');
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError('NIC no encontrado, por favor verifica tu factura.');
            } else {
                setError('Ocurrió un error. Inténtalo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <div className="text-center mb-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-accent tracking-tight">Acceso Cliente</h2>
                    <p className="text-secondary font-medium mt-2">Gestiona tu conexión de campo</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label="Número NIC"
                        id="nic"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                        placeholder="Introduce tu NIC"
                        required
                        error={error}
                    />

                    <Button type="submit" disabled={loading || !nic}>
                        {loading ? 'Validando...' : 'Entrar ahora'}
                    </Button>
                </form>

                <p className="text-center text-xs text-secondary mt-8 leading-relaxed">
                    Al ingresar, aceptas nuestra política de privacidad y términos de servicio de Electra.
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;
