import React, { createContext, useState, useEffect, useCallback } from "react";
import { nextStreakFields } from "../Components/profile/profileUtils.js";

// Firebase is loaded after the first render (not part of the initial bundle):
// the auth SDK right away, the Firestore SDK only once a user is signed in.
const loadAuth = () => Promise.all([import("firebase/auth"), import("../../firebaseAuth.js")]);
const loadFirestore = () => Promise.all([import("firebase/firestore"), import("../../firebaseConfig.js")]);

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const [{ doc, getDoc, setDoc }, { firestore }] = await loadFirestore();
      const ref = doc(firestore, "users", currentUser.uid);
      const snapshot = await getDoc(ref);
      const data = snapshot.exists() ? snapshot.data() : {};
      if (!data.username) data.username = currentUser.displayName || currentUser.email.split("@")[0];

      const streakFields = nextStreakFields(data);
      const merged = { ...data, ...streakFields };
      setProfile(merged);

      if (streakFields || !snapshot.exists()) {
        setDoc(ref, { username: merged.username, ...streakFields }, { merge: true })
          .catch(error => console.error("Error saving streak:", error));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile({ username: currentUser.displayName || currentUser.email.split("@")[0] });
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    // The ~240 kB auth SDK waits until the first paint is done (idle, at most 800 ms);
    // only the profile page needs the user right away. (Login/SignUp load auth with their chunk.)
    const whenReady = window.location.pathname !== "/profile" && window.requestIdleCallback
      ? new Promise(resolve => window.requestIdleCallback(resolve, { timeout: 800 }))
      : Promise.resolve();

    whenReady
      .then(loadAuth)
      .then(([{ onAuthStateChanged }, { auth }]) => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          await loadProfile(currentUser);
          setAuthReady(true);
        });
      })
      .catch(error => {
        console.error("Error loading auth:", error);
        setAuthReady(true);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [loadProfile]);

  return (
    <UserContext.Provider value={{ user, profile, setProfile, authReady }}>
      {children}
    </UserContext.Provider>
  );
};
