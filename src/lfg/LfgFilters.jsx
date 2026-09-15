/* eslint-disable react/prop-types */
import { BsMic, BsArrowCounterclockwise } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { inputClass } from '../community/ui.jsx';
import { LANGUAGE_CODES, MODES, OTHER_GAME, PLATFORMS, REGIONS, languageName } from './constants.js';

function Select({ label, value, onChange, children }) {
    return (
        <label className="block min-w-0">
            <span className="sr-only">{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)} className={`${inputClass} ${value ? '!border-[#8b5cf6]/60' : ''}`} aria-label={label}>
                {children}
            </select>
        </label>
    );
}

export default function LfgFilters({ universes, filters, onChange, onReset }) {
    const { t, locale } = useT();
    const set = key => value => onChange({ ...filters, [key]: value });

    return (
        <div className="gh-surface p-3 sm:p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                <div className="col-span-2 md:col-span-1">
                    <Select label={t('lfg.fields.game')} value={filters.game} onChange={set('game')}>
                        <option value="">{t('lfg.filters.allGames')}</option>
                        {(universes || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        {filters.game && filters.game !== OTHER_GAME && !(universes || []).some(u => u.id === filters.game) && (
                            <option value={filters.game}>{filters.game}</option>
                        )}
                        <option value={OTHER_GAME}>{t('lfg.fields.otherGame')}</option>
                    </Select>
                </div>
                <Select label={t('lfg.fields.platform')} value={filters.platform} onChange={set('platform')}>
                    <option value="">{t('lfg.filters.allPlatforms')}</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{t(`lfg.platform.${p}`)}</option>)}
                </Select>
                <Select label={t('lfg.fields.mode')} value={filters.mode} onChange={set('mode')}>
                    <option value="">{t('lfg.filters.allModes')}</option>
                    {MODES.map(m => <option key={m} value={m}>{t(`lfg.mode.${m}`)}</option>)}
                </Select>
                <Select label={t('lfg.fields.language')} value={filters.language} onChange={set('language')}>
                    <option value="">{t('lfg.filters.allLanguages')}</option>
                    {LANGUAGE_CODES.filter(c => c !== 'any').map(c => <option key={c} value={c}>{languageName(c, locale)}</option>)}
                </Select>
                <Select label={t('lfg.fields.region')} value={filters.region} onChange={set('region')}>
                    <option value="">{t('lfg.filters.allRegions')}</option>
                    {REGIONS.filter(r => r !== 'any').map(r => <option key={r} value={r}>{t(`lfg.region.${r}`)}</option>)}
                </Select>
                <div className="col-span-2 md:col-span-1 flex gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...filters, micOnly: !filters.micOnly })}
                        aria-pressed={filters.micOnly}
                        className={`flex-1 h-10 rounded-lg border px-3 text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${filters.micOnly ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#c4b5fd]' : 'bg-[#0a0b0f] border-white/[0.1] text-[#c9ccd4] hover:border-white/20'}`}
                    >
                        <BsMic aria-hidden="true" />
                        {t('lfg.filters.micOnly')}
                    </button>
                    {onReset && (
                        <button type="button" onClick={onReset} className="gh-icon-btn !h-10 !w-10 shrink-0" aria-label={t('lfg.filters.reset')} title={t('lfg.filters.reset')}>
                            <BsArrowCounterclockwise aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
