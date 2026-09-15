// Text helpers shared by the recommendation cards and the home page teaser.

export const formatHours = (hours, locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: hours < 10 ? 1 : 0 }).format(hours);

/** "Because you played Hades for 300 hours" / "Fits your taste: Roguelike, Pixel Graphics" */
export function reasonText(t, locale, because, sharedTags = [], tagNames = {}) {
    if (because?.name) {
        return t(`forYou.reason.${because.kind}`, { game: because.name, hours: formatHours(because.hours || 0, locale), rating: because.rating || '' });
    }
    const tags = sharedTags.map(tag => tagNames[tag]).filter(Boolean);
    return tags.length ? t('forYou.reason.tags', { tags: tags.join(', ') }) : '';
}
