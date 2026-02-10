
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { translations, navConfig } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { NavItem, Section } from '../types';

export const NavBar: React.FC<{ activeSection: Section; setActiveSection: (section: Section) => void, isAdmin: boolean }> = ({ activeSection, setActiveSection, isAdmin }) => {
    const { t } = useI18n();
    const items = useMemo(() => {
        let list = navConfig.filter(item => item.enabled);
        if (isAdmin) {
             const creditsIndex = list.findIndex(i => i.id === 'Credits');
             const logItem: NavItem = { id: 'Logs', enabled: true };
             if (creditsIndex !== -1) {
                 list.splice(creditsIndex + 1, 0, logItem);
             } else {
                 list.push(logItem);
             }
        }
        return list;
    }, [isAdmin]);

    return (
      <nav className="w-full max-w-4xl mx-auto px-4">
        <div className="flex justify-center space-x-2 overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar">
          {items.map(item => (
            <motion.button
              key={item.id} onClick={() => setActiveSection(item.id)}
              className={`relative px-4 py-2 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-300 ${activeSection === item.id ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            >
              {t(item.id as keyof typeof translations.en)}
              {activeSection === item.id && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" layoutId="underline" />}
            </motion.button>
          ))}
        </div>
      </nav>
    );
};
