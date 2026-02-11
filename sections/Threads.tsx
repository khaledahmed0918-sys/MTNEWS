
import React from 'react';
import { Icons, threadsData } from '../constants';
import { GlassCard } from '../components/ui/GlassCard';

export const ThreadsPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            {threadsData.map((thread) => (
                <GlassCard key={thread.id} className="flex flex-col gap-4">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden">
                        <img src={thread.image} alt={thread.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
                            <h3 className="text-2xl font-bold text-white">{thread.title}</h3>
                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                <Icons.Calendar className="w-4 h-4" />
                                <span>{thread.date}</span>
                                <span className="mx-1">•</span>
                                <span>{thread.owner}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{thread.description}</p>
                    {thread.sections.map((section, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-200">{section.content}</p>
                        </div>
                    ))}
                    {thread.socials && (
                        <div className="flex gap-2 mt-2">
                             {Object.entries(thread.socials).map(([platform, url]) => {
                                 // @ts-ignore
                                 const Icon = Icons[platform.charAt(0).toUpperCase() + platform.slice(1)] || Icons.Link;
                                 return (
                                     <a key={platform} href={url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                                         {/* @ts-ignore */}
                                         <Icon className="w-5 h-5" />
                                     </a>
                                 )
                             })}
                        </div>
                    )}
                </GlassCard>
            ))}
        </div>
    );
};