// Joke Generator using External API
// Uses JokeAPI (https://jokeapi.dev) - Free API for jokes

let currentJoke = null;
let jokeHistory = [];
let jokeCount = 0;

// API endpoints
const JOKE_API_URLS = {
    jokesAPI: 'https://jokeapi.dev/random',
    officialJokesAPI: 'https://official-joke-api.appspot.com/jokes/random',
    programmingJokesAPI: 'https://official-joke-api.appspot.com/jokes/programming/random',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadHistory();
});

/**
 * Fetch a random joke from the external API
 */
async function getJoke() {
    const jokeType = document.getElementById('jokeType').value;
    const btn = document.getElementById('getJokeBtn');
    const loading = document.getElementById('loading');
    const jokeContent = document.getElementById('jokeContent');

    // Disable button and show loading
    btn.disabled = true;
    loading.style.display = 'block';
    jokeContent.innerHTML = '';

    try {
        let joke = null;

        if (jokeType === 'programming') {
            joke = await fetchProgrammingJoke();
        } else if (jokeType === 'knock-knock') {
            joke = await fetchKnockKnockJoke();
        } else {
            joke = await fetchGeneralJoke(jokeType);
        }

        if (joke) {
            currentJoke = joke;
            displayJoke(joke);
            addToHistory(joke);
            jokeCount++;
            saveStats();
        } else {
            showError('Could not fetch joke. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error fetching joke. Please check your internet connection.');
    } finally {
        btn.disabled = false;
        loading.style.display = 'none';
    }
}

/**
 * Fetch general joke from JokeAPI
 */
async function fetchGeneralJoke(type) {
    try {
        const category = type === 'general' ? 'general' : '';
        const url = category 
            ? `https://jokeapi.dev/joke/${category}?type=single`
            : 'https://jokeapi.dev/joke/any?type=single';

        const response = await fetch(url);
        const data = await response.json();

        if (data.type === 'single') {
            return {
                setup: null,
                delivery: data.joke,
                type: 'single',
                category: data.category
            };
        } else if (data.type === 'twopart') {
            return {
                setup: data.setup,
                delivery: data.delivery,
                type: 'twopart',
                category: data.category
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching general joke:', error);
        return null;
    }
}

/**
 * Fetch programming joke
 */
async function fetchProgrammingJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
        const data = await response.json();

        return {
            setup: data.setup,
            delivery: data.punchline,
            type: 'twopart',
            category: 'Programming'
        };
    } catch (error) {
        console.error('Error fetching programming joke:', error);
        return null;
    }
}

/**
 * Fetch knock-knock joke
 */
async function fetchKnockKnockJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/jokes/knock-knock/random');
        const data = await response.json();

        return {
            setup: data.setup,
            delivery: data.punchline,
            type: 'twopart',
            category: 'Knock Knock'
        };
    } catch (error) {
        console.error('Error fetching knock-knock joke:', error);
        return null;
    }
}

/**
 * Display joke in the UI
 */
function displayJoke(joke) {
    const jokeContent = document.getElementById('jokeContent');

    if (joke.type === 'single') {
        jokeContent.innerHTML = `<p>${joke.delivery}</p>`;
    } else {
        jokeContent.innerHTML = `
            <div class="joke-setup">${joke.setup}</div>
            <div class="joke-punchline">${joke.delivery}</div>
        `;
    }
}

/**
 * Add joke to history
 */
function addToHistory(joke) {
    const jokeText = joke.setup 
        ? `${joke.setup}\n${joke.delivery}` 
        : joke.delivery;

    jokeHistory.unshift(jokeText);

    // Keep only last 10 jokes
    if (jokeHistory.length > 10) {
        jokeHistory.pop();
    }

    updateHistoryDisplay();
    saveHistory();
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
    const recentList = document.getElementById('recentJokesList');

    if (jokeHistory.length === 0) {
        recentList.innerHTML = '<p class="no-jokes">No jokes yet</p>';
        return;
    }

    recentList.innerHTML = jokeHistory
        .map((joke, index) => `
            <div class="recent-item">
                <strong>#${index + 1}</strong>
                <p>${joke}</p>
            </div>
        `)
        .join('');
}

/**
 * Share joke (using Web Share API)
 */
async function shareJoke() {
    if (!currentJoke) {
        alert('No joke to share. Get a joke first!');
        return;
    }

    const jokeText = currentJoke.setup 
        ? `${currentJoke.setup}\n\n${currentJoke.delivery}`
        : currentJoke.delivery;

    if (navigator.share) {
        try {
            await navigator.share({
                title: '😂 Random Joke',
                text: jokeText
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        // Fallback: Copy to clipboard
        copyJoke();
    }
}

/**
 * Copy joke to clipboard
 */
function copyJoke() {
    if (!currentJoke) {
        alert('No joke to copy. Get a joke first!');
        return;
    }

    const jokeText = currentJoke.setup 
        ? `${currentJoke.setup}\n\n${currentJoke.delivery}`
        : currentJoke.delivery;

    navigator.clipboard.writeText(jokeText).then(() => {
        showSuccess('Joke copied to clipboard!');
    }).catch(() => {
        alert('Could not copy joke');
    });
}

/**
 * Show success message
 */
function showSuccess(message) {
    const jokeContent = document.getElementById('jokeContent');
    const msg = document.createElement('div');
    msg.className = 'success-message';
    msg.textContent = message;
    jokeContent.appendChild(msg);

    setTimeout(() => {
        msg.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const jokeContent = document.getElementById('jokeContent');
    const msg = document.createElement('div');
    msg.className = 'error-message';
    msg.textContent = message;
    jokeContent.appendChild(msg);

    setTimeout(() => {
        msg.remove();
    }, 3000);
}

/**
 * Save stats to localStorage
 */
function saveStats() {
    localStorage.setItem('jokeCount', jokeCount);
    document.getElementById('jokeCount').textContent = jokeCount;
}

/**
 * Load stats from localStorage
 */
function loadStats() {
    jokeCount = parseInt(localStorage.getItem('jokeCount') || '0');
    document.getElementById('jokeCount').textContent = jokeCount;
}

/**
 * Save history to localStorage
 */
function saveHistory() {
    localStorage.setItem('jokeHistory', JSON.stringify(jokeHistory));
}

/**
 * Load history from localStorage
 */
function loadHistory() {
    jokeHistory = JSON.parse(localStorage.getItem('jokeHistory') || '[]');
    updateHistoryDisplay();
}

/**
 * Reset statistics
 */
function resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
        jokeCount = 0;
        jokeHistory = [];
        currentJoke = null;
        saveStats();
        saveHistory();
        updateHistoryDisplay();
        document.getElementById('jokeContent').innerHTML = '<p class="placeholder">Click "Get Joke" to load a random joke...</p>';
        showSuccess('Statistics reset successfully!');
    }
}
