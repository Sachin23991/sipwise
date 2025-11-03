
const firebaseConfig = {
  apiKey: "AIzaSyCynxhC8FUJZfmwR2WSa5eAUcPysTWCe_Y",
  authDomain: "sipwise-89d46.firebaseapp.com",
  projectId: "sipwise-89d46",
  storageBucket: "sipwise-89d46.firebasestorage.app",
  messagingSenderId: "620832207017",
  appId: "1:620832207017:web:cf04d9f960dcae3ca939b8",
  measurementId: "G-CJTT00G79K"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const btnShowAnalysis = document.getElementById('btn-show-analysis');
    // MODIFICATION: Add selector for the new studio button
    const btnShowStudio = document.getElementById('btn-show-studio');
    const btnBackFromAnalysis = document.getElementById('btn-back-from-analysis');
    const analysisSection = document.getElementById('analysis-section');
    const analysisChartsContainer = document.getElementById('analysis-charts-container');
    const quizFlowContainer = document.getElementById('quiz-flow-container');
    const attemptCounterDisplay = document.getElementById('attempt-counter');
    const personalQuestionsChat = document.getElementById('personal-questions-chat');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const generatedQuizBox = document.getElementById('generated-quiz-box');
    const resultsBox = document.getElementById('results-box');
    const hydroPointsDisplay = document.getElementById('hydro-points-display');
    const imageStudio = document.getElementById('image-studio');
    const imagePromptInput = document.getElementById('image-prompt');
    const generateRealImageBtn = document.getElementById('generate-real-image-btn');
    const loadingImageSpinner = document.getElementById('loading-image');
    const finalImageContainer = document.getElementById('final-image-container');
    const finalAiImage = document.getElementById('final-ai-image');
    const downloadImageBtn = document.getElementById('download-image-btn');
    // MODIFICATION: Add selector for the new back button in the studio
    const studioBackBtn = document.getElementById('studio-back-btn');
    const factOfTheDayContainer = document.getElementById('fact-of-the-day-container');
    loadFactOfTheDay();

    // --- State Management ---
    const IMAGE_GENERATION_COST = 10;
    let hydroPoints = 0;
    let currentUser = null;
    let quizAttempts = 3;
    let personalAnswers = [];
    let currentQuizData = [];
    let currentQuestionIndex = 0;
    let currentRoundScore = 0;
    let correctAnswers = [];
    let incorrectAnswers = [];
    let currentDifficulty = 'Medium';
    let pointsPerQuestion = 15;

    // --- Authentication State Observer ---
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            difficultyButtons.forEach(btn => btn.disabled = false);
            fetch(`http://localhost:3000/api/points/${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    hydroPoints = data.hydroPoints || 0;
                    updatePointsDisplay();
                })
                .catch(() => {
                    hydroPoints = 0;
                    updatePointsDisplay();
                });
        } else {
            difficultyButtons.forEach(btn => btn.disabled = true);
            hydroPoints = 0;
            updatePointsDisplay();
        }
    });

    // --- Event Listeners ---
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            currentDifficulty = e.target.dataset.difficulty;
            if (currentDifficulty === 'Easy') pointsPerQuestion = 10;
            else if (currentDifficulty === 'Medium') pointsPerQuestion = 15;
            else pointsPerQuestion = 20;
            startOrRetryQuiz();
        });
    });
    btnShowAnalysis.addEventListener('click', showAnalysis);
    // MODIFICATION: Add event listeners for the new buttons
    btnShowStudio.addEventListener('click', showImageStudio);
    studioBackBtn.addEventListener('click', goBackToHome);
    btnBackFromAnalysis.addEventListener('click', goBackToHome);
    sendBtn.addEventListener('click', handleUserResponse);
    userInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleUserResponse());
    generateRealImageBtn.addEventListener('click', handleImageGeneration);
    downloadImageBtn.addEventListener('click', handleImageDownload);

    // --- Initial Load Functions ---
    async function loadFactOfTheDay() {
        try {
            const fact = await callQuizApi('get_fact_of_the_day');
            factOfTheDayContainer.innerHTML = `<h3>💡 Fact of the Day</h3><p>${fact}</p>`;
        } catch (e) {
            factOfTheDayContainer.innerHTML = `<h3>💡 Fact of the Day</h3><p>Could not load a fact. Ensure server is running.</p>`;
        }
    }

    // --- Core API Call Functions ---
    async function callQuizApi(stage, payload = {}) {
        try {
            const response = await fetch('http://localhost:3000/api/quiz-master', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage, ...payload })
            });
            if (!response.ok) throw new Error(`Server Error: ${response.statusText}`);
            if (stage === 'start_interview' || stage === 'get_fact_of_the_day') {
                return await response.text();
            }
            return await response.json();
        } catch (error) {
            console.error(`API Call Failed for stage ${stage}:`, error);
            if (stage !== 'get_fact_of_the_day') {
                addMessageToChat('ai', `Sorry, I'm having trouble connecting. Error: ${error.message}`);
            }
            throw error;
        }
    }

    async function updateUserPoints(uid, totalPoints) {
        try {
            await fetch('http://localhost:3000/api/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, points: totalPoints })
            });
        } catch (error) {
            console.error('Failed to update points on server:', error);
            alert('Could not save your new score. Please check your connection.');
        }
    }

    // --- Image Generation & Download ---
    async function handleImageGeneration() {
        if (!currentUser) return alert("You must be logged in to generate an image.");
        const userPrompt = imagePromptInput.value.trim();
        if (!userPrompt) return alert("Please describe the image you want to create.");
        if (hydroPoints < IMAGE_GENERATION_COST) return alert(`You need at least ${IMAGE_GENERATION_COST} Hydro Points for this!`);

        loadingImageSpinner.classList.remove('hidden');
        finalImageContainer.classList.add('hidden');
        generateRealImageBtn.disabled = true;
        try {
            const response = await fetch('http://localhost:3000/api/generate-real-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userPrompt, uid: currentUser.uid })
            });
            const data = await response.json();
            if (response.ok) {
                hydroPoints -= IMAGE_GENERATION_COST;
                await updateUserPoints(currentUser.uid, hydroPoints);
                updatePointsDisplay();
                finalAiImage.src = data.imageUrl;
                finalImageContainer.classList.remove('hidden');
            } else {
                throw new Error(data.error || `Image Gen Server Error: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Image Generation Failed:', error);
            alert(`Sorry, the image could not be generated. Error: ${error.message}`);
        } finally {
            loadingImageSpinner.classList.add('hidden');
            generateRealImageBtn.disabled = false;
        }
    }

    async function handleImageDownload() {
    try {
        // Fetch the image data from the URL
        const response = await fetch(finalAiImage.src);
        const imageBlob = await response.blob();

        // Create a temporary URL for the downloaded blob
        const blobUrl = URL.createObjectURL(imageBlob);

        // Use the temporary URL to trigger the download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'sipwise-ai-creation.jpeg';
        document.body.appendChild(link);
        link.click();
        
        // Clean up by removing the link and revoking the temporary URL
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

    } catch (error) {
        console.error('Download failed:', error);
        alert('Could not download the image. Please try right-clicking the image and selecting "Save Image As."');
    }
}

    // --- Main Application Flow & Navigation ---
    function startOrRetryQuiz() {
        if (!currentUser) {
            alert("Please log in to start a quiz and save your score!");
            window.location.href = 'loginpage.html';
            return;
        }
        correctAnswers = [];
        incorrectAnswers = [];
        currentRoundScore = 0;
        personalAnswers = [];
        [startScreen, analysisSection, imageStudio].forEach(el => el.classList.add('hidden'));
        quizFlowContainer.classList.remove('hidden');
        startInterview();
    }

    function goBackToHome() {
        [analysisSection, quizFlowContainer, imageStudio].forEach(el => el.classList.add('hidden'));
        startScreen.classList.remove('hidden');
        loadFactOfTheDay();
    }

    // MODIFICATION: Create a new function to show the image studio directly
    function showImageStudio() {
        if (!currentUser) {
            alert("Please log in to use the AI Image Studio.");
            window.location.href = 'loginpage.html';
            return;
        }
        [startScreen, quizFlowContainer, analysisSection].forEach(el => el.classList.add('hidden'));
        imageStudio.classList.remove('hidden');
    }

    async function startInterview() {
        personalAnswers = [];
        chatMessages.innerHTML = '';
        [generatedQuizBox, resultsBox].forEach(el => el.classList.add('hidden'));
        personalQuestionsChat.classList.remove('hidden');
        try {
            const firstQuestion = await callQuizApi('start_interview', { userAnswers: personalAnswers });
            if (firstQuestion) addMessageToChat('ai', firstQuestion);
        } catch (error) {}
    }

    async function handleUserResponse() {
        const text = userInput.value.trim();
        if (!text) return;
        addMessageToChat('user', text);
        personalAnswers.push(text);
        userInput.value = '';
        
        if (personalAnswers.length < 3) {
            try {
                const nextQuestion = await callQuizApi('start_interview', { userAnswers: personalAnswers });
                if (nextQuestion) addMessageToChat('ai', nextQuestion);
            } catch (error) {
                console.error("Error getting next question:", error);
                addMessageToChat('ai', "I encountered an error. Let's try again.");
                personalAnswers.pop();
            }
        } else {
            addMessageToChat('ai', 'Thank you! Generating your personalized quiz...');
            setTimeout(() => {
                personalQuestionsChat.classList.add('hidden');
                generateQuiz();
            }, 1500);
        }
    }

    async function generateQuiz() {
        try {
            if (currentUser) {
                await fetch('http://localhost:3000/api/activity/interview-answers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: currentUser.uid, answers: personalAnswers })
                });
            }
            const data = await callQuizApi('generate_quiz', { userAnswers: personalAnswers, difficulty: currentDifficulty });
            if (!data || !data.quiz || data.quiz.length === 0) {
                personalQuestionsChat.classList.remove('hidden');
                addMessageToChat('ai', 'The AI had trouble creating questions. Please try again.');
                setTimeout(goBackToHome, 3000);
                return;
            }
            currentQuizData = data.quiz;
            currentQuestionIndex = 0;
            personalQuestionsChat.classList.add('hidden');
            generatedQuizBox.classList.remove('hidden');
            displayQuestion();
        } catch (e) {
            console.error("Error in generateQuiz:", e);
        }
    }

    // --- Display and Results Logic ---
    function displayQuestion() {
        try {
            const question = currentQuizData[currentQuestionIndex];
            if (!question || !question.questionText || !Array.isArray(question.answers)) {
                throw new Error(`Invalid question data received from AI at index ${currentQuestionIndex}.`);
            }
            let answerButtonsHTML = question.answers.map((answer, index) => `<button class="btn-answer" data-index="${index}">${answer}</button>`).join('');
            generatedQuizBox.innerHTML = `
                <div>Question ${currentQuestionIndex + 1} of ${currentQuizData.length}</div>
                <div class="progress-bar"><div class="progress-bar-full" style="width: ${((currentQuestionIndex + 1) / currentQuizData.length) * 100}%"></div></div>
                <h2 id="question-text">${question.questionText}</h2>
                <div id="answer-buttons">${answerButtonsHTML}</div>`;
            document.querySelectorAll('.btn-answer').forEach(button => button.addEventListener('click', selectAnswer));
        } catch (error) {
            console.error("CRITICAL: Failed to display question.", error);
            generatedQuizBox.innerHTML = `
                <h2>Oops! An Error Occurred</h2>
                <p>There was a problem displaying the quiz question. The AI may have returned an unexpected format.</p>
                <div class="button-group">
                    <button id="error-back-btn" class="btn-link secondary">Go Back Home</button>
                </div>`;
            document.getElementById('error-back-btn').addEventListener('click', goBackToHome);
        }
    }
    
    function selectAnswer(e) {
        const selectedButton = e.target;
        const selectedIndex = parseInt(selectedButton.dataset.index, 10);
        const questionData = currentQuizData[currentQuestionIndex];
        const correctIndex = questionData.correctAnswerIndex;
        document.querySelectorAll('.btn-answer').forEach(button => {
            button.disabled = true;
            if (parseInt(button.dataset.index, 10) === correctIndex) button.classList.add('correct');
            else button.classList.add('incorrect');
        });
        if (selectedIndex === correctIndex) {
            currentRoundScore += pointsPerQuestion;
            correctAnswers.push(questionData);
        } else {
            incorrectAnswers.push(questionData);
        }
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuizData.length) {
                displayQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }

    async function showResults() {
        generatedQuizBox.classList.add('hidden');
        resultsBox.classList.remove('hidden');
        resultsBox.innerHTML = `<div id="score-header"></div><div id="explanation-container"></div><div id="results-buttons-container" class="button-group"></div>`;
        
        hydroPoints += currentRoundScore;
        quizAttempts--;

        if (currentUser) {
            await updateUserPoints(currentUser.uid, hydroPoints);
            const quizHistoryData = {
                score: currentRoundScore,
                maxScore: currentQuizData.length * pointsPerQuestion,
                difficulty: currentDifficulty,
                correctCount: correctAnswers.length,
                incorrectCount: incorrectAnswers.length
            };
            await fetch('http://localhost:3000/api/activity/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: currentUser.uid, quizData: quizHistoryData })
            });
        }
        
        updatePointsDisplay();
        attemptCounterDisplay.textContent = `Attempts Remaining: ${quizAttempts}`;
        const maxScore = currentQuizData.length * pointsPerQuestion;
        const scoreHeader = document.getElementById('score-header');
        scoreHeader.innerHTML = `<h2>Quiz Complete!</h2><p>You scored ${currentRoundScore} out of ${maxScore} points this round! Your total is ${hydroPoints} 💧.</p>`;
        
        if (incorrectAnswers.length === 0 && currentRoundScore > 0) {
            scoreHeader.innerHTML += `<p>Amazing job! You got a perfect score!</p>`;
        }
        
        if (incorrectAnswers.length > 0) {
            showExplanations();
        }

        const buttonContainer = document.getElementById('results-buttons-container');
        if (quizAttempts > 0) {
             const retryBtn = document.createElement('button');
             retryBtn.className = 'btn-link primary';
             retryBtn.textContent = 'Take Another Quiz';
             retryBtn.addEventListener('click', goBackToHome);
             buttonContainer.appendChild(retryBtn);
        }
        
        const goToStudioBtn = document.createElement('button');
        goToStudioBtn.className = 'btn-link secondary';
        goToStudioBtn.textContent = 'Generate an Image';
        goToStudioBtn.addEventListener('click', () => {
            resultsBox.classList.add('hidden');
            imageStudio.classList.remove('hidden');
        });
        buttonContainer.appendChild(goToStudioBtn);
        
        if (quizAttempts <= 0) {
            scoreHeader.innerHTML += `<p>You have used all your attempts. Great effort!</p>`;
        }
    }

    async function showExplanations() {
        const container = document.getElementById('explanation-container');
        container.innerHTML = `<div class="loading-spinner-small"></div>`;
        try {
            const data = await callQuizApi('explain_wrong_answers', { incorrectQuestions: incorrectAnswers });
            let explanationHTML = '<h3>Let\'s review what you missed:</h3>';
            if (data.explanations && data.explanations.length > 0) {
                data.explanations.forEach(item => {
                    explanationHTML += `<div class="explanation-item"><p class="explanation-q"><strong>Question:</strong> ${item.question}</p><p class="explanation-a"><strong>Explanation:</strong> ${item.explanation}</p></div>`;
                });
            } else {
                explanationHTML = '';
            }
            container.innerHTML = explanationHTML;
        } catch(e) {
            container.innerHTML = `<h3>Let's review what you missed:</h3><p>Could not load explanations.</p>`;
        }
    }
    
    function addMessageToChat(sender, text) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', `${sender}-bubble`);
        bubble.innerHTML = `<div class="message">${text}</div>`;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return bubble;
    }
    
    function showAnalysis() {
        [startScreen, quizFlowContainer, imageStudio].forEach(el => el.classList.add('hidden'));
        analysisSection.classList.remove('hidden');
        renderCharts();
    }
    
    const updatePointsDisplay = () => hydroPointsDisplay.textContent = `Hydro Points: ${hydroPoints} 💧`;

    // --- Chart Data and Rendering ---
    const chartDataModule = [
        { title: 'Sugar Content in Popular Indian Drinks (grams per 300ml)', type: 'bar', data: { labels: ['Cola', 'Masala Chai (Street)', 'Lassi (Sweet)', 'Packaged Juice', 'Nimbu Pani (Sweet)'], datasets: [{ label: 'Sugar (g)', data: [35, 15, 25, 30, 20], backgroundColor: ['#c62828', '#e65100', '#f97316', '#ff9800', '#ffb74d'] }] } },
        { title: 'Contribution to Daily Calorie Intake by Beverage Type', type: 'pie', data: { labels: ['Sugary Soft Drinks', 'Tea/Coffee with Sugar', 'Fruit Juices', 'Milk-based Drinks', 'Water'], datasets: [{ data: [15, 25, 10, 20, 30], backgroundColor: ['#d32f2f', '#f57c00', '#ffa000', '#ffc107', '#4caf50'] }] } },
        { title: 'Caffeine Content Comparison (mg per 250ml)', type: 'bar', data: { labels: ['Filter Coffee', 'Instant Coffee', 'Espresso (60ml)', 'Darjeeling Tea', 'Cola'], datasets: [{ label: 'Caffeine (mg)', data: [140, 65, 80, 50, 25], backgroundColor: ['#6d4c41', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8'] }] } },
        { title: 'Hydration Sources Among Urban Youth in India', type: 'doughnut', data: { labels: ['Packaged Water', 'Soft Drinks', 'Juices', 'Tap Water', 'Tea/Coffee'], datasets: [{ data: [40, 25, 15, 10, 10], backgroundColor: ['#1976d2', '#d32f2f', '#ffa000', '#616161', '#8d6e63'] }] } },
        { title: 'Prevalence of Dental Cavities vs. Soft Drink Consumption', type: 'line', data: { labels: ['2020', '2021', '2022', '2023', '2024'], datasets: [{ label: 'Cavity Prevalence (%)', data: [45, 48, 52, 55, 60], borderColor: '#d32f2f', fill: false, tension: 0.4 }] } },
        { title: 'Common Reasons for Choosing Sugary Drinks', type: 'polarArea', data: { labels: ['Taste', 'Habit', 'Social Pressure', 'Energy Boost', 'Availability'], datasets: [{ data: [40, 25, 15, 15, 20], backgroundColor: ['#ef5350', '#ff7043', '#ffa726', '#ffca28', '#ffee58'] }] } },
        { title: 'Awareness of "Hidden Sugars" in Packaged Foods', type: 'pie', data: { labels: ['Aware', 'Somewhat Aware', 'Not Aware'], datasets: [{ data: [25, 45, 30], backgroundColor: ['#66bb6a', '#ffca28', '#ef5350'] }] } },
        { title: 'Impact of Hydration on Productivity (Self-Reported)', type: 'radar', data: { labels: ['Focus', 'Energy', 'Mood', 'Memory', 'Creativity'], datasets: [{ label: 'Well-Hydrated', data: [8, 9, 7, 6, 7], backgroundColor: 'rgba(25, 118, 210, 0.4)', borderColor: '#1976d2' }, { label: 'Dehydrated', data: [4, 3, 4, 3, 2], backgroundColor: 'rgba(211, 47, 47, 0.4)', borderColor: '#d32f2f' }] } },
        { title: 'Market Growth of Alternative Milks (YoY %)', type: 'line', data: { labels: ['2021', '2022', '2023', '2024', '2025 (Proj.)'], datasets: [{ label: 'Oat Milk', data: [20, 35, 50, 60, 75], borderColor: '#a1887f' }, { label: 'Almond Milk', data: [15, 22, 30, 35, 40], borderColor: '#d7ccc8' }] } },
        { title: 'Cost Comparison: Water vs. Other Beverages (Monthly)', type: 'bar', data: { labels: ['Bottled Water', 'Cola (Daily)', 'Coffee Shop (Daily)', 'Packaged Juice'], datasets: [{ label: 'Monthly Cost (INR)', data: [600, 1200, 4500, 1500], backgroundColor: ['#1976d2', '#d32f2f', '#6d4c41', '#ffa000'] }] } }
    ];

    function renderCharts() {
        analysisChartsContainer.innerHTML = '';
        chartDataModule.forEach(chartConfig => {
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'chart-wrapper';
            const title = document.createElement('h3');
            title.textContent = chartConfig.title;
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            const canvas = document.createElement('canvas');
            chartContainer.appendChild(canvas);
            chartWrapper.appendChild(title);
            chartWrapper.appendChild(chartContainer);
            analysisChartsContainer.appendChild(chartWrapper);
            new Chart(canvas, {
                type: chartConfig.type,
                data: chartConfig.data,
                options: { responsive: true, maintainAspectRatio: false }
            });
        });
    }

    // --- INITIALIZE APP ---
    loadFactOfTheDay();
});



