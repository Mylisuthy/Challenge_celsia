import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../api/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Phone, Mail, MapPin, ArrowLeft, Save, Calendar } from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState({
        Name: '',
        Address: '',
        Phone: '',
        BackupPhone: '',
        Email: ''
    });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileRes, appointmentsRes] = await Promise.all([
                    apiClient.get('/profile'),
                    apiClient.get('/appointments/me')
                ]);
                setProfile({
                    Name: profileRes.data.Name || '',
                    Address: profileRes.data.Address || '',
                    Phone: profileRes.data.Phone || '',
                    BackupPhone: profileRes.data.BackupPhone || '',
                    Email: profileRes.data.Email || ''
                });
                setAppointments(appointmentsRes.data);
            } catch (err) {
                console.error('Error loading profile data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/profile', profile);
            setMessage('Perfil actualizado correctamente.');
            setTimeout(() => setMessage(''), 3000);

            // Update auth context if name changed
            const stored = JSON.parse(localStorage.getItem('customer') || '{}');
            localStorage.setItem('customer', JSON.stringify({ ...stored, Name: profile.Name }));
        } catch (err) {
            alert('Error al actualizar el perfil');
        }
    };

    if (loading) return <div className="p-12 text-center font-bold text-primary animate-pulse">Cargando tu perfil seguro...</div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2 text-secondary px-0 hover:px-4">
                    <ArrowLeft size={18} /> Volver
                </Button>
                <div className="sm:text-right w-full sm:w-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                        ID: {authUser?.NIC}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile Settings */}
                <Card className="lg:col-span-2 p-6 md:p-8 lg:p-10">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-5 mb-10 text-left">
                        <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner shrink-0">
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-accent tracking-tighter leading-tight">Tu Perfil</h1>
                            <p className="text-sm font-medium text-secondary">Gestiona tu identidad y datos de contacto.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <Input
                            label="Nombre Completo"
                            icon={<User size={20} />}
                            value={profile.Name}
                            onChange={(e) => setProfile({ ...profile, Name: e.target.value })}
                            required
                        />
                        <Input
                            label="Correo Electrónico"
                            icon={<Mail size={20} />}
                            value={profile.Email}
                            onChange={(e) => setProfile({ ...profile, Email: e.target.value })}
                            required
                        />
                        <Input
                            label="Dirección de Vivienda"
                            icon={<MapPin size={20} />}
                            value={profile.Address}
                            onChange={(e) => setProfile({ ...profile, Address: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Teléfono"
                                icon={<Phone size={20} />}
                                value={profile.Phone}
                                onChange={(e) => setProfile({ ...profile, Phone: e.target.value })}
                                required
                            />
                            <Input
                                label="Teléfono Respaldo"
                                icon={<Phone size={20} />}
                                value={profile.BackupPhone}
                                onChange={(e) => setProfile({ ...profile, BackupPhone: e.target.value })}
                            />
                        </div>

                        {message && (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold animate-in fade-in slide-in-from-bottom-2">
                                {message}
                            </div>
                        )}

                        <Button type="submit" fullWidth className="h-14 gap-2 text-lg shadow-xl shadow-primary/20">
                            <Save size={22} /> Guardar Cambios
                        </Button>
                    </form>
                </Card>

                {/* Right: History Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 bg-accent border-none text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="text-primary" size={24} />
                            <h3 className="text-lg font-black tracking-tight">Mis Citas</h3>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {appointments.length === 0 ? (
                                <p className="text-sm text-secondary italic py-10 text-center">No tienes citas agendadas aún.</p>
                            ) : (
                                appointments.map(app => (
                                    <div key={app.Id} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-bold text-primary uppercase">{app.Date}</p>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${app.Status === 'Completada' ? 'bg-green-500/20 text-green-400' :
                                                app.Status === 'Cancelada' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {app.Status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold leading-tight">{app.Slot === 'AM' ? 'Mañana (8:00 - 12:00)' : 'Tarde (14:00 - 18:00)'}</p>
                                        <div className="mt-3 flex items-center gap-2 text-[10px] text-secondary">
                                            <User size={12} />
                                            <span>Asignado: {app.SpecialistName || 'Pendiente'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            fullWidth
                            className="mt-6 text-white border-white/20 hover:bg-white/10"
                            onClick={() => navigate('/booking')}
                        >
                            Agendar Nueva
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
