import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBell, BsBellFill, BsGear } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import useNotifications from './useNotifications.js';
import NotificationItem from './NotificationItem.jsx';
import EnablePushPrompt from './EnablePushPrompt.jsx';

/** Header bell: dropdown on desktop, opens /notifications on phones. */
export default function NotificationBell({ className = '' }) {
    const { t } = useT();
    const navigate = useNavigate();
    const { items, unread, markRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onKey = e => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    function toggle() {
        if (window.matchMedia('(max-width: 767px)').matches) {
            navigate('/notifications');
            return;
        }
        setOpen(o => !o);
    }

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                onClick={toggle}
                aria-label={unread ? t('notifications.bellUnread', { count: unread }) : t('notifications.title')}
                aria-expanded={open}
                title={t('notifications.title')}
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.05] transition-colors"
            >
                {unread > 0 ? <BsBellFill className="w-[18px] h-[18px] text-white" /> : <BsBell className="w-[18px] h-[18px]" />}
                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#8b5cf6] text-white text-[10px] font-bold leading-4 text-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-[380px] max-h-[70vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#111319] shadow-[0_24px_60px_rgba(0,0,0,0.6)] z-[150]">
                    <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5 border-b border-white/[0.06]">
                        <p className="text-sm font-bold text-white">{t('notifications.title')}</p>
                        <div className="flex items-center gap-1">
                            {unread > 0 && (
                                <button onClick={markAllRead} className="text-xs font-medium text-[#c4b5fd] hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.05]">
                                    {t('notifications.markAllRead')}
                                </button>
                            )}
                            <Link to="/notifications#settings" onClick={() => setOpen(false)} aria-label={t('notifications.settings')} className="p-1.5 rounded-md text-[#8a8f9c] hover:text-white hover:bg-white/[0.05]">
                                <BsGear className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-y-auto overscroll-contain custom-scrollbar p-2">
                        <EnablePushPrompt compact />
                        {items.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <BsBell className="mx-auto text-3xl text-[#3a3f4b] mb-3" />
                                <p className="text-sm text-[#a1a6b3]">{t('notifications.empty')}</p>
                                <p className="text-xs text-[#6b7080] mt-1">{t('notifications.emptyHint')}</p>
                            </div>
                        ) : (
                            items.slice(0, 12).map(item => (
                                <NotificationItem
                                    key={item.id}
                                    item={item}
                                    compact
                                    onOpen={n => { if (!n.read) markRead(n.id); setOpen(false); }}
                                />
                            ))
                        )}
                    </div>
                    <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-sm font-medium text-[#c9ccd4] hover:text-white py-3 border-t border-white/[0.06]">
                        {t('notifications.viewAll')}
                    </Link>
                </div>
            )}
        </div>
    );
}
