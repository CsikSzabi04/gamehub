import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Stores that have an in-site game page (src/Features/StoreGamePage.jsx, route /game/:source/:id)
const GAME_PAGE_SOURCES = ['steam', 'gog'];

/**
 * Click handler for hub items: Steam and GOG games open their in-site game page
 * (the clicked item travels in router state, so the page header renders instantly),
 * everything else opens its store / source page.
 * Returns [onItemClick, modalElement]; modalElement is kept (null) so existing callers don't change.
 */
export default function useStoreItem() {
    const navigate = useNavigate();

    const onItemClick = useCallback(item => {
        if (GAME_PAGE_SOURCES.includes(item.source) && item.id != null) {
            navigate(`/game/${item.source}/${item.id}`, { state: { item } });
        } else if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    }, [navigate]);

    return [onItemClick, null];
}
