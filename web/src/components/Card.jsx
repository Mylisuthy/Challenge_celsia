import React from 'react';

const Card = ({ children, className = "" }) => {
    return (
        <div className={`glass-card p-8 rounded-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
