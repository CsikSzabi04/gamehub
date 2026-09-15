/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsCheckLg, BsXLg, BsFlag, BsTrash, BsLock, BsUnlock, BsClockHistory, BsClipboard, BsCheck2,
    BsHourglassSplit, BsCheckCircleFill, BsXCircle, BsPersonPlus,
} from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { Modal, Spinner, inputClass } from '../community/ui.jsx';
import { EXTEND_HOURS, LIMITS, MAX_EXPIRY_HOURS, clip, createdMillis, hoursMs, isExpired, isFull, isOpen, millis, rememberContact, rememberedContact } from './constants.js';
import {
    acceptRequest, cancelRequest, declineRequest, deletePost, extendPost, setPostClosed,
    subscribeMyRequest, subscribeRequests,
} from './lfgApi.js';
import { Badge, FormError, GameCover, PostBadges, PostTiming, SafetyNote, SlotsMeter, UserLink } from './parts.jsx';

function CopyButton({ value }) {
    const { t } = useT();
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }).catch(() => {});
    };
    return (
        <button type="button" onClick={copy} className="gh-icon-btn !h-8 !w-8 shrink-0" aria-label={t('lfg.actions.copy')} title={t('lfg.actions.copy')}>
            {copied ? <BsCheck2 aria-hidden="true" /> : <BsClipboard aria-hidden="true" />}
        </button>
    );
}

function ContactBox({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 rounded-lg bg-[#0a0b0f] border border-white/[0.08] px-3 py-2">
            <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-[#6b7080] font-semibold">{label}</p>
                <p className="text-sm text-white font-medium break-all">{value}</p>
            </div>
            <CopyButton value={value} />
        </div>
    );
}

const STATUS_TONE = { pending: 'amber', accepted: 'green', declined: 'red' };

function RequestRow({ post, request, onReport }) {
    const { t, locale } = useT();
    const { user } = useContext(UserContext) || {};
    const [accepting, setAccepting] = useState(false);
    const [ownerContact, setOwnerContact] = useState(rememberedContact);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const run = async action => {
        setBusy(true);
        setError('');
        try {
            await action();
            setAccepting(false);
        } catch (err) {
            console.error('LFG request update failed:', err);
            setError(err?.code === 'full' ? t('lfg.errors.full') : t('lfg.errors.save'));
        } finally {
            setBusy(false);
        }
    };

    const accept = e => {
        e.preventDefault();
        const value = clip(ownerContact, LIMITS.contact);
        if (value.length < 2) {
            setError(t('lfg.errors.contact'));
            return;
        }
        rememberContact(value);
        run(() => acceptRequest(user, post.id, request.uid, value));
    };

    const created = toDateLabel(request.createdAt, locale);

    return (
        <li className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                    <UserLink username={request.username} />
                    {created && <span className="text-xs text-[#6b7080] shrink-0">{created}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Badge tone={STATUS_TONE[request.status]}>{t(`lfg.request.status.${request.status}`)}</Badge>
                    <button type="button" onClick={() => onReport({ type: 'lfg-user', targetId: request.uid, postId: post.id, label: request.username })} className="gh-icon-btn !h-8 !w-8" aria-label={t('lfg.report.user')} title={t('lfg.report.user')}>
                        <BsFlag aria-hidden="true" />
                    </button>
                </div>
            </div>
            {request.message && <p className="text-sm text-[#c9ccd4] break-words">{request.message}</p>}
            <ContactBox label={t('lfg.request.theirContact')} value={request.contact} />
            {request.status === 'accepted' && request.ownerContact && (
                <p className="text-xs text-[#a1a6b3]">{t('lfg.request.youShared', { contact: request.ownerContact })}</p>
            )}

            {accepting ? (
                <form onSubmit={accept} className="space-y-2">
                    <label className="block">
                        <span className="block text-xs text-[#a1a6b3] mb-1">{t('lfg.request.ownerContactLabel')}</span>
                        <input value={ownerContact} onChange={e => setOwnerContact(e.target.value)} maxLength={LIMITS.contact} className={inputClass} placeholder={t('lfg.join.contactPlaceholder')} autoFocus autoComplete="off" />
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setAccepting(false)} className="gh-btn gh-btn-secondary !h-9 flex-1">{t('lfg.actions.cancel')}</button>
                        <button type="submit" disabled={busy} className="gh-btn gh-btn-primary !h-9 flex-1 disabled:opacity-60">{t('lfg.request.confirmAccept')}</button>
                    </div>
                </form>
            ) : (
                <div className="flex gap-2">
                    {request.status !== 'accepted' && (
                        <button type="button" disabled={busy || (isFull(post) && request.status !== 'accepted')} onClick={() => setAccepting(true)} className="gh-btn gh-btn-primary !h-9 flex-1 disabled:opacity-50">
                            <BsCheckLg aria-hidden="true" />
                            {t('lfg.request.accept')}
                        </button>
                    )}
                    {request.status === 'pending' && (
                        <button type="button" disabled={busy} onClick={() => run(() => declineRequest(user, post.id, request.uid))} className="gh-btn gh-btn-secondary !h-9 flex-1 disabled:opacity-50">
                            <BsXLg aria-hidden="true" />
                            {t('lfg.request.decline')}
                        </button>
                    )}
                    {request.status === 'accepted' && (
                        <button type="button" disabled={busy} onClick={() => run(() => declineRequest(user, post.id, request.uid))} className="gh-btn gh-btn-secondary !h-9 flex-1 disabled:opacity-50">
                            <BsXLg aria-hidden="true" />
                            {t('lfg.request.remove')}
                        </button>
                    )}
                </div>
            )}
            <FormError>{error}</FormError>
        </li>
    );
}

function toDateLabel(value, locale) {
    const ms = millis(value);
    if (!ms) return null;
    return new Date(ms).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function OwnerPanel({ post, now, onReport, onDeleted }) {
    const { t } = useT();
    const [requests, setRequests] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => subscribeRequests(post.id, list => {
        setRequests(list);
        setLoadError(false);
    }, () => setLoadError(true)), [post.id]);

    const run = async action => {
        setBusy(true);
        setError('');
        try {
            await action();
        } catch (err) {
            console.error('LFG post update failed:', err);
            setError(t('lfg.errors.save'));
        } finally {
            setBusy(false);
        }
    };

    const order = { pending: 0, accepted: 1, declined: 2 };
    const sorted = (requests || []).slice().sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || createdMillis(b) - createdMillis(a));
    const expiresAt = millis(post.expiresAt) || 0;
    const canExtend = expiresAt < now + hoursMs(MAX_EXPIRY_HOURS) - 60000;

    return (
        <div className="space-y-5">
            <section>
                <h4 className="text-sm font-semibold text-white mb-2">{t('lfg.owner.manage')}</h4>
                <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy} onClick={() => run(() => setPostClosed(post.id, !post.closed))} className="gh-btn gh-btn-secondary !h-9 disabled:opacity-50">
                        {post.closed ? <BsUnlock aria-hidden="true" /> : <BsLock aria-hidden="true" />}
                        {post.closed ? t('lfg.owner.reopen') : t('lfg.owner.close')}
                    </button>
                    {canExtend && EXTEND_HOURS.map(h => (
                        <button key={h} type="button" disabled={busy} onClick={() => run(() => extendPost(post, h))} className="gh-btn gh-btn-secondary !h-9 disabled:opacity-50">
                            <BsClockHistory aria-hidden="true" />
                            {t('lfg.owner.extend', { count: h })}
                        </button>
                    ))}
                    {confirmDelete ? (
                        <span className="inline-flex gap-2">
                            <button type="button" disabled={busy} onClick={() => run(async () => { await deletePost(post.id); onDeleted?.(post.id); })} className="gh-btn gh-btn-danger !h-9 disabled:opacity-50">
                                <BsTrash aria-hidden="true" />
                                {t('lfg.owner.confirmDelete')}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(false)} className="gh-btn gh-btn-secondary !h-9">{t('lfg.actions.cancel')}</button>
                        </span>
                    ) : (
                        <button type="button" onClick={() => setConfirmDelete(true)} className="gh-btn gh-btn-secondary !h-9 !text-red-300">
                            <BsTrash aria-hidden="true" />
                            {t('lfg.owner.delete')}
                        </button>
                    )}
                </div>
                <div className="mt-2"><FormError>{error}</FormError></div>
            </section>

            <section>
                <h4 className="text-sm font-semibold text-white mb-2">
                    {t('lfg.owner.requests')}
                    {requests && <span className="ml-1.5 text-[#6b7080] font-normal">{requests.length}</span>}
                </h4>
                {loadError ? (
                    <FormError>{t('lfg.errors.load')}</FormError>
                ) : !requests ? (
                    <Spinner className="py-6" />
                ) : sorted.length === 0 ? (
                    <p className="text-sm text-[#a1a6b3]">{t('lfg.owner.noRequests')}</p>
                ) : (
                    <ul className="space-y-2.5">
                        {sorted.map(request => <RequestRow key={request.id} post={post} request={request} onReport={onReport} />)}
                    </ul>
                )}
            </section>
        </div>
    );
}

function RequesterPanel({ post, now, onJoin, onRequestChange }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [request, setRequest] = useState(undefined);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => subscribeMyRequest(post.id, user.uid, next => {
        setRequest(next);
        onRequestChange?.(post.id, next);
    }, () => setRequest(null)), [post.id, user.uid, onRequestChange]);

    if (request === undefined) return <Spinner className="py-6" />;

    if (!request) {
        if (!isOpen(post, now)) return <p className="text-sm text-[#a1a6b3]">{t('lfg.errors.notOpen')}</p>;
        return (
            <button type="button" onClick={() => onJoin(post)} className="gh-btn gh-btn-primary w-full">
                <BsPersonPlus aria-hidden="true" />
                {t('lfg.card.join')}
            </button>
        );
    }

    const cancel = async () => {
        setBusy(true);
        setError('');
        try {
            await cancelRequest(user.uid, post.id);
        } catch (err) {
            console.error('LFG cancel failed:', err);
            setError(t('lfg.errors.save'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-3">
            {request.status === 'pending' && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                    <BsHourglassSplit className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{t('lfg.request.pendingTitle')}</p>
                        <p className="text-xs text-[#c9ccd4] mt-0.5">{t('lfg.request.pendingText')}</p>
                    </div>
                </div>
            )}
            {request.status === 'accepted' && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 space-y-2.5">
                    <div className="flex items-start gap-3">
                        <BsCheckCircleFill className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{t('lfg.request.acceptedTitle')}</p>
                            <p className="text-xs text-[#c9ccd4] mt-0.5">{t('lfg.request.acceptedText', { username: post.username })}</p>
                        </div>
                    </div>
                    <ContactBox label={t('lfg.request.ownerContact')} value={request.ownerContact} />
                </div>
            )}
            {request.status === 'declined' && (
                <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                    <BsXCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{t('lfg.request.declinedTitle')}</p>
                        <p className="text-xs text-[#c9ccd4] mt-0.5">{t('lfg.request.declinedText')}</p>
                    </div>
                </div>
            )}
            <ContactBox label={t('lfg.request.yourContact')} value={request.contact} />
            {request.status === 'pending' && (
                <button type="button" disabled={busy} onClick={cancel} className="gh-btn gh-btn-secondary w-full disabled:opacity-50">{t('lfg.request.cancel')}</button>
            )}
            <FormError>{error}</FormError>
        </div>
    );
}

/** post: the loaded post, null while loading, false when it no longer exists. */
export default function PostDetailModal({ open, post, cover, now, onClose, onJoin, onReport, onDeleted, onRequestChange }) {
    const { t } = useT();
    const { user, authReady } = useContext(UserContext) || {};
    const isOwner = Boolean(user && post && post.uid === user.uid);

    let body;
    if (post === null) body = <Spinner className="py-10" />;
    else if (!post) body = <p className="text-sm text-[#a1a6b3] py-4 text-center">{t('lfg.detail.notFound')}</p>;
    else {
        body = (
            <div className="space-y-4">
                <GameCover post={post} cover={cover} className="h-28 -mx-4 sm:-mx-6 -mt-4 sm:-mt-5" />
                <div className="flex items-center justify-between gap-2 text-sm text-[#a1a6b3]">
                    <span className="min-w-0 truncate">{t('lfg.card.by')} <UserLink username={post.username} /></span>
                    {!isOwner && (
                        <button type="button" onClick={() => onReport({ type: 'lfg', targetId: post.id, postId: post.id, label: post.gameName })} className="inline-flex items-center gap-1 text-xs text-[#6b7080] hover:text-red-300 shrink-0">
                            <BsFlag aria-hidden="true" />
                            {t('lfg.report.post')}
                        </button>
                    )}
                </div>
                <PostBadges post={post} />
                <PostTiming post={post} now={now} />
                {post.note && <p className="text-sm text-[#c9ccd4] whitespace-pre-line break-words">{post.note}</p>}
                <SlotsMeter post={post} />
                {isExpired(post, now) && !isOwner && <Badge tone="red">{t('lfg.time.expired')}</Badge>}
                <SafetyNote />
                <div className="border-t border-white/[0.06] pt-4">
                    {!authReady ? (
                        <Spinner className="py-6" />
                    ) : !user ? (
                        <div className="text-center space-y-3">
                            <p className="text-sm text-[#a1a6b3]">{t('lfg.loginToJoin')}</p>
                            <Link to="/login" className="gh-btn gh-btn-primary inline-flex">{t('lfg.actions.login')}</Link>
                        </div>
                    ) : isOwner ? (
                        <OwnerPanel post={post} now={now} onReport={onReport} onDeleted={onDeleted} />
                    ) : (
                        <RequesterPanel post={post} now={now} onJoin={onJoin} onRequestChange={onRequestChange} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <Modal open={open} onClose={onClose} title={post ? t('lfg.detail.title', { game: post.gameName }) : t('lfg.title')}>
            {body}
        </Modal>
    );
}
