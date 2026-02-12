import React from 'react';

const Input = ({ label, id, type = "text", value, onChange, placeholder, required = false, error = "" }) => {
    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-accent/80 ml-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full px-5 py-4 rounded-xl border-2 transition-all outline-none text-lg ${error
                        ? "border-red-400 focus:border-red-500 bg-red-50/30"
                        : "border-gray-100 focus:border-primary bg-white shadow-sm"
                    }`}
            />
            {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
        </div>
    );
};

export default Input;
