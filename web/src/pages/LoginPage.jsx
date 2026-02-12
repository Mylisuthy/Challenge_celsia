import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Shield, ArrowRight, User } from 'lucide-react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../api/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const [nic, setNic] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { nic, password });
            if (response.status === 200) {
                const user = response.data;
                login(user);

                if (user.Role === 'Admin') navigate('/admin');
                else if (user.Role === 'Specialist') navigate('/specialist');
                else navigate('/booking');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Credenciales incorrectas.');
            } else {
                setError('Ocurrió un error. Inténtalo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-700">
            <div className="w-full max-w-[350px] relative">
                {/* Brand Presence - Positioned just above the form with minimal gap */}
                <div className="text-center mb-2 relative z-20">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                        <div className="relative w-56 h-56 md:w-80 md:h-80 mx-auto drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                            <img src="/Logo.png" alt="Electra Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>

                <Card className="pt-8 pb-8 px-8 md:pt-10 md:pb-10 md:px-10 shadow-[0_30px_100px_rgba(0,0,0,0.1)] relative overflow-hidden ring-1 ring-slate-100 border-none bg-white/90 backdrop-blur-md">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-accent tracking-tight leading-none mb-1">Acceso Cliente</h2>
                        <div className="h-1 w-8 bg-primary mx-auto rounded-full mb-2" />
                        <p className="text-[10px] font-extrabold text-secondary uppercase tracking-[0.3em] opacity-60">Enterprise Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Cédula (NIC)"
                            id="nic"
                            value={nic}
                            onChange={(e) => setNic(e.target.value)}
                            placeholder="NIC de servicio"
                            required
                        />

                        <Input
                            label="Contraseña"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            error={error}
                        />

                        <div className="pt-2">
                            <Button type="submit" disabled={loading || !nic || !password} className="h-14 w-full text-base font-black shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:scale-95">
                                {loading ? 'Validando...' : 'Entrar'}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center mt-8 space-y-6">
                        <div className="pt-6 border-t border-slate-50">
                            <p className="text-secondary text-xs font-bold">
                                ¿Eres nuevo?{' '}
                                <Link to="/register" className="text-primary font-black hover:text-primary-dark transition-colors">
                                    Crea tu perfil
                                </Link>
                            </p>
                        </div>

                        <p className="text-[9px] text-secondary/30 font-black tracking-widest uppercase">
                            &copy; 2026 Electra S.A.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
