
import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../constants';

interface SpotlightCardProps {
    title: string;
    description: string;
    icon: keyof typeof Icons;
    color: string;
    onClick: () => void;
    delay?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ title, description, icon, color, onClick }) => {
    const Icon = Icons[icon] || Icons.Circle;

    return (
        <div className="w-full h-56 perspective-1000 group">
            <motion.div
                onClick={onClick}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full h-full rounded-[30px] overflow-hidden cursor-pointer border border-white/10 shadow-lg bg-slate-900/20 backdrop-blur-xl transition-all duration-300"
            >
                {/* Static Background Gradient */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className={`absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-gradient-to-br ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                    <div className={`absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-gradient-to-tr ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                    
                    {/* Icon Watermark */}
                    <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
                        {/* @ts-ignore */}
                        <Icon className="w-40 h-40 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-20">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                        {/* @ts-ignore */}
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">{title}</h3>
                        <p className="text-sm text-gray-500 font-bold max-w-[90%] group-hover:text-gray-300 transition-colors">{description}</p>
                    </div>
                </div>

                {/* Hover Border Glow */}
                <div className={`absolute inset-0 border-2 border-transparent rounded-[30px] bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none [mask-image:linear-gradient(white,white)]`} style={{ maskComposite: 'exclude', WebkitMaskComposite: 'xor' }}></div>
            </motion.div>
        </div>
    );
};
