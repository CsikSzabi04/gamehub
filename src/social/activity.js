// Public activity feed entries (collection "activity"). Fire-and-forget: never blocks the UI.
//
//   postActivity(user, profile, { type: 'review', gameKey: 'steam-730', gameName: 'Counter-Strike 2', text: '5/5' });
//
// types: review | completed | playing | levelUp | lfg | follow | build | tierlist | challenge
import { firestore } from '../lib/firebase.js';

export async function postActivity(user, profile, { type, gameKey = null, gameName = null, text = null, url = null, image = null }) {
    if (!user?.uid || !type) return;
    if (profile?.isPublic === false) return; // private profiles don't show up in feeds
    try {
        const { db, collection, addDoc, serverTimestamp } = await firestore();
        await addDoc(collection(db, 'activity'), {
            uid: user.uid,
            username: profile?.username || user.displayName || 'Player',
            type,
            gameKey,
            gameName: gameName ? String(gameName).slice(0, 120) : null,
            text: text ? String(text).slice(0, 280) : null,
            url,
            image,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Could not post activity:', error);
    }
}
