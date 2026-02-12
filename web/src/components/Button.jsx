import React from 'react';

const Button = ({ children, onClick, type = "button", disabled = false, variant = "primary", className = "" }) => {
    const baseStyles = "w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex justify-center items-center shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-primary text-white hover:bg-blue-700 hover:shadow-primary/30",
        secondary: "bg-white text-primary border-2 border-primary hover:bg-primary-light",
        ghost: "bg-transparent text-secondary hover:bg-surface"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
