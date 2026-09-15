// Lazy Firestore access for feature code (keeps the Firestore SDK out of the initial bundle).
//
//   const { db, doc, getDoc, setDoc, collection, query, where, onSnapshot, serverTimestamp } = await firestore();
//   await setDoc(doc(db, 'users', uid, 'library', key), data, { merge: true });

let modulePromise = null;

export function firestore() {
    if (!modulePromise) {
        modulePromise = Promise.all([import('firebase/firestore'), import('../../firebaseConfig.js')])
            .then(([mod, { firestore: db }]) => ({ ...mod, db }));
    }
    return modulePromise;
}

/** Fresh Firebase ID token for backend calls (null when signed out). */
export async function getIdToken(user) {
    if (!user?.getIdToken) return null;
    try {
        return await user.getIdToken();
    } catch {
        return null;
    }
}

/** Firestore Timestamp | Date | number | ISO string -> Date (or null). */
export function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
