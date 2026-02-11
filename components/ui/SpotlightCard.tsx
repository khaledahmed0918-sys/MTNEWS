
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Icons } from '../../constants';

interface SpotlightCardProps {
    title: string;
    description: string;
    icon: keyof typeof Icons;
    color: string;
    onClick: () => void;
    delay?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ title, description, icon, color, onClick, delay = 0 }) => {
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
                {/* Abstract Background Shapes (No Images) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0a0a]">
                    <div className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${color} opacity-20 blur-[80px] rounded-full group-hover:opacity-30 transition-opacity duration-700`} />
                    <div className={`absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr ${color} opacity-10 blur-[60px] rounded-full group-hover:opacity-20 transition-opacity duration-700`} />
                    
                    {/* Geometric Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                    
                    {/* Large Icon Background */}
                    <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
                        {/* @ts-ignore */}
                        <Icon className="w-48 h-48 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-20" style={{ transform: "translateZ(30px)" }}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                        {/* @ts-ignore */}
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{title}</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[90%] group-hover:text-white transition-colors">{description}</p>
                    </div>
                </div>

                {/* Spotlight Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
            </motion.div>
        </motion.div>
    );
};
