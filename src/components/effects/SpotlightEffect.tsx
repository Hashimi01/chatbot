import React, { useEffect, useRef } from 'react';

export const SpotlightEffect: React.FC = () => {
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (divRef.current) {
                const x = e.clientX;
                const y = e.clientY;
                divRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(0, 217, 255, 0.06), transparent 40%)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={divRef}
            className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-300"
            style={{
                background: 'radial-gradient(600px circle at 0px 0px, rgba(0, 217, 255, 0.06), transparent 40%)',
            }}
        />
    );
};
