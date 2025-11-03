// This uses the same firebaseConfig from your loginpagescript.js
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const userDisplayName = document.getElementById('user-display-name');
    const userEmail = document.getElementById('user-email');
    const profileAvatar = document.getElementById('profile-avatar');
    const hydroPointsDisplay = document.getElementById('hydro-points-display');
    const displayNameInput = document.getElementById('displayName');
    const photoURLInput = document.getElementById('photoURL');
    const profileForm = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('logout-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const verifyEmailBtn = document.getElementById('verify-email-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const getTipsBtn = document.getElementById('get-tips-btn');
    const healthTipsContainer = document.getElementById('health-tips-container');
    const imageGalleryContainer = document.getElementById('image-gallery-container');
    const quizHistoryContainer = document.getElementById('quiz-history-container');

    // --- Authentication State Observer ---
    auth.onAuthStateChanged(user => {
        if (user) {
            userDisplayName.textContent = user.displayName || 'Anonymous';
            userEmail.textContent = user.email;
            profileAvatar.src = user.photoURL || 'https://i.ibb.co/6yvC0rT/default-avatar.png';
            displayNameInput.value = user.displayName || '';
            photoURLInput.value = user.photoURL || '';

            fetch(`http://localhost:3000/api/points/${user.uid}`)
                .then(response => response.json())
                .then(data => {
                    hydroPointsDisplay.textContent = data.hydroPoints || '0';
                })
                .catch(error => {
                    console.error('Failed to fetch points:', error);
                    hydroPointsDisplay.textContent = 'N/A';
                });
        } else {
            window.location.href = 'loginpage.html';
        }
    });

    // --- Profile Form Submission & Security Actions ---
    profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newDisplayName = displayNameInput.value.trim();
    const newPhotoURL = photoURLInput.value.trim();

    try {
        // Step 1: Update the Firebase Authentication profile
        await user.updateProfile({
            displayName: newDisplayName,
            photoURL: newPhotoURL
        });

        // Step 2: Update the Firestore database document
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({
            displayName: newDisplayName,
            photoURL: newPhotoURL
        }, { merge: true }); // Use merge: true to avoid overwriting other fields like hydroPoints

        // Step 3: Update the UI
        alert('Profile updated successfully!');
        userDisplayName.textContent = newDisplayName;
        profileAvatar.src = newPhotoURL || 'https://i.ibb.co/6yvC0rT/default-avatar.png';

    } catch (error) {
        alert('Error updating profile: ' + error.message);
    }
});

    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
    
    changePasswordBtn.addEventListener('click', () => {
        auth.sendPasswordResetEmail(auth.currentUser.email)
            .then(() => alert('Password reset link sent to your email.'))
            .catch((error) => alert('Error sending reset link: ' + error.message));
    });
    
    verifyEmailBtn.addEventListener('click', () => {
        if (auth.currentUser.emailVerified) {
            return alert('Your email is already verified!');
        }
        auth.currentUser.sendEmailVerification()
            .then(() => alert('Verification email sent!'));
    });

    // --- Tab Navigation ---
    const sidebarNav = document.querySelector('.sidebar-nav');
    const contentTabs = document.querySelectorAll('.content-tab');
    sidebarNav.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button.nav-item');
        if (targetButton) {
            const tabId = targetButton.dataset.tab;
            if (!tabId) return;

            sidebarNav.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            targetButton.classList.add('active');

            contentTabs.forEach(tab => {
                tab.classList.toggle('active', tab.id === `${tabId}-tab`);
            });

            if (tabId === 'activity') {
                loadActivityData();
            }
        }
    });
    
    // --- 'My Activity' Tab Logic ---
    async function loadActivityData() {
        const user = auth.currentUser;
        if (!user) return;

        healthTipsContainer.innerHTML = '';
        imageGalleryContainer.innerHTML = '<p>Loading gallery...</p>';
        quizHistoryContainer.innerHTML = '<p>Loading history...</p>';

        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().imageGallery) {
                const gallery = doc.data().imageGallery.slice(-5).reverse();
                imageGalleryContainer.innerHTML = '';
                gallery.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.className = 'gallery-img';
                    imageGalleryContainer.appendChild(img);
                });
            } else {
                imageGalleryContainer.innerHTML = "<p>You haven't generated any images yet.</p>";
            }
        });

        fetch(`http://localhost:3000/api/activity/quiz-history/${user.uid}`)
            .then(res => res.json())
            .then(history => {
                quizHistoryContainer.innerHTML = '';
                if (history && history.length > 0) {
                    history.forEach(item => {
                        const date = new Date(item.timestamp._seconds * 1000).toLocaleDateString();
                        const historyDiv = document.createElement('div');
                        historyDiv.className = 'history-item';
                        historyDiv.innerHTML = `
                            <div>
                                <strong>Quiz (${item.difficulty})</strong>
                                <div class="history-item-details">${date}</div>
                            </div>
                            <div class="history-item-score">${item.score}/${item.maxScore}</div>
                        `;
                        quizHistoryContainer.appendChild(historyDiv);
                    });
                } else {
                    quizHistoryContainer.innerHTML = '<p>No quiz history found.</p>';
                }
            });
    }

    getTipsBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;
        getTipsBtn.textContent = 'Generating...';
        getTipsBtn.disabled = true;

        try {
            const response = await fetch(`http://localhost:3000/api/activity/health-tips/${user.uid}`);
            const data = await response.json();
            healthTipsContainer.innerHTML = '';
            if (data.tips) {
                data.tips.forEach(tip => {
                    const tipDiv = document.createElement('div');
                    tipDiv.className = 'tip-item';
                    tipDiv.textContent = tip;
                    healthTipsContainer.appendChild(tipDiv);
                });
            } else {
                healthTipsContainer.innerHTML = `<p>${data.error || 'Could not generate tips.'}</p>`;
            }
        } catch (error) {
            healthTipsContainer.innerHTML = '<p>Could not generate tips at this time.</p>';
        } finally {
            getTipsBtn.textContent = 'Generate My Tips';
            getTipsBtn.disabled = false;
        }
    });

    // --- Theme (Dark Mode) Toggle ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
});