import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Icons } from '../../constants';

interface SpotlightCardProps {
    title: string;
    description: string;
    icon: keyof typeof Icons;
    image: string;
    color: string;
    onClick: () => void;
    delay?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ title, description, icon, image, color, onClick, delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        
        const width = rect.width;
        const height = rect.height;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const Icon = Icons[icon] || Icons.Circle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            style={{ perspective: 1000 }}
            className="w-full h-64"
        >
            <motion.div
                ref={ref}
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full h-full rounded-[30px] overflow-hidden group cursor-pointer border border-white/10 shadow-xl bg-[#0a0a0a]"
            >
                {/* Background Image - Absolute Cover */}
                <div className="absolute inset-0 w-full h-full">
                    <img src={image} alt={title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-20" style={{ transform: "translateZ(20px)" }}>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                        {/* @ts-ignore */}
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{title}</h3>
                        <p className="text-sm text-gray-300 font-medium opacity-80 group-hover:opacity-100 transition-opacity">{description}</p>
                    </div>
                </div>

                {/* Spotlight Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/10 to-transparent" />
            </motion.div>
        </motion.div>
    );
};