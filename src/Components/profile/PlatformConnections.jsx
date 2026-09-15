/* eslint-disable react/prop-types */
// "Game platforms" on the own profile: import libraries where the platform allows it
// (Steam, Xbox, PlayStation) and save the account name.
// Connected platforms can be disconnected (optionally removing the games imported from them).
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSteam, FaXbox, FaPlaystation, FaCheckCircle } from 'react-icons/fa';
import { deleteField, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { UserContext } from '../../Features/UserContext.jsx';
import { useT } from '../../i18n/index.jsx';
import { useLibrary } from '../../library/useLibrary.js';
import { syncLibraryStats } from '../../library/libraryApi.js';
import { Modal } from '../../community/Modal.jsx';
import SteamImport from '../../library/SteamImport.jsx';
import PlatformImport from '../../library/PlatformImport.jsx';

const PLATFORMS = [
    { id: 'steam', icon: FaSteam, color: '#c7d5e0' },
    { id: 'xbox', icon: FaXbox, color: '#22c55e' },
    { id: 'psn', icon: FaPlaystation, color: '#3b82f6' },
];

/** Library items imported from a platform. */
const itemsFor = (items, id) => items.filter(item => item.source === id);

export default function PlatformConnections({ Card, SectionTitle, accent }) {
    const { t } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const { items, byKey, importItems } = useLibrary();
    const [open, setOpen] = useState(null);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [disconnecting, setDisconnecting] = useState(null);
    const [removeGames, setRemoveGames] = useState(true);
    const [busy, setBusy] = useState(false);
    const accounts = profile?.gamingAccounts || {};

    const saveAccount = async platform => {
        const value = name.trim().slice(0, 60);
        const gamingAccounts = { ...accounts, [platform]: value || null };
        await setDoc(doc(firestore, 'users', user.uid), { gamingAccounts }, { merge: true });
        setProfile(prev => ({ ...prev, gamingAccounts }));
        setEditing(null);
    };

    const accountLabel = id => (id === 'steam' ? accounts.steam || profile?.steamId : accounts[id]);

    const disconnect = async () => {
        const id = disconnecting;
        if (!user?.uid || !id) return;
        setBusy(true);
        try {
            const gamingAccounts = { ...accounts };
            delete gamingAccounts[id];
            // merge would keep the old map key: remove it with a field path
            const update = { [`gamingAccounts.${id}`]: deleteField() };
            if (id === 'steam') update.steamId = deleteField();
            await updateDoc(doc(firestore, 'users', user.uid), update);
            setProfile(prev => {
                const next = { ...prev, gamingAccounts };
                if (id === 'steam') delete next.steamId;
                return next;
            });

            if (removeGames) {
                const doomed = itemsFor(items, id);
                for (let i = 0; i < doomed.length; i += 400) {
                    const batch = writeBatch(firestore);
                    doomed.slice(i, i + 400).forEach(item => batch.delete(doc(firestore, 'users', user.uid, 'library', item.gameKey)));
                    await batch.commit();
                }
                const doomedKeys = new Set(doomed.map(item => item.gameKey));
                const libraryStats = await syncLibraryStats(user.uid, items.filter(item => !doomedKeys.has(item.gameKey)));
                if (libraryStats) setProfile(prev => ({ ...prev, libraryStats }));
            }
            setDisconnecting(null);
        } catch (error) {
            console.error(`Could not disconnect ${id}:`, error);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className="p-6">
            <SectionTitle accent={accent} action={<Link to="/library" className="text-xs text-gray-400 hover:text-white">{t('profileExtras.library')}</Link>}>
                {t('profileExtras.platformsTitle')}
            </SectionTitle>
            <p className="text-sm text-gray-400 -mt-2 mb-4">{t('profileExtras.platformsHint')}</p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map(({ id, icon: Icon, color }) => {
                    const count = itemsFor(items, id).length;
                    const account = accountLabel(id);
                    const connected = Boolean(account) || count > 0;
                    return (
                        <li key={id} className={`p-3 rounded-2xl border min-w-0 ${connected ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-white/[0.03] border-white/5'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-white/5 shrink-0"><Icon className="w-5 h-5" style={{ color }} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                                        {t(`profileExtras.platforms.${id}`)}
                                        {connected && <FaCheckCircle className="w-3 h-3 text-emerald-400" aria-label={t('profileExtras.connected')} />}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                        {count > 0 ? t('profileExtras.gamesCount', { count }) : t('profileExtras.modes.import')}
                                        {account ? ` · ${account}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpen(id)}
                                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10"
                                >
                                    {connected ? t('profileExtras.syncButton') : t('profileExtras.importButton')}
                                </button>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                {id !== 'steam' && (editing === id ? (
                                    <form className="flex w-full gap-2" onSubmit={e => { e.preventDefault(); saveAccount(id); }}>
                                        <input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder={t(`profileExtras.accountPlaceholder.${id}`)}
                                            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                            maxLength={60}
                                            autoFocus
                                        />
                                        <button type="submit" className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-violet-500/80 hover:bg-violet-500">{t('common.save')}</button>
                                    </form>
                                ) : (
                                    <button onClick={() => { setName(accounts[id] || ''); setEditing(id); }} className="text-[11px] text-gray-500 hover:text-white">
                                        {account ? t('profileExtras.editAccount') : t('profileExtras.addAccount')}
                                    </button>
                                ))}
                                {connected && editing !== id && (
                                    <button onClick={() => { setRemoveGames(true); setDisconnecting(id); }} className="ml-auto text-[11px] font-semibold text-red-400/80 hover:text-red-300">
                                        {t('profileExtras.disconnect')}
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <SteamImport open={open === 'steam'} onClose={() => setOpen(null)} byKey={byKey} importItems={importItems} />
            {(open === 'xbox' || open === 'psn') && (
                <PlatformImport platform={open} open onClose={() => setOpen(null)} byKey={byKey} importItems={importItems} />
            )}

            <Modal
                open={Boolean(disconnecting)}
                onClose={() => !busy && setDisconnecting(null)}
                title={disconnecting ? t('profileExtras.disconnectTitle', { platform: t(`profileExtras.platforms.${disconnecting}`) }) : ''}
                subtitle={t('profileExtras.disconnectText')}
                maxWidth="max-w-md"
            >
                {disconnecting && (
                    <div className="space-y-4">
                        {itemsFor(items, disconnecting).length > 0 && (
                            <label className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 cursor-pointer">
                                <input type="checkbox" checked={removeGames} onChange={e => setRemoveGames(e.target.checked)} className="mt-0.5 accent-[#ef4444]" />
                                <span className="text-sm text-[#c9ccd4]">{t('profileExtras.disconnectRemoveGames', { count: itemsFor(items, disconnecting).length })}</span>
                            </label>
                        )}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDisconnecting(null)} disabled={busy} className="gh-btn gh-btn-secondary !h-10">{t('common.cancel')}</button>
                            <button onClick={disconnect} disabled={busy} className="gh-btn gh-btn-danger !h-10">
                                {busy ? t('common.saving') : t('profileExtras.disconnect')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
}
