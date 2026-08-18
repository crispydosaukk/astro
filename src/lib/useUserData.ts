import { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface UserData {
  name: string;
  firstName: string;
  email: string;
  [key: string]: any;
}

export function useUserData() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const defaultName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        const defaultFirstName = defaultName.split(' ')[0];

        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const name = data.name || defaultName;
            const firstName = data.firstName || name.split(' ')[0];
            setUserData({ ...data, name, firstName, email: currentUser.email || '' } as UserData);
          } else {
            setUserData({ name: defaultName, firstName: defaultFirstName, email: currentUser.email || '' } as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData({ name: defaultName, firstName: defaultFirstName, email: currentUser.email || '' } as UserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, loading };
}
