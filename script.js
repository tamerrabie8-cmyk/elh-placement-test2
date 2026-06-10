// Global Variables
let currentQuestion = 0;
let studentData = {};
let answers = {};
let testStartTime = null;
let timerInterval = null;
const TOTAL_QUESTIONS = 50;
const TEST_DURATION = 45 * 60; // 45 minutes in seconds

// Start Test
function startTest() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const educationLevel = document.getElementById('educationLevel').value;

    if (!fullName || !email || !educationLevel) {
        alert('Please fill in all required fields!');
        return;
    }

    if (!validateEmail(email)) {
        alert('Please enter a valid email address!');
        return;
    }

    studentData = { fullName, email, educationLevel };
    answers = {};
    currentQuestion = 0;
    testStartTime = Date.now();

    document.getElementById('welcomeScreen').classList.remove('active');
    document.getElementById('testScreen').classList.add('active');
    document.getElementById('totalQuestions').textContent = TOTAL_QUESTIONS;

    startTimer();
    loadQuestion();
}

// Email Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Timer
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
        const remaining = TEST_DURATION - elapsed;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Your test is being submitted.');
            submitTest();
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        document.getElementById('timerDisplay').textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Warn when 5 minutes left
        if (remaining <= 300 && remaining > 0) {
            document.querySelector('.timer').style.color = '#ef4444';
        }
    }, 1000);
}

// Load Question
function loadQuestion() {
    const question = allQuestions[currentQuestion];
    const container = document.getElementById('questionContainer');

    // Update section title
    document.getElementById('sectionTitle').textContent = 
        question.type.charAt(0).toUpperCase() + question.type.slice(1);

    let questionHTML = `<div class="question">`;
    questionHTML += `<p class="question-text">${question.question}</p>`;

    if (question.type === 'reading') {
        questionHTML += `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; line-height: 1.8; color: #333;">
            <strong>Reading Passage:</strong><br><br>${question.passage}
        </div>`;
    }

    if (question.type === 'writing') {
        const wordCount = answers[currentQuestion] ? answers[currentQuestion].split(/\s+/).length : 0;
        questionHTML += `<div class="writing-task">
            <textarea id="writingAnswer" placeholder="Write 80-120 words on the given topic..." onkeyup="updateWordCount()"></textarea>
            <div class="word-count">Word count: <span id="wordCountDisplay">${wordCount}</span> / 80-120</div>
        </div>`;
        if (answers[currentQuestion]) {
            setTimeout(() => {
                document.getElementById('writingAnswer').value = answers[currentQuestion];
                updateWordCount();
            }, 0);
        }
    } else {
        questionHTML += `<div class="options">`;
        question.options.forEach((option, index) => {
            const isSelected = answers[currentQuestion] === index;
            questionHTML += `
                <div class="option">
                    <input type="radio" id="option_${index}" name="answer" value="${index}" 
                        ${isSelected ? 'checked' : ''} onchange="selectAnswer(${index})">
                    <label for="option_${index}">${option}</label>
                </div>
            `;
        });
        questionHTML += `</div>`;
    }

    questionHTML += `</div>`;
    container.innerHTML = questionHTML;

    // Update progress
    document.getElementById('questionNumber').textContent = currentQuestion + 1;
    const progress = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // Update buttons
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    document.getElementById('nextBtn').style.display = currentQuestion === TOTAL_QUESTIONS - 1 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = currentQuestion === TOTAL_QUESTIONS - 1 ? 'block' : 'none';

    window.scrollTo(0, 0);
}

// Select Answer
function selectAnswer(index) {
    answers[currentQuestion] = index;
}

// Update Word Count
function updateWordCount() {
    const textarea = document.getElementById('writingAnswer');
    const text = textarea.value.trim();
    const words = text.length > 0 ? text.split(/\s+/).length : 0;
    document.getElementById('wordCountDisplay').textContent = words;
    answers[currentQuestion] = textarea.value;
}

// Navigation
function nextQuestion() {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
        currentQuestion++;
        loadQuestion();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

// Submit Test
function submitTest() {
    if (confirm('Are you sure you want to submit the test? You cannot change your answers after submission.')) {
        clearInterval(timerInterval);
        const results = calculateResults();
        displayResults(results);
    }
}

// Calculate Results
function calculateResults() {
    let grammarScore = 0;
    let vocabularyScore = 0;
    let readingScore = 0;
    let writingScore = 0;

    // Count total questions per section
    let grammarCount = 0;
    let vocabularyCount = 0;
    let readingCount = 0;

    // Grade each section
    allQuestions.forEach((question, index) => {
        const answer = answers[index];

        if (question.type === 'grammar') {
            grammarCount++;
            if (answer === question.correctAnswer) grammarScore++;
        } else if (question.type === 'vocabulary') {
            vocabularyCount++;
            if (answer === question.correctAnswer) vocabularyScore++;
        } else if (question.type === 'reading') {
            readingCount++;
            if (answer === question.correctAnswer) readingScore++;
        } else if (question.type === 'writing') {
            writingScore = evaluateWriting(answer);
        }
    });

    // Calculate percentages
    const grammarPercentage = (grammarScore / grammarCount) * 25;
    const vocabularyPercentage = (vocabularyScore / vocabularyCount) * 25;
    const readingPercentage = (readingScore / readingCount) * 25;
    const writingPercentage = writingScore; // 0-25

    const totalScore = Math.round(
        grammarPercentage + vocabularyPercentage + readingPercentage + writingPercentage
    );

    return {
        totalScore: Math.min(totalScore, 100),
        grammarScore: `${grammarScore}/${grammarCount}`,
        vocabularyScore: `${vocabularyScore}/${vocabularyCount}`,
        readingScore: `${readingScore}/${readingCount}`,
        writingScore: Math.round(writingPercentage),
    };
}

// Evaluate Writing (Basic Scoring)
function evaluateWriting(answer) {
    if (!answer || answer.trim().length === 0) return 0;

    const wordCount = answer.trim().split(/\s+/).length;

    // Scoring criteria
    if (wordCount >= 80 && wordCount <= 120) {
        return 25; // Full marks
    } else if (wordCount >= 70 && wordCount < 80) {
        return 20;
    } else if (wordCount >= 60 && wordCount < 70) {
        return 15;
    } else if (wordCount >= 50 && wordCount < 60) {
        return 10;
    } else if (wordCount > 0) {
        return 5;
    }
    return 0;
}

// Display Results
function displayResults(results) {
    document.getElementById('testScreen').classList.remove('active');
    document.getElementById('resultsScreen').classList.add('active');

    document.getElementById('finalScore').textContent = results.totalScore;
    document.getElementById('grammarScore').textContent = results.grammarScore;
    document.getElementById('vocabularyScore').textContent = results.vocabularyScore;
    document.getElementById('readingScore').textContent = results.readingScore;
    document.getElementById('writingScore').textContent = results.writingScore;

    const level = getLevel(results.totalScore);
    document.getElementById('levelName').textContent = level.name;
    document.getElementById('levelDescription').textContent = level.description;

    // Save to Google Sheets
    saveToGoogleSheets(results, level);
}

// Get Level
function getLevel(score) {
    const levels = [
        { 
            name: 'A1 Beginner', 
            description: 'You are at the beginner level. Your command of English is minimal. Focus on learning basic vocabulary and simple grammar structures.',
            range: [0, 20] 
        },
        { 
            name: 'A2 Elementary', 
            description: 'You have elementary proficiency. You can handle simple everyday situations. Continue practicing basic conversations and common vocabulary.',
            range: [21, 40] 
        },
        { 
            name: 'B1 Intermediate', 
            description: 'You have intermediate proficiency. You can handle most situations in English. Work on improving fluency and understanding complex topics.',
            range: [41, 60] 
        },
        { 
            name: 'B2 Upper-Intermediate', 
            description: 'You have upper-intermediate proficiency. You can communicate effectively in English. Focus on mastering advanced vocabulary and complex structures.',
            range: [61, 80] 
        },
        { 
            name: 'C1 Advanced', 
            description: 'Congratulations! You have achieved an advanced level. You can express yourself fluently and spontaneously without much effort.',
            range: [81, 100] 
        },
    ];

    for (let level of levels) {
        if (score >= level.range[0] && score <= level.range[1]) {
            return level;
        }
    }

    return levels[4];
}

// Save to Google Sheets
function saveToGoogleSheets(results, level) {
    const data = {
        fullName: studentData.fullName,
        email: studentData.email,
        educationLevel: studentData.educationLevel,
        totalScore: results.totalScore,
        level: level.name,
        grammarScore: results.grammarScore,
        vocabularyScore: results.vocabularyScore,
        readingScore: results.readingScore,
        writingScore: results.writingScore,
        timestamp: new Date().toISOString(),
    };

    // Call Google Apps Script
    if (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL !== 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent') {
        fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('✓ Results saved to Google Sheets:', data);
            })
            .catch((error) => {
                console.error('Error saving to Google Sheets:', error);
                // Still save locally as backup
                saveLocally(data);
            });
    } else {
        console.warn('Google Apps Script URL not configured. Saving locally...');
        saveLocally(data);
    }
}

// Save Locally (Backup)
function saveLocally(data) {
    let allResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    allResults.push(data);
    localStorage.setItem('testResults', JSON.stringify(allResults));
    console.log('✓ Results saved locally to browser storage');
}

// Download Certificate
function downloadCertificate() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#667eea');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', canvas.width / 2, 150);

    // Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial';
    ctx.fillText('English Learning Hub', canvas.width / 2, 250);

    // Content
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.fillText(`This certifies that`, canvas.width / 2, 380);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${studentData.fullName}`, canvas.width / 2, 450);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.fillText(`has successfully completed the English Placement Test`, canvas.width / 2, 530);

    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Level: ${document.getElementById('levelName').textContent}`, canvas.width / 2, 610);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${document.getElementById('finalScore').textContent}/100`, canvas.width / 2, 670);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, 720);

    // Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${studentData.fullName}_ELH_Certificate.png`;
    link.click();
}

// Retake Test
function retakeTest() {
    document.getElementById('resultsScreen').classList.remove('active');
    document.getElementById('welcomeScreen').classList.add('active');

    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('educationLevel').value = '';
    document.querySelector('.timer').style.color = '#e11d48';

    answers = {};
    currentQuestion = 0;
    studentData = {};
    testStartTime = null;
}