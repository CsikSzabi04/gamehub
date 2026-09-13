import { getFirestore } from 'firebase/firestore';
import { app, auth, firebaseConfig } from './firebaseAuth.js';

export { auth, firebaseConfig };
export const firestore = getFirestore(app);
