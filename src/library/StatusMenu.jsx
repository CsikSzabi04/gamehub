/* eslint-disable react/prop-types */
// Status picker: anchored popover from sm, bottom sheet on phones. Rendered in a portal.
import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsCheck2, BsTrash } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { LIBRARY_STATUSES, STATUS_COLORS } from './libraryApi.js';
import { STATUS_ICONS } from './statusIcons.js';

const MENU_WIDTH = 248;
const MENU_HEIGHT = 330;

function placement(anchor) {
    if (typeof window === 'undefined' || !anchor || !window.matchMedia('(min-width: 640px)').matches) return null;
    const rect = anchor.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8));
    if (rect.bottom + MENU_HEIGHT + 8 > window.innerHeight && rect.top > MENU_HEIGHT) {
        return { left, bottom: window.innerHeight - rect.top + 8 };
    }
    return { left, top: rect.bottom + 8 };
}

export default function StatusMenu({ open, anchorRef, onClose, current, onSelect, onRemove, busy = false }) {
    const { t } = useT();
    const [position, setPosition] = useState(null);

    useLayoutEffect(() => {
        if (open) setPosition(placement(anchorRef?.current));
    }, [open, anchorRef]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        const onMove = () => { if (position) onClose(); };
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', onMove);
        window.addEventListener('scroll', onMove, true);
        return () => {
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onMove);
            window.removeEventListener('scroll', onMove, true);
        };
    }, [open, onClose, position]);

    if (!open || typeof document === 'undefined') return null;

    const sheet = !position;
    return createPortal(
        <>
            <div className={`fixed inset-0 z-[210] ${sheet ? 'bg-black/70' : ''}`} onClick={onClose} aria-hidden="true" />
            <div
                role="menu"
                aria-label={t('library.menu.title')}
                style={sheet ? undefined : { ...position, width: MENU_WIDTH }}
                className={sheet
                    ? 'fixed inset-x-0 bottom-0 z-[220] rounded-t-2xl bg-[#111319] border-t border-white/[0.08] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(0,0,0,0.5)]'
                    : 'fixed z-[220] rounded-xl bg-[#171a22] border border-white/[0.08] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.6)]'}
            >
                {sheet && (
                    <>
                        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/15" />
                        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[#8a8f9c]">{t('library.menu.title')}</p>
                    </>
                )}
                {LIBRARY_STATUSES.map(status => {
                    const Icon = STATUS_ICONS[status];
                    const active = status === current;
                    return (
                        <button
                            key={status}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            disabled={busy}
                            onClick={() => onSelect(status)}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 ${sheet ? 'h-12 text-[15px]' : 'h-10 text-sm'} text-left transition-colors disabled:opacity-50 ${active ? 'bg-white/[0.07] text-white' : 'text-[#c9ccd4] hover:bg-white/[0.05] hover:text-white'}`}
                        >
                            <Icon className="shrink-0 w-4 h-4" style={{ color: STATUS_COLORS[status] }} aria-hidden="true" />
                            <span className="flex-1 min-w-0 truncate">{t(`library.status.${status}`)}</span>
                            {active && <BsCheck2 className="shrink-0 w-4 h-4 text-[#c4b5fd]" aria-hidden="true" />}
                        </button>
                    );
                })}
                {current && onRemove && (
                    <>
                        <div className="my-1.5 h-px bg-white/[0.06]" />
                        <button
                            type="button"
                            role="menuitem"
                            disabled={busy}
                            onClick={onRemove}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 ${sheet ? 'h-12 text-[15px]' : 'h-10 text-sm'} text-left text-[#f87171] hover:bg-[#f87171]/10 disabled:opacity-50`}
                        >
                            <BsTrash className="shrink-0 w-4 h-4" aria-hidden="true" />
                            {t('library.menu.remove')}
                        </button>
                    </>
                )}
            </div>
        </>,
        document.body,
    );
}
