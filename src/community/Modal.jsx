// Dialog used by community pages and header widgets (no Header import, so the header can use it too).
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BsX } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';

/** Bottom sheet on phones, centered dialog from sm. */
export function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
    const { t } = useT();
    useEffect(() => {
        if (!open) return undefined;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previous;
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 bg-black/75 flex justify-center items-end sm:items-center z-[200] p-0 sm:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className={`bg-[#111319] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full ${maxWidth} max-h-[90svh] flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.6)] pb-[env(safe-area-inset-bottom)]`}
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-white/[0.06]">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-white">{title}</h3>
                                {subtitle && <p className="text-sm text-[#a1a6b3] mt-0.5">{subtitle}</p>}
                            </div>
                            <button onClick={onClose} aria-label={t('communityUi.close')} className="-mr-2 p-1.5 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]">
                                <BsX className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="overflow-y-auto overscroll-contain custom-scrollbar px-4 sm:px-6 py-4 sm:py-5">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Modal;
