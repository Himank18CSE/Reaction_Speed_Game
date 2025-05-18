class Account {
    constructor() {
        this.usernameInput = document.getElementById('username');
        this.saveUsernameBtn = document.getElementById('saveUsername');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.personalBest = document.getElementById('personalBest');
        this.averageScore = document.getElementById('averageScore');
        this.levelProgress = document.getElementById('levelProgress');

        this.bindEvents();
        this.updatePlayerStats();
        this.loadUsername();
    }

    bindEvents() {
        this.saveUsernameBtn.addEventListener('click', () => {
            const newUsername = this.usernameInput.value.trim();
            if (newUsername) {
                localStorage.setItem('username', newUsername);
                this.showSuccessMessage('Username saved successfully!');
            }
        });
    }

    loadUsername() {
        const username = localStorage.getItem('username') || 'Guest';
        this.usernameInput.value = username;
    }

    updatePlayerStats() {
        const stats = JSON.parse(localStorage.getItem('playerStats')) || {
            gamesPlayed: 0,
            bestScore: 0,
            totalScore: 0,
            bestReactionTime: Infinity,
            totalReactionTime: 0,
            totalHits: 0
        };

        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.personalBest.textContent = stats.bestScore;
        this.averageScore.textContent = 
            stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;
    }

    showSuccessMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.textContent = message;
        messageElement.style.color = '#00ff88';
        messageElement.style.marginTop = '10px';
        
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        this.saveUsernameBtn.parentNode.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 3000);
    }
}

// Initialize the account page when it loads
document.addEventListener('DOMContentLoaded', () => {
    new Account();
}); 