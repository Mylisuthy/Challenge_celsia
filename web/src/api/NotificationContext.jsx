import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border-2 transition-all animate-in slide-in-from-right-8 duration-300 ${n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                n.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                                    n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                        'bg-sky-50 border-sky-200 text-sky-800'
                            }`}
                    >
                        <div className="shrink-0">
                            {n.type === 'success' && <CheckCircle className="w-6 h-6" />}
                            {n.type === 'error' && <XCircle className="w-6 h-6" />}
                            {n.type === 'warning' && <AlertCircle className="w-6 h-6" />}
                            {n.type === 'info' && <Info className="w-6 h-6" />}
                        </div>
                        <p className="font-bold text-sm leading-tight">{n.message}</p>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="ml-2 hover:opacity-60 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
