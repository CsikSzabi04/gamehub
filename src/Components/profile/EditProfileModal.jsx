import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCamera, FaTrash, FaImage, FaSteam, FaDiscord, FaTwitch, FaYoutube, FaGamepad, FaCheck } from 'react-icons/fa';
import {
    ACCENTS, BANNER_PRESETS, PLATFORMS, GENRES, MAX_GENRES, BIO_MAX,
    AVATAR_OPTIONS, BANNER_OPTIONS, processImage, getAccent,
} from './profileUtils.js';

const SOCIALS = [
    { key: 'steam', label: 'Steam', icon: FaSteam, placeholder: 'Steam profile name' },
    { key: 'discord', label: 'Discord', icon: FaDiscord, placeholder: 'username' },
    { key: 'twitch', label: 'Twitch', icon: FaTwitch, placeholder: 'channel' },
    { key: 'youtube', label: 'YouTube', icon: FaYoutube, placeholder: '@channel' },
];

const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all';

function Section({ title, children }) {
    return (
        <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{title}</h3>
            {children}
        </section>
    );
}

export default function EditProfileModal({ profile, onClose, onSave }) {
    const [draft, setDraft] = useState(() => ({
        username: profile.username || '',
        bio: profile.bio || '',
        playing: profile.playing || '',
        avatar: profile.avatar || null,
        banner: profile.banner || null,
        bannerPreset: profile.bannerPreset || 'nebula',
        bannerPosY: profile.bannerPosY ?? 50,
        accent: profile.accent || 'violet',
        platforms: profile.platforms || [],
        genres: profile.genres || [],
        socials: { steam: '', discord: '', twitch: '', youtube: '', ...profile.socials },
    }));
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState('');
    const avatarInput = useRef(null);
    const bannerInput = useRef(null);
    const accent = getAccent(draft.accent);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    function update(fields) {
        setDraft(prev => ({ ...prev, ...fields }));
    }

    function toggleIn(listKey, value, max) {
        setDraft(prev => {
            const list = prev[listKey];
            if (list.includes(value)) return { ...prev, [listKey]: list.filter(v => v !== value) };
            if (max && list.length >= max) return prev;
            return { ...prev, [listKey]: [...list, value] };
        });
    }

    async function handleImage(e, field) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setError('');
        setProcessing(field);
        try {
            const dataUrl = await processImage(file, field === 'avatar' ? AVATAR_OPTIONS : BANNER_OPTIONS);
            update(field === 'banner' ? { banner: dataUrl, bannerPosY: 50 } : { avatar: dataUrl });
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(null);
        }
    }

    async function handleSave() {
        const username = draft.username.trim();
        if (username.length < 3 || username.length > 20) {
            setError('Username must be 3-20 characters.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await onSave({
                ...draft,
                username,
                bio: draft.bio.trim(),
                playing: draft.playing.trim(),
                socials: Object.fromEntries(Object.entries(draft.socials).map(([k, v]) => [k, v.trim()])),
            });
            onClose();
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile. Please try again.');
            setSaving(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-[#0b0f1a] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">Edit profile</h2>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" aria-label="Close">
                        <FaTimes className="w-4 h-4 text-gray-300" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8" data-lenis-prevent>
                    {/* Images */}
                    <Section title="Cover & avatar">
                        <div className="relative">
                            <div
                                className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 bg-cover"
                                style={draft.banner
                                    ? { backgroundImage: `url(${draft.banner})`, backgroundPosition: `center ${draft.bannerPosY}%` }
                                    : { background: BANNER_PRESETS[draft.bannerPreset] }}
                            >
                                <div className="w-full h-full bg-gradient-to-t from-black/60 to-transparent flex items-end justify-end gap-2 p-3">
                                    {draft.banner && (
                                        <button
                                            onClick={() => update({ banner: null })}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 hover:bg-red-500/80 text-xs font-semibold text-white transition-colors"
                                        >
                                            <FaTrash className="w-3 h-3" /> Remove
                                        </button>
                                    )}
                                    <button
                                        onClick={() => bannerInput.current.click()}
                                        disabled={processing === 'banner'}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 hover:bg-black/80 text-xs font-semibold text-white transition-colors disabled:opacity-60"
                                    >
                                        <FaImage className="w-3 h-3" /> {processing === 'banner' ? 'Processing...' : 'Upload cover'}
                                    </button>
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="absolute -bottom-10 left-5">
                                <div className="relative w-24 h-24 rounded-full p-[3px]" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}>
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0b0f1a] flex items-center justify-center">
                                        {draft.avatar
                                            ? <img src={draft.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                                            : <span className="text-3xl font-black text-white">{(draft.username || '?')[0].toUpperCase()}</span>}
                                    </div>
                                    <button
                                        onClick={() => avatarInput.current.click()}
                                        disabled={processing === 'avatar'}
                                        className="absolute inset-[3px] rounded-full bg-black/0 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all"
                                        aria-label="Upload avatar"
                                    >
                                        <FaCamera className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pl-32 min-h-[2.5rem]">
                            <button
                                onClick={() => avatarInput.current.click()}
                                disabled={processing === 'avatar'}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors disabled:opacity-60"
                            >
                                <FaCamera className="w-3 h-3" /> {processing === 'avatar' ? 'Processing...' : 'Change avatar'}
                            </button>
                            {draft.avatar && (
                                <button
                                    onClick={() => update({ avatar: null })}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 text-xs font-semibold text-red-300 transition-colors"
                                >
                                    <FaTrash className="w-3 h-3" /> Remove
                                </button>
                            )}
                        </div>

                        <input ref={avatarInput} type="file" accept="image/*" hidden onChange={e => handleImage(e, 'avatar')} />
                        <input ref={bannerInput} type="file" accept="image/*" hidden onChange={e => handleImage(e, 'banner')} />

                        {draft.banner ? (
                            <label className="block pt-2">
                                <span className="text-xs text-gray-400">Cover position</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={draft.bannerPosY}
                                    onChange={e => update({ bannerPosY: Number(e.target.value) })}
                                    className="w-full mt-2"
                                    style={{ accentColor: accent.from }}
                                />
                            </label>
                        ) : (
                            <div className="pt-2">
                                <span className="text-xs text-gray-400">Or pick a preset cover</span>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                                    {Object.entries(BANNER_PRESETS).map(([key, bg]) => (
                                        <button
                                            key={key}
                                            onClick={() => update({ bannerPreset: key })}
                                            className={`relative h-12 rounded-lg border-2 transition-all ${draft.bannerPreset === key ? 'border-white scale-105' : 'border-transparent hover:border-white/40'}`}
                                            style={{ background: bg }}
                                            aria-label={`${key} cover`}
                                        >
                                            {draft.bannerPreset === key && <FaCheck className="absolute inset-0 m-auto w-3 h-3 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* Basics */}
                    <Section title="About you">
                        <div>
                            <label className="text-xs text-gray-400" htmlFor="edit-username">Username</label>
                            <input
                                id="edit-username"
                                className={`${inputClass} mt-1`}
                                value={draft.username}
                                maxLength={20}
                                onChange={e => update({ username: e.target.value })}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-400" htmlFor="edit-bio">Bio</label>
                                <span className={`text-xs ${draft.bio.length >= BIO_MAX ? 'text-amber-400' : 'text-gray-500'}`}>{draft.bio.length}/{BIO_MAX}</span>
                            </div>
                            <textarea
                                id="edit-bio"
                                rows={3}
                                maxLength={BIO_MAX}
                                className={`${inputClass} mt-1 resize-none`}
                                placeholder="Tell others what kind of gamer you are..."
                                value={draft.bio}
                                onChange={e => update({ bio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400" htmlFor="edit-playing">Currently playing</label>
                            <div className="relative mt-1">
                                <FaGamepad className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="edit-playing"
                                    className={`${inputClass} pl-11`}
                                    maxLength={60}
                                    placeholder="e.g. Elden Ring"
                                    value={draft.playing}
                                    onChange={e => update({ playing: e.target.value })}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Accent */}
                    <Section title="Profile color">
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(ACCENTS).map(([key, a]) => (
                                <button
                                    key={key}
                                    onClick={() => update({ accent: key })}
                                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all ${draft.accent === key ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <span className="w-6 h-6 rounded-full" style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }} />
                                    <span className="text-xs font-semibold text-gray-200">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </Section>

                    {/* Gaming */}
                    <Section title="Platforms">
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(p => {
                                const active = draft.platforms.includes(p);
                                return (
                                    <button
                                        key={p}
                                        onClick={() => toggleIn('platforms', p)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${active ? 'text-white border-transparent' : 'text-gray-400 border-white/10 bg-white/5 hover:text-white'}`}
                                        style={active ? { background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` } : undefined}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title={`Favorite genres (${draft.genres.length}/${MAX_GENRES})`}>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(g => {
                                const active = draft.genres.includes(g);
                                const disabled = !active && draft.genres.length >= MAX_GENRES;
                                return (
                                    <button
                                        key={g}
                                        onClick={() => toggleIn('genres', g, MAX_GENRES)}
                                        disabled={disabled}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-white text-gray-900 border-white' : 'text-gray-300 border-white/10 bg-white/5 hover:border-white/30'}`}
                                    >
                                        {g}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    {/* Socials */}
                    <Section title="Connections">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SOCIALS.map(({ key, label, icon: Icon, placeholder }) => (
                                <div key={key} className="relative">
                                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        className={`${inputClass} pl-11`}
                                        aria-label={label}
                                        placeholder={`${label}: ${placeholder}`}
                                        maxLength={40}
                                        value={draft.socials[key]}
                                        onChange={e => update({ socials: { ...draft.socials, [key]: e.target.value } })}
                                    />
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-[#0b0f1a]">
                    {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSave}
                            disabled={saving || Boolean(processing)}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
                        >
                            {saving ? 'Saving...' : 'Save changes'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
