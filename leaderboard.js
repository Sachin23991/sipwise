const firebaseConfig = {
    apiKey: "AIzaSyCynxhC8FUJZfmwR2WSa5eAUcPysTWCe_Y",
    authDomain: "sipwise-89d46.firebaseapp.com",
    projectId: "sipwise-89d46",
    storageBucket: "sipwise-89d46.firebasestorage.app",
    messagingSenderId: "620832207017",
    appId: "1:620832207017:web:cf04d9f960dcae3ca939b8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    const leaderboardList = document.getElementById('leaderboard-list');
    let currentUser = null;

    // Listen for authentication state to know who is logged in
    auth.onAuthStateChanged(user => {
        currentUser = user;
        fetchLeaderboard();
    });

    /**
     * Fetches leaderboard data from the server API.
     */
    async function fetchLeaderboard() {
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard data.');
            }
            const leaderboardData = await response.json();
            renderLeaderboard(leaderboardData);
        } catch (error) {
            leaderboardList.innerHTML = `<p style="text-align: center;">Could not load leaderboard. Please try again later.</p>`;
            console.error(error);
        }
    }

    /**
     * Renders the leaderboard data into the DOM.
     * @param {Array} data - An array of user objects sorted by points.
     */
    function renderLeaderboard(data) {
        leaderboardList.innerHTML = ''; // Clear the loading spinner

        if (!data || data.length === 0) {
            leaderboardList.innerHTML = `<p style="text-align: center;">The leaderboard is empty. Be the first to earn points!</p>`;
            return;
        }

        data.forEach((user, index) => {
            const rank = index + 1;
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.dataset.rank = rank;

            // Highlight the current user's entry
            if (currentUser && currentUser.uid === user.uid) {
                listItem.classList.add('current-user');
            }

            listItem.innerHTML = `
                <div class="rank">${rank}</div>
                <img src="${user.photoURL}" alt="${user.displayName}" class="avatar">
                <div class="name">${user.displayName}</div>
                <div class="points">
                    <i class="fas fa-tint"></i>${user.hydroPoints}
                </div>
            `;
            leaderboardList.appendChild(listItem);
        });
    }
});