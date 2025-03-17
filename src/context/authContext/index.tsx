// import React, { useState, useContext, useEffect } from 'react';
// import { auth } from '../../firebase';

// const AuthContext = React.createContext();

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userLoading, setUserLoading] = useState(true);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged((auth,initializer) => {
//       setCurrentUser(user);
//       setUserLoading(false);
//     });
//   }, []);
// }
