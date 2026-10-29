// Firebase configuration + initialization.
// ----------------------------------------
// Replace the placeholder values below with your own project settings
// (Firebase Console -> Project settings -> General -> Your apps -> SDK config).
//
// Note: a Firebase *web* config is not a secret — it is safe to ship in the
// browser. Access is enforced by Firebase Authentication + Realtime Database
// security rules (see web/database.rules.json), NOT by hiding these values.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.REGION.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Shared references used by auth.js and index.js
const auth = firebase.auth();
const db = firebase.database();
