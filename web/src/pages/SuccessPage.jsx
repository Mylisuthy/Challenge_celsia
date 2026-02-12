import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const SuccessPage = () => {
    return (
        <div className="text-center py-12 px-4 bg-white rounded-2xl shadow-xl border border-gray-50 animate-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">¡Cita Agendada!</h2>
            <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                Tu solicitud ha sido procesada con éxito. Un técnico se pondrá en contacto pronto.
            </p>

            <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-primary text-white py-3 px-8 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-primary/30"
                onClick={() => localStorage.removeItem('customer')}
            >
                <span>Volver al Inicio</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
};

export default SuccessPage;
