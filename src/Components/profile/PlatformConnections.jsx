/* eslint-disable react/prop-types */
// "Game platforms" on the own profile: import libraries where the platform allows it
// (Steam, Xbox, PlayStation), otherwise save the account name and add games manually.
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSteam, FaXbox, FaPlaystation, FaCheckCircle } from 'react-icons/fa';
import { SiEpicgames, SiEa, SiRiotgames, SiRockstargames } from 'react-icons/si';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { UserContext } from '../../Features/UserContext.jsx';
import { useT } from '../../i18n/index.jsx';
import { useLibrary } from '../../library/useLibrary.js';
import SteamImport from '../../library/SteamImport.jsx';
import PlatformImport from '../../library/PlatformImport.jsx';
import QuickAddGame from '../../library/QuickAddGame.jsx';

const PLATFORMS = [
    { id: 'steam', icon: FaSteam, color: '#c7d5e0', mode: 'import' },
    { id: 'epic', icon: SiEpicgames, color: '#e5e7eb', mode: 'manual' },
    { id: 'xbox', icon: FaXbox, color: '#22c55e', mode: 'import' },
    { id: 'psn', icon: FaPlaystation, color: '#3b82f6', mode: 'import' },
    { id: 'ea', icon: SiEa, color: '#f97316', mode: 'manual' },
    { id: 'riot', icon: SiRiotgames, color: '#ef4444', mode: 'manual' },
    { id: 'rockstar', icon: SiRockstargames, color: '#fbbf24', mode: 'manual' },
];

const countFor = (items, id) => items.filter(item => (id === 'steam' ? item.source === 'steam' : id === 'xbox' || id === 'psn' ? item.source === id : item.platform === id)).length;

export default function PlatformConnections({ Card, SectionTitle, accent }) {
    const { t } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const { items, byKey, importItems } = useLibrary();
    const [open, setOpen] = useState(null);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const accounts = profile?.gamingAccounts || {};

    const saveAccount = async platform => {
        const value = name.trim().slice(0, 60);
        const gamingAccounts = { ...accounts, [platform]: value || null };
        await setDoc(doc(firestore, 'users', user.uid), { gamingAccounts }, { merge: true });
        setProfile(prev => ({ ...prev, gamingAccounts }));
        setEditing(null);
    };

    const accountLabel = id => (id === 'steam' ? accounts.steam || profile?.steamId : accounts[id]);

    return (
        <Card className="p-6">
            <SectionTitle accent={accent} action={<Link to="/library" className="text-xs text-gray-400 hover:text-white">{t('profileExtras.library')}</Link>}>
                {t('profileExtras.platformsTitle')}
            </SectionTitle>
            <p className="text-sm text-gray-400 -mt-2 mb-4">{t('profileExtras.platformsHint')}</p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map(({ id, icon: Icon, color, mode }) => {
                    const count = countFor(items, id);
                    const account = accountLabel(id);
                    return (
                        <li key={id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 min-w-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-white/5 shrink-0"><Icon className="w-5 h-5" style={{ color }} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                                        {t(`profileExtras.platforms.${id}`)}
                                        {(account || count > 0) && <FaCheckCircle className="w-3 h-3 text-emerald-400" aria-hidden="true" />}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                        {count > 0 ? t('profileExtras.gamesCount', { count }) : t(`profileExtras.modes.${mode}`)}
                                        {account ? ` · ${account}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpen(id)}
                                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10"
                                >
                                    {mode === 'import' ? t('profileExtras.importButton') : t('profileExtras.addButton')}
                                </button>
                            </div>

                            {id !== 'steam' && (editing === id ? (
                                <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); saveAccount(id); }}>
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
                                <button onClick={() => { setName(accounts[id] || ''); setEditing(id); }} className="mt-2 text-[11px] text-gray-500 hover:text-white">
                                    {account ? t('profileExtras.editAccount') : t('profileExtras.addAccount')}
                                </button>
                            ))}
                        </li>
                    );
                })}
            </ul>

            <SteamImport open={open === 'steam'} onClose={() => setOpen(null)} byKey={byKey} importItems={importItems} />
            {(open === 'xbox' || open === 'psn') && (
                <PlatformImport platform={open} open onClose={() => setOpen(null)} byKey={byKey} importItems={importItems} />
            )}
            {['epic', 'ea', 'riot', 'rockstar'].includes(open) && (
                <QuickAddGame platform={open} open onClose={() => setOpen(null)} byKey={byKey} importItems={importItems} />
            )}
        </Card>
    );
}
