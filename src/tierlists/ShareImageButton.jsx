/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { BsBoxArrowUpRight, BsDownload, BsImage, BsShare } from 'react-icons/bs';
import { Modal, Spinner } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import { renderTierImage } from './tierUtils.js';

/** Button that renders the tier list to a PNG and offers native share / open / save. */
export default function ShareImageButton({ getData, fileName = 'tierlist.png', disabled, className = 'gh-btn gh-btn-secondary' }) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [image, setImage] = useState(null); // { blob, url }
    const [error, setError] = useState(false);

    useEffect(() => () => {
        if (image?.url) URL.revokeObjectURL(image.url);
    }, [image]);

    async function generate() {
        setOpen(true);
        setBusy(true);
        setError(false);
        setImage(null);
        try {
            const blob = await renderTierImage(getData());
            setImage({ blob, url: URL.createObjectURL(blob) });
        } catch (err) {
            console.error('Could not render tier list image:', err);
            setError(true);
        } finally {
            setBusy(false);
        }
    }

    const file = image ? new File([image.blob], fileName, { type: 'image/png' }) : null;
    const canShare = Boolean(file && typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] }));

    async function share() {
        try {
            await navigator.share({ files: [file], title: getData().title });
        } catch (err) {
            if (err?.name !== 'AbortError') window.open(image.url, '_blank', 'noopener');
        }
    }

    return (
        <>
            <button type="button" onClick={generate} disabled={disabled} className={className}>
                <BsImage className="w-4 h-4" /> {t('tierlists.shareImage')}
            </button>
            <Modal open={open} onClose={() => setOpen(false)} title={t('tierlists.shareTitle')} subtitle={t('tierlists.shareSubtitle')} maxWidth="max-w-2xl">
                {busy ? (
                    <div className="text-center">
                        <Spinner className="py-10" />
                        <p className="text-sm text-[#a1a6b3]">{t('tierlists.rendering')}</p>
                    </div>
                ) : error ? (
                    <p className="text-sm text-[#fca5a5] py-6 text-center">{t('tierlists.renderError')}</p>
                ) : image ? (
                    <div>
                        <img src={image.url} alt={t('tierlists.shareTitle')} className="w-full rounded-lg border border-white/[0.06]" />
                        <p className="text-xs text-[#6b7080] mt-2">{t('tierlists.longPressHint')}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {canShare && (
                                <button type="button" onClick={share} className="gh-btn gh-btn-primary">
                                    <BsShare className="w-4 h-4" /> {t('tierlists.share')}
                                </button>
                            )}
                            <a href={image.url} download={fileName} className="gh-btn gh-btn-secondary">
                                <BsDownload className="w-4 h-4" /> {t('tierlists.download')}
                            </a>
                            <a href={image.url} target="_blank" rel="noopener" className="gh-btn gh-btn-secondary">
                                <BsBoxArrowUpRight className="w-4 h-4" /> {t('tierlists.openPng')}
                            </a>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </>
    );
}
