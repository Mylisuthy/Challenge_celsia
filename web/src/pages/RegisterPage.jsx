import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Shield, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        NIC: '',
        Name: '',
        Email: '',
        Address: '',
        Phone: '',
        Password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/register`, formData);
            alert('¡Registro exitoso! Ahora puedes iniciar sesión con tu NIC.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.Message || 'Error al registrar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-700">
            <div className="w-full max-w-[600px] relative">
                {/* Brand Presence - Integrated layout with minimal gap */}
                <div className="text-center mb-[-0.5rem] relative z-20">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
                        <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto drop-shadow-2xl transition-transform hover:scale-105 duration-700">
                            <img src="/Logo.png" alt="Electra Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>

                <Card className="pt-10 pb-8 px-8 md:px-12 shadow-[0_30px_100px_rgba(0,0,0,0.1)] relative border-none bg-white/95 backdrop-blur-md ring-1 ring-slate-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-accent tracking-tighter">Registro de Usuario</h1>
                        <div className="h-1 w-10 bg-primary mx-auto rounded-full mt-1 mb-2" />
                        <p className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.4em]">FieldConnect Enterprise</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <Input
                                label="Cédula (NIC)"
                                placeholder="12345678"
                                value={formData.NIC}
                                onChange={(e) => setFormData({ ...formData, NIC: e.target.value })}
                                required
                            />
                            <Input
                                label="Nombre Completo"
                                placeholder="Juan Pérez"
                                value={formData.Name}
                                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                required
                            />
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                placeholder="juan@electra.com"
                                value={formData.Email}
                                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                required
                            />
                            <Input
                                label="Dirección"
                                placeholder="Calle 123 #45-67"
                                value={formData.Address}
                                onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                required
                            />
                            <Input
                                label="Teléfono"
                                placeholder="300 123 4567"
                                value={formData.Phone}
                                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                                required
                            />
                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                value={formData.Password}
                                onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-shake-slow">{error}</p>}

                        <div className="pt-4">
                            <Button type="submit" fullWidth disabled={loading} className="h-14 text-base font-black shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
                                {loading ? 'Procesando...' : 'Completar Registro Profesional'}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center mt-10">
                        <div className="pt-6 border-t border-slate-50">
                            <p className="text-secondary text-xs font-bold">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/" className="text-primary font-black hover:text-primary-dark transition-colors">
                                    Iniciar Sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
