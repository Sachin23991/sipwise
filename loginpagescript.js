// Import Firebase modules using full CDN URLs for browser compatibility
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


// ---
// IMPORTANT: This is a placeholder configuration.
// You must replace it with your own Firebase project's configuration
// for authentication to work.
// ---
const firebaseConfig = {
  apiKey: "AIzaSyCynxhC8FUJZfmwR2WSa5eAUcPysTWCe_Y",
  authDomain: "sipwise-89d46.firebaseapp.com",
  projectId: "sipwise-89d46",
  storageBucket: "sipwise-89d46.firebasestorage.app",
  messagingSenderId: "620832207017",
  appId: "1:620832207017:web:cf04d9f960dcae3ca939b8",
  measurementId: "G-CJTT00G79K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// If the user is already authenticated, redirect them to home immediately.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Prevent redirect loops if already on home
        if (!window.location.pathname.endsWith('home.html')) {
            window.location.href = 'home.html';
        }
    }
});

// Wait for the DOM to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // Helper utilities to safely select elements and attach listeners
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    const safeAddListener = (elOrSel, event, handler) => {
        if (!elOrSel) return;
        let el = typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel;
        if (!el) return;
        el.addEventListener(event, handler);
    };

    // --- Element Selections ---
    const forms = {
        // try expected IDs first, then fall back to the markup actually present in loginpage.html
        signin: document.getElementById('signin-form') || document.querySelector('.sign-in-container form'),
        signup: document.getElementById('signup-form') || document.querySelector('.sign-up-container form'),
        forgot: document.getElementById('forgot-form') || document.querySelector('#forgot-password')
    };

    const submitButtons = {
        signin: document.querySelector('#signin .auth-btn.primary'),
        signup: document.querySelector('#signup .auth-btn.primary'),
        forgot: document.querySelector('#forgot-password .auth-btn.primary')
    };

    let currentForm = 'signin';

    // --- Event Listeners ---

    // Setup listeners for the main toggle buttons (Sign In / Sign Up)
    // The original HTML expects elements with class .toggle-btn, but this page uses #signIn and #signUp.
    // Try both.
    $$('.toggle-btn').forEach(btn => safeAddListener(btn, 'click', (e) => {
        const formType = e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.form : null;
        if (formType) switchForm(formType);
    }));
    safeAddListener('#signIn', 'click', (e) => { e.preventDefault(); switchForm('signin'); });
    safeAddListener('#signUp', 'click', (e) => { e.preventDefault(); switchForm('signup'); });

    // Listener for the "Forgot Password?" link
    // The markup uses an element with id "resetPasswordLink" — support that too.
    const forgotLink = document.querySelector('.forgot-password') || document.getElementById('resetPasswordLink');
    if (forgotLink) safeAddListener(forgotLink, 'click', (e) => { e.preventDefault(); switchForm('forgot'); });

    // Listener for the "Back to Sign In" button (optional)
    safeAddListener('#back-to-signin-btn', 'click', (e) => { e.preventDefault(); switchForm('signin'); });

    // Listeners for form submissions — support both ID-based and the current markup
    const signinForm = document.getElementById('signin') || forms.signin;
    if (signinForm) safeAddListener(signinForm, 'submit', (e) => { e.preventDefault(); handleSignIn(); });

    const signupForm = document.getElementById('signup') || forms.signup;
    if (signupForm) safeAddListener(signupForm, 'submit', (e) => { e.preventDefault(); handleSignUp(); });

    const forgotForm = document.getElementById('forgot-password') || forms.forgot;
    if (forgotForm) safeAddListener(forgotForm, 'submit', (e) => { e.preventDefault(); handlePasswordReset(); });

    // Listeners for both "Continue with Google" buttons
    $$('.google-btn').forEach(btn => safeAddListener(btn, 'click', (e) => { handleGoogleAuth(e.currentTarget || btn); }));

    // Listeners for password visibility toggles (optional)
    $$('.password-toggle').forEach(btn => safeAddListener(btn, 'click', (e) => {
        const input = e.currentTarget.previousElementSibling;
        if (input) togglePasswordVisibility(input, e.currentTarget);
    }));

    // Listener for the password strength meter (if present)
    const signupPasswordInput = document.getElementById('signup-password');
    if (signupPasswordInput) safeAddListener(signupPasswordInput, 'input', (e) => checkPasswordStrength(e.target.value));

    // --- Core Functions ---

    /**
     * Switches the visible form between Sign In, Sign Up, and Forgot Password.
     * @param {string} formType - The form to switch to ('signin', 'signup', or 'forgot').
     */
    function switchForm(formType) {
        if (formType === currentForm) return;

        // This page uses the overlay template where toggling the panel
        // is done by adding/removing a class on the main container (#container).
        // We'll toggle that class and ensure the right form is focused.
        const mainContainer = document.getElementById('container') || document.querySelector('.container');

        if (formType === 'signup') {
            if (mainContainer) mainContainer.classList.add('right-panel-active');
            // focus first input in signup form
            const signupFirst = forms.signup && forms.signup.querySelector('input');
            if (signupFirst) signupFirst.focus();
        } else if (formType === 'signin') {
            if (mainContainer) mainContainer.classList.remove('right-panel-active');
            const signinFirst = forms.signin && forms.signin.querySelector('input');
            if (signinFirst) signinFirst.focus();
        } else if (formType === 'forgot') {
            // If there's a dedicated forgot form container, show it; otherwise try to show signin
            if (forms.forgot) {
                // Hide overlay so forgot form is visible if it's separate
                if (mainContainer) mainContainer.classList.remove('right-panel-active');
                const forgotFirst = forms.forgot.querySelector('input');
                if (forgotFirst) forgotFirst.focus();
            } else {
                // fallback to signin view
                if (mainContainer) mainContainer.classList.remove('right-panel-active');
            }
        }
        currentForm = formType;
    }

    /**
     * Handles the user sign-in process with email and password.
     */
    async function handleSignIn() {
        // Prefer inputs inside the visible signin form, fall back to id-based selectors
        const signinFormLocal = document.getElementById('signin') || forms.signin;
        const emailInput = signinFormLocal ? signinFormLocal.querySelector('input[type="email"]') : document.getElementById('signin-email');
        const passwordInput = signinFormLocal ? signinFormLocal.querySelector('input[type="password"]') : document.getElementById('signin-password');
        const email = emailInput ? (emailInput.value || '').trim() : '';
        const password = passwordInput ? (passwordInput.value || '') : '';
        const submitBtn = submitButtons.signin || (signinFormLocal ? signinFormLocal.querySelector('button[type="submit"], button') : null);

        if (!email || !password) {
            showErrorModal('Please fill in both email and password.');
            return;
        }

        showLoadingState(submitBtn, "Signing In...");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), { lastLogin: serverTimestamp() }, { merge: true });
            showSuccessModal('Welcome back! Redirecting...');
            setTimeout(() => window.location.href = 'home.html', 2000);
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(submitBtn, "Sign In");
        }
    }

    /**
     * Handles the user sign-up process.
     */
    async function handleSignUp() {
        const signupFormLocal = document.getElementById('signup') || forms.signup;
        const nameInput = signupFormLocal ? signupFormLocal.querySelector('input[type="text"], input[name="name"]') : document.getElementById('signup-name');
        const emailInput = signupFormLocal ? signupFormLocal.querySelector('input[type="email"]') : document.getElementById('signup-email');
        const passwordInputs = signupFormLocal ? signupFormLocal.querySelectorAll('input[type="password"]') : [];
        const password = passwordInputs && passwordInputs.length > 0 ? passwordInputs[0].value : (document.getElementById('signup-password') ? document.getElementById('signup-password').value : '');
        const confirmPassword = passwordInputs && passwordInputs.length > 1 ? passwordInputs[1].value : (document.getElementById('confirm-password') ? document.getElementById('confirm-password').value : '');
        const termsCheckbox = signupFormLocal ? signupFormLocal.querySelector('input[type="checkbox"]') : document.getElementById('terms-agreement');
        const name = nameInput ? (nameInput.value || '').trim() : '';
        const email = emailInput ? (emailInput.value || '').trim() : '';
        const terms = termsCheckbox ? !!termsCheckbox.checked : false;
        const submitBtn = submitButtons.signup || (signupFormLocal ? signupFormLocal.querySelector('button[type="submit"], button') : null);

        // If the signup form doesn't include a confirm-password field, skip the match check
        const hasConfirmField = !!(signupFormLocal && signupFormLocal.querySelector('input[name="confirm-password"], input[id="confirm-password"]')) || (passwordInputs && passwordInputs.length > 1);
        if (hasConfirmField && password !== confirmPassword) {
            showErrorModal('Passwords do not match.');
            return;
        }
        // If there's a terms checkbox present, require it; otherwise assume acceptance for this simple form
        const hasTermsField = !!termsCheckbox;
        if (hasTermsField && !terms) {
            showErrorModal('You must agree to the Terms & Conditions.');
            return;
        }

        showLoadingState(submitBtn, "Creating Account...");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            await createUserDocument(user, name);
            showSuccessModal('Account created! Redirecting...');
            setTimeout(() => window.location.href = 'home.html', 2000);
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(submitBtn, "Create Account");
        }
    }

    /**
     * Handles the Google authentication flow.
     * @param {HTMLElement} button - The Google button that was clicked.
     */
    async function handleGoogleAuth(button) {
        showLoadingState(button, "Continuing...");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await createUserDocument(user, user.displayName);
            } else {
                await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
            }
            showSuccessModal('Signed in with Google! Redirecting...');
            setTimeout(() => window.location.href = 'home.html', 2000);
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(button, "Continue with Google");
        }
    }

    /**
     * Sends a password reset email.
     */
    async function handlePasswordReset() {
        const forgotFormLocal = document.getElementById('forgot-password') || forms.forgot;
        const emailInput = forgotFormLocal ? forgotFormLocal.querySelector('input[type="email"]') : document.getElementById('reset-email');
        const email = emailInput ? (emailInput.value || '').trim() : '';
        const submitBtn = submitButtons.forgot || (forgotFormLocal ? forgotFormLocal.querySelector('button[type="submit"], button') : null);
        if (!email) {
            showErrorModal('Please enter your email address.');
            return;
        }
        showLoadingState(submitBtn, "Sending...");
        try {
            await sendPasswordResetEmail(auth, email);
            showSuccessModal('Password reset link sent! Please check your email.');
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(submitBtn, "Send Reset Link");
        }
    }


    // --- Helper & Utility Functions ---

    /**
     * Creates a new user document in Firestore upon first sign-up.
     * @param {object} user - The Firebase user object.
     * @param {string} displayName - The user's display name.
     */
    async function createUserDocument(user, displayName) {
        const userRef = doc(db, 'users', user.uid);
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            carbonFootprint: { transport: 0, food: 0, energy: 0, total: 0 },
        };
        await setDoc(userRef, userData);
    }

    /**
     * Toggles the visibility of a password input field.
     * @param {HTMLInputElement} input - The password input element.
     * @param {HTMLElement} button - The toggle button element.
     */
    function togglePasswordVisibility(input, button) {
        const icon = button.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            input.classList.add('visible');
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            input.classList.remove('visible');
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    /**
     * Updates the password strength meter based on the input.
     * @param {string} password - The password string to evaluate.
     */
    function checkPasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        if (!strengthFill || !strengthText) return;

        let strength = 0;
        if (password.length > 5) strength++;
        if (password.length > 7) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
        const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];

        strengthFill.style.width = `${(strength / 5) * 100}%`;
        strengthFill.style.backgroundColor = colors[strength - 1] || '#eee';
        strengthText.textContent = labels[strength - 1] || 'Strength';
    }
    
    /**
     * Shows a loading state on a button.
     * @param {HTMLElement} button - The button to update.
     * @param {string} loadingText - The text to display while loading.
     */
    function showLoadingState(button, loadingText = "Loading...") {
        if (!button) return;
        button.classList.add('loading');
        button.disabled = true;

        // Try to update a child element's text if present, otherwise update the button's text content.
        const textEl = button.querySelector('.btn-text') || button.querySelector('.social-btn span');
        if (textEl) {
            // store original if not stored
            if (!button.dataset.originalText) button.dataset.originalText = textEl.textContent || '';
            textEl.textContent = loadingText;
        } else {
            if (!button.dataset.originalText) button.dataset.originalText = button.textContent || '';
            button.textContent = loadingText;
        }
    }
    
    /**
     * Hides the loading state and restores a button's original text.
     * @param {HTMLElement} button - The button to update.
     * @param {string} originalText - The original text to restore.
     */
    function hideLoadingState(button, originalText = "Submit") {
        if (!button) return;
        button.classList.remove('loading');
        button.disabled = false;

        const textEl = button.querySelector('.btn-text') || button.querySelector('.social-btn span');
        const saved = button.dataset.originalText || originalText;
        if (textEl) {
            textEl.textContent = saved;
        } else {
            button.textContent = saved;
        }
        // clear the saved original so toggles use fresh content next time
        delete button.dataset.originalText;
    }

    /**
     * Displays the success modal with a custom message.
     * @param {string} message - The message to display.
     */
    function showSuccessModal(message) {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.querySelector('.modal-message').textContent = message;
            modal.classList.add('active');
            setTimeout(() => modal.classList.remove('active'), 3000); // Auto-hide after 3 seconds
        }
    }

    /**
     * Displays the error modal with a custom message.
     * @param {string} message - The error message to display.
     */
    function showErrorModal(message) {
        const modal = document.getElementById('error-modal');
        if (modal) {
            modal.querySelector('#error-message').textContent = message;
            modal.classList.add('active');
        }
    }

    /**
     * Translates Firebase auth error codes into user-friendly messages.
     * @param {object} error - The Firebase error object.
     */
    function handleAuthError(error) {
        let message = 'An unknown error occurred. Please try again.';
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = 'Invalid email or password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account already exists with this email address.';
                break;
            case 'auth/weak-password':
                message = 'Password must be at least 6 characters long.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign-in window was closed. Please try again.';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your internet connection.';
                break;
        }
        showErrorModal(message);
    }
});