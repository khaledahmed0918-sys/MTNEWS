
import React, { useMemo } from 'react';

const Snowflake: React.FC<{ id: number }> = React.memo(({ id }) => {
    const style: React.CSSProperties = useMemo(() => {
        const duration = Math.random() * 5 + 10 + 's'; // 10-15s duration
        const delay = Math.random() * 5 + 's'; // 0-5s delay
        const leftPos = Math.random() * 100 + 'vw';
        const size = Math.random() * 10 + 10 + 'px'; // 10-20px size
        const opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8 opacity

        return {
            left: leftPos,
            animationDuration: duration,
            animationDelay: delay,
            fontSize: size,
            opacity: opacity
        };
    }, []);

    return <p className="Snowflake" style={style}>*</p>;
});

export const SnowEffect: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    if (!enabled) return null;
    // Reduced from 50 to 20 for initial load performance
    const flakes = Array.from({ length: 20 }).map((_, i) => <Snowflake key={i} id={i} />);
    return <div className="Snow">{flakes}</div>;
};
