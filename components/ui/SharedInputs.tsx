
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { useFavorites } from '../../hooks';

// --- BORDER GLOW ---
export const BorderGlowWrapper: React.FC<{ children: React.ReactNode, className?: string, rect?: boolean }> = ({ children, className = "", rect = false }) => {
    const roundClass = 'rounded-glass'; 
    const isResizing = className.includes('resize');
    const overflowClass = isResizing ? '' : 'overflow-hidden'; 

    return (
        <div className={`relative p-0.5 ${roundClass} ${overflowClass} group ${className}`}>
            <div className="absolute inset-[-100%] animate-borderRotate bg-[conic-gradient(transparent_0deg,transparent_70deg,#f97316_90deg,transparent_110deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className={`relative h-full w-full ${roundClass} bg-white/25 dark:bg-black/25 backdrop-blur-3xl z-10`}>
                {children}
            </div>
        </div>
    );
};

// --- TOOLTIP ---
export const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block" onClick={() => setShow(!show)} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            <AnimatePresence>
            {show && (
                <motion.div
                    {...({
                        initial: { opacity: 0, y: 10, scale: 0.9 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: 10, scale: 0.9 }
                    } as any)}
                    className="absolute z-20 bottom-full mb-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900/90 dark:bg-black/90 rounded-lg shadow-sm whitespace-nowrap left-1/2 -translate-x-1/2"
                >
                    {content}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

// --- FAVORITE BUTTON ---
export const FavoriteButton: React.FC<{ id: string; category: string; className?: string; onToggle?: () => void }> = ({ id, category, className, onToggle }) => {
  const [favorites, toggleFavorite] = useFavorites(category);
  const isFavorite = favorites.includes(id);
  const controls = useAnimation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
    if(onToggle) onToggle();
    if (!isFavorite) {
      controls.start({
        scale: [1, 1.3, 1],
        rotate: [0, 15, -15, 0],
        transition: { duration: 0.4 }
      });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      {...({ animate: controls, whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } } as any)}
      className={`p-2 rounded-full backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${className || 'bg-white/40 dark:bg-black/40'}`}
    >
      <Icons.Star className={`w-6 h-6 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 dark:text-gray-300'}`} />
    </motion.button>
  );
};

// --- INPUT WITH EYE ---
export const InputWithEye: React.FC<{ value: string, onChange: (v: string) => void, placeholder: string, icon: any }> = ({ value, onChange, placeholder, icon: Icon }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
                type={show ? "text" : "password"} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                className="w-full p-4 pl-12 pr-12 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-orange-500 transition-colors text-white" 
            />
            <button 
                onClick={() => setShow(!show)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                type="button"
            >
                {show ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
            </button>
        </div>
    );
};

// --- IMAGE UPLOAD LOGIC & COMPONENT ---
type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';
interface FileUploadState {
    file: File;
    status: UploadStatus;
    progress: number;
    url?: string;
    error?: string;
}

const useImageUpload = () => {
    const [files, setFiles] = useState<FileUploadState[]>([]);
    
    const uploadFiles = async (newFiles: File[]) => {
        const initialStates: FileUploadState[] = newFiles.map(f => ({ file: f, status: 'pending', progress: 0 }));
        setFiles(prev => [...prev, ...initialStates]);
        
        for (const file of newFiles) {
            setFiles(prev => prev.map(f => f.file === file ? { ...f, status: 'uploading' } : f));
            try {
                const progressInterval = setInterval(() => {
                    setFiles(prev => prev.map(f => {
                         if (f.file === file && f.progress < 90) return { ...f, progress: f.progress + 20 };
                         return f;
                    }));
                }, 50);

                const uploadedUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                clearInterval(progressInterval);

                if (uploadedUrl) {
                    setFiles(prev => prev.map(f => f.file === file ? { ...f, status: 'success', progress: 100, url: uploadedUrl } : f));
                } else {
                    throw new Error('Conversion failed');
                }
            } catch (err) {
                 setFiles(prev => prev.map(f => f.file === file ? { ...f, status: 'error', progress: 0, error: 'Failed' } : f));
            }
        }
    };

    const removeFile = (file: File) => {
        setFiles(prev => prev.filter(f => f.file !== file));
    };

    const clearFiles = () => setFiles([]);

    return { files, uploadFiles, removeFile, clearFiles };
};

export const ImageUploadControl: React.FC<{
    onUrlsChange: (urls: string[]) => void;
    onFilesChange?: (files: File[]) => void;
    singleMode?: boolean;
    initialUrl?: string;
}> = ({ onUrlsChange, onFilesChange, singleMode = false, initialUrl = '' }) => {
    const { t } = useI18n();
    const [mode, setMode] = useState<'url' | 'upload'>('url');
    const [urlInput, setUrlInput] = useState(initialUrl);
    const { files, uploadFiles, removeFile, clearFiles } = useImageUpload();
    const [previewFile, setPreviewFile] = useState<FileUploadState | null>(null);

    useEffect(() => {
        if (mode === 'url') {
            const urls = urlInput.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            onUrlsChange(urls);
            if (onFilesChange) onFilesChange([]);
        } else {
            const successUrls = files.filter(f => f.status === 'success' && f.url).map(f => f.url!);
            onUrlsChange(successUrls);
            if (onFilesChange) {
                const rawFiles = files.map(f => f.file);
                onFilesChange(rawFiles);
            }
        }
    }, [urlInput, files, mode, onUrlsChange, onFilesChange]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileList = e.target.files;
            const selected: File[] = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList.item(i);
                if (file) selected.push(file);
            }
            
            if (singleMode && selected.length > 1) {
                uploadFiles([selected[0]]);
            } else {
                uploadFiles(selected);
            }
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex gap-2 border-b border-white/10 pb-2 mb-2">
                <button onClick={() => setMode('url')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'url' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>{t('url')}</button>
                <button onClick={() => setMode('upload')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'upload' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>{t('uploadFromDevice')}</button>
            </div>

            {mode === 'url' ? (
                <div className="flex flex-col gap-2">
                    <input 
                        value={urlInput} 
                        onChange={e => setUrlInput(e.target.value)} 
                        placeholder={singleMode ? t('imageUrl') : t('multipleUrls')} 
                        className="p-3 rounded-xl bg-black/20 border border-white/10 text-white w-full focus:border-orange-500/50 outline-none transition-colors"
                    />
                    <div className="text-xs text-gray-500">{singleMode ? t('imageUrl') : t('multipleUrls')}</div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                            <Icons.Upload className="w-8 h-8 mb-2" />
                            <p className="text-sm font-bold">{t('dropFiles')}</p>
                        </div>
                        <input type="file" className="hidden" multiple={!singleMode} onChange={handleFileChange} accept="image/*" />
                    </label>

                    {files.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg border border-white/5">
                                    <div className="w-10 h-10 rounded bg-white/5 overflow-hidden flex items-center justify-center">
                                        {f.url ? <img src={f.url} className="w-full h-full object-cover" /> : <Icons.Images className="w-5 h-5 text-gray-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="truncate text-white">{f.file.name}</span>
                                            <span className={f.status === 'success' ? 'text-green-500' : f.status === 'error' ? 'text-red-500' : 'text-orange-500'}>{t(f.status)}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div 
                                                className={`h-full ${f.status === 'success' ? 'bg-green-500' : f.status === 'error' ? 'bg-red-500' : 'bg-orange-500'}`}
                                                {...({ initial: { width: 0 }, animate: { width: `${f.progress}%` } } as any)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {f.status === 'success' && <button onClick={() => setPreviewFile(f)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Icons.Eye className="w-4 h-4" /></button>}
                                        <button onClick={() => removeFile(f.file)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-500"><Icons.X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <AnimatePresence>
                {previewFile && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreviewFile(null)}>
                        <motion.div {...({ initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 } } as any)} className="relative max-w-full max-h-[90vh]">
                            <img src={previewFile.url} alt="Preview" className="rounded-xl shadow-2xl max-w-full max-h-[80vh]" />
                            <button onClick={() => setPreviewFile(null)} className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 shadow-lg"><Icons.X className="w-6 h-6" /></button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ToggleSwitch: React.FC<{ isOn: boolean; onToggle: () => void; disabled?: boolean }> = ({ isOn, onToggle, disabled }) => { 
    const { dir } = useI18n(); 
    return (
        <div onClick={disabled ? undefined : onToggle} className={`relative w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${disabled ? 'bg-gray-600 cursor-not-allowed opacity-50' : isOn ? 'bg-green-500 cursor-pointer' : 'bg-gray-600 cursor-pointer'}`}>
            <motion.div {...({ layout: true } as any)} className="w-5 h-5 bg-white rounded-full shadow-md" {...({ animate: { x: isOn ? (dir === 'rtl' ? -20 : 20) : 0 } } as any)} />
        </div>
    );
};
