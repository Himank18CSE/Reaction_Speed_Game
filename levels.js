class LevelSelector {
    constructor() {
        this.levelCards = document.querySelectorAll('.level-card');
        this.initializeLevels();
        this.bindEvents();
    }

    initializeLevels() {
        const stats = JSON.parse(localStorage.getItem('levelStats')) || {
            easy: { bestScore: 0, unlocked: true },
            medium: { bestScore: 0, unlocked: false },
            hard: { bestScore: 0, unlocked: false }
        };

        // Save initial stats if they don't exist
        if (!localStorage.getItem('levelStats')) {
            localStorage.setItem('levelStats', JSON.stringify(stats));
        }

        this.updateLevelDisplay(stats);
    }

    updateLevelDisplay(stats) {
        this.levelCards.forEach(card => {
            const level = card.dataset.level;
            const levelStats = stats[level];
            const bestScoreElement = card.querySelector('.best-score .value');
            
            bestScoreElement.textContent = levelStats.bestScore;

            if (levelStats.unlocked) {
                card.classList.add('unlocked');
                card.querySelector('.unlock-status').textContent = 'Unlocked';
                
                // Add click event for unlocked levels
                card.onclick = () => this.startLevel(level);
            }
        });
    }

    bindEvents() {
        this.levelCards.forEach(card => {
            if (!card.classList.contains('unlocked')) {
                card.addEventListener('click', () => {
                    this.showLockedMessage(card.querySelector('.unlock-status').textContent);
                });
            }
        });
    }

    startLevel(level) {
        // Store selected level in localStorage
        localStorage.setItem('currentLevel', level);
        // Redirect to game page
        window.location.href = 'game.html';
    }

    showLockedMessage(requirement) {
        const existingMessage = document.querySelector('.locked-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = 'locked-message';
        message.textContent = `Complete requirement: ${requirement}`;
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = '#ff5555';
        message.style.color = 'white';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '5px';
        message.style.zIndex = '1000';
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }
}

// Initialize the level selector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LevelSelector();
}); 