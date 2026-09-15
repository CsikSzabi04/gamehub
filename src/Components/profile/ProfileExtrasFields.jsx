// Community fields in the profile editor: public/private profile and the PC used for "Can I run it?".
import { lazy, Suspense } from 'react';
import { useT } from '../../i18n/index.jsx';
import { EMPTY_SPECS } from '../../hardware/specs.js';

const PcSpecsForm = lazy(() => import('../../hardware/PcSpecsForm.jsx'));

export default function ProfileExtrasFields({ draft, update, Section }) {
    const { t } = useT();
    const isPublic = draft.isPublic !== false;

    return (
        <>
            <Section title={t('profileExtras.privacyTitle')}>
                <label className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 p-4 cursor-pointer">
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{t('profileExtras.publicToggle')}</span>
                        <span className="block text-xs text-gray-400 mt-1">{t('profileExtras.publicToggleHint')}</span>
                    </span>
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isPublic}
                        onChange={e => update({ isPublic: e.target.checked })}
                    />
                    <span aria-hidden="true" className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 ${isPublic ? 'bg-violet-500' : 'bg-white/15'}`}>
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </span>
                </label>
            </Section>

            <Section title={t('profileExtras.pcTitle')}>
                <p className="text-xs text-gray-400 -mt-1">{t('profileExtras.pcHint')}</p>
                <Suspense fallback={<div className="h-40 rounded-xl bg-white/5 animate-pulse" />}>
                    <PcSpecsForm value={draft.pcSpecs || EMPTY_SPECS} onChange={pcSpecs => update({ pcSpecs })} />
                </Suspense>
            </Section>
        </>
    );
}
