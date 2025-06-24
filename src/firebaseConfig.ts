// TODO: Replace with your actual Firebase project configuration
// This configuration can be found in your Firebase project settings.
// Go to Project settings > General > Your apps > Web app > SDK setup and configuration

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional, for Google Analytics for Firebase
};

// Check if all necessary keys are present and not placeholders
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" ||
    !firebaseConfig.authDomain || firebaseConfig.authDomain.includes("YOUR_PROJECT_ID") ||
    !firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
  console.warn(
    "WARNING: Firebase configuration in `firebaseConfig.ts` is using placeholder values. " +
    "To enable Firebase-dependent features (like saving chat history), " +
    "please update this file with your actual Firebase project credentials from the Firebase console. " +
    "Currently, Firebase features are disabled, and the app may use local fallbacks."
  );
}

export default firebaseConfig;