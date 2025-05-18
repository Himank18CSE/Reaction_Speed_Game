class ReactionGame {
    constructor() {
        // Check if we're on the game page or main menu
        const isGamePage = window.location.pathname.includes('game.html');
        
        if (isGamePage) {
            this.initializeGameScreen();
        } else {
            this.initializeMainMenu();
            this.initializeAccountManagement();
        }

        // Initialize sounds
        this.initializeSounds();
        this.loadCurrentLevel();
    }

    initializeMainMenu() {
        // Initialize menu elements
        this.mainMenu = document.getElementById('mainMenu');
        this.highScoresScreen = document.getElementById('highScoresScreen');
        this.accountScreen = document.getElementById('accountScreen');
        this.levelsScreen = document.getElementById('levelsScreen');
        this.gameScreen = document.getElementById('gameScreen');

        // Initialize menu buttons
        this.newGameBtn = document.getElementById('newGameBtn');
        this.highScoresBtn = document.getElementById('highScoresBtn');
        this.accountBtn = document.getElementById('accountBtn');
        this.backButtons = document.querySelectorAll('.back-button');

        // Initialize menu elements
        this.menuBestTime = document.getElementById('menuBestTime');
        this.menuGamesPlayed = document.getElementById('menuGamesPlayed');
        this.menuAvgTime = document.getElementById('menuAvgTime');

        this.bindMenuEvents();
        this.updateMenuStats();
        this.initializeGameScreen(); // Initialize game screen components
    }

    initializeGameScreen() {
        // Initialize game elements
        this.gameScreen = document.getElementById('gameScreen');
        this.gameArea = document.querySelector('.game-area');
        this.target = document.getElementById('target');
        this.ghostTarget = document.getElementById('ghostTarget');
        this.startButton = document.getElementById('startButton');
        this.scoreElement = document.getElementById('currentScore');
        this.highScoreElement = document.getElementById('highScore');
        this.timeElement = document.getElementById('timeLeft');
        this.reactionTimeElement = document.getElementById('reactionTime');
        this.averageTimeElement = document.getElementById('averageTime');
        this.playerNameElement = document.getElementById('playerName');

        // Initialize celebration elements
        this.celebration = document.getElementById('celebration');
        this.celebrationScore = document.getElementById('celebrationScore');
        this.confettiContainer = document.getElementById('confetti');

        // Game state
        this.gameActive = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.timeLeft = 30;
        this.reactionTimes = [];
        this.bestReplayData = JSON.parse(localStorage.getItem('bestReplay')) || [];
        this.currentReplayData = [];
        this.ghostReplayTimeout = null;
        this.gameTimer = null;

        // Array of target emojis
        this.targetEmojis = ['🎯', '🎪', '⭐', '🎨', '🎭', '🎪', '🎡', '🎮'];
        this.currentEmojiIndex = 0;

        // Confetti colors
        this.confettiColors = ['#00ff88', '#00cc6a', '#ffffff', '#ffff00', '#ff00ff', '#00ffff'];

        this.highScoreElement.textContent = this.highScore;
        this.bindGameEvents();
    }

    initializeSounds() {
        // Initialize all sound elements
        this.tapSound = document.getElementById('tapSound');
        this.celebrationSound = document.getElementById('celebrationSound');
        this.gameCompleteSound = document.getElementById('gameCompleteSound');

        // Set default volume for all sounds
        const sounds = [this.tapSound, this.celebrationSound, this.gameCompleteSound];
        sounds.forEach(sound => {
            if (sound) {
                sound.volume = 0.8;
            }
        });

        // Add error handling for sound loading
        sounds.forEach(sound => {
            if (sound) {
                sound.addEventListener('error', (e) => {
                    console.error('Error loading sound:', e);
                });
            }
        });
    }

    bindMenuEvents() {
        this.newGameBtn.addEventListener('click', () => {
            this.showScreen('game');
            this.prepareNewGame();
        });
        this.highScoresBtn.addEventListener('click', () => this.showScreen('highScores'));
        this.accountBtn.addEventListener('click', () => this.showScreen('account'));
        
        this.backButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.showScreen('main');
                if (this.gameActive) {
                    this.endGame();
                }
            });
        });
    }

    bindGameEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.target.addEventListener('click', (e) => this.hitTarget(e));
    }

    showScreen(screenName) {
        // Hide all screens
        this.mainMenu.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.highScoresScreen.classList.remove('active');
        this.accountScreen.classList.remove('active');

        // Show selected screen
        switch(screenName) {
            case 'main':
                this.mainMenu.classList.add('active');
                this.updateMenuStats();
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
            case 'highScores':
                this.highScoresScreen.classList.add('active');
                this.updateHighScoresList();
                break;
            case 'account':
                this.accountScreen.classList.add('active');
                this.updatePlayerStats();
                break;
        }
    }

    updateHighScoresList() {
        const highScoresList = document.getElementById('highScoresList');
        const scores = JSON.parse(localStorage.getItem('allScores')) || [];
        
        // Sort scores in descending order
        scores.sort((a, b) => b.score - a.score);
        
        if (scores.length === 0) {
            highScoresList.innerHTML = `
                <div class="no-scores">
                    <p>No high scores yet!</p>
                    <p>Start playing to set some records!</p>
                </div>
            `;
            return;
        }
        
        // Display top 10 scores with formatted date
        highScoresList.innerHTML = scores.slice(0, 10).map((score, index) => {
            const date = new Date(score.date);
            const formattedDate = date.toLocaleDateString();
            return `
                <div class="high-score-item">
                    <span class="high-score-rank">#${index + 1}</span>
                    <span class="high-score-name">${score.player}</span>
                    <span class="high-score-value">${score.score}</span>
                    <span class="high-score-date">${formattedDate}</span>
                </div>
            `;
        }).join('');
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

        document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
        document.getElementById('personalBest').textContent = stats.bestScore;
        document.getElementById('averageScore').textContent = 
            stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;

        // Update username display
        const username = localStorage.getItem('username') || 'Guest';
        document.getElementById('username').value = username;
        this.playerNameElement.textContent = username;
    }

    updateMenuStats() {
        const stats = JSON.parse(localStorage.getItem('playerStats')) || {
            gamesPlayed: 0,
            bestScore: 0,
            totalScore: 0,
            bestReactionTime: Infinity,
            totalReactionTime: 0,
            totalHits: 0
        };

        this.menuGamesPlayed.textContent = stats.gamesPlayed;
        this.menuBestTime.textContent = stats.bestReactionTime === Infinity ? '-' : `${stats.bestReactionTime}ms`;
        this.menuAvgTime.textContent = stats.totalHits > 0 
            ? `${Math.round(stats.totalReactionTime / stats.totalHits)}ms` 
            : '-';
    }

    loadCurrentLevel() {
        const level = localStorage.getItem('currentLevel') || 'easy';
        this.currentLevel = level;
        this.setLevelParameters(level);
        document.getElementById('currentLevel').textContent = level.charAt(0).toUpperCase() + level.slice(1);
    }

    setLevelParameters(level) {
        const levelConfig = {
            easy: {
                targetSize: 50,
                moveInterval: 1500, // Slower for easy level
                gameTime: 30,
                targetScale: 1,
                minSpeed: 1000,  // Minimum movement interval
                maxSpeed: 2000   // Maximum movement interval
            },
            medium: {
                targetSize: 40,
                moveInterval: 1200, // Balanced for medium
                gameTime: 25,
                targetScale: 0.8,
                minSpeed: 800,   // Faster minimum interval
                maxSpeed: 1500   // Faster maximum interval
            },
            hard: {
                targetSize: 30,
                moveInterval: 800,  // Fast for hard level
                gameTime: 20,
                targetScale: 0.6,
                minSpeed: 500,   // Very fast minimum interval
                maxSpeed: 1000   // Very fast maximum interval
            }
        };

        const config = levelConfig[level];
        this.target.style.width = `${config.targetSize}px`;
        this.target.style.height = `${config.targetSize}px`;
        this.target.style.fontSize = `${2.5 * config.targetScale}rem`;
        this.moveInterval = config.moveInterval;
        this.minSpeed = config.minSpeed;
        this.maxSpeed = config.maxSpeed;
        this.timeLeft = config.gameTime;
        this.timeElement.textContent = config.gameTime;
    }

    startGame() {
        // Reset game state first
        this.gameActive = true;
        this.score = 0;
        this.reactionTimes = [];
        this.currentReplayData = [];
        this.timeLeft = parseInt(this.timeElement.textContent);
        
        // Update display
        this.scoreElement.textContent = '0';
        this.reactionTimeElement.textContent = '0';
        this.averageTimeElement.textContent = '0';

        // Clear any existing timers before starting
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.ghostReplayTimeout) {
            clearTimeout(this.ghostReplayTimeout);
            this.ghostReplayTimeout = null;
        }

        // Hide any existing celebration or game complete messages
        const existingMessages = document.querySelectorAll('.game-complete-message');
        existingMessages.forEach(msg => msg.remove());
        
        this.celebration.classList.remove('show');
        this.confettiContainer.innerHTML = '';

        // Show target and hide start button
        this.startButton.style.display = 'none';
        this.target.style.display = 'block';
        this.ghostTarget.style.display = 'none';

        // Initialize target position
        this.moveTarget();

        // Start game timer
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.timeElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    moveTarget() {
        if (!this.gameActive) return;

        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const targetSize = {
            width: parseInt(getComputedStyle(this.target).width),
            height: parseInt(getComputedStyle(this.target).height)
        };
        
        // Calculate safe boundaries (accounting for target size)
        const safeMargin = 20; // pixels from the edge
        const maxX = gameAreaRect.width - targetSize.width - safeMargin;
        const maxY = gameAreaRect.height - targetSize.height - safeMargin;

        // Generate position within safe area
        const x = Math.floor(Math.random() * (maxX - safeMargin)) + safeMargin;
        const y = Math.floor(Math.random() * (maxY - safeMargin)) + safeMargin;

        // Update target position and appearance
        this.target.style.transition = 'none';
        this.target.style.left = `${x}px`;
        this.target.style.top = `${y}px`;
        
        // Change emoji
        this.target.textContent = this.getRandomEmoji();
        
        // Add pop animation
        this.target.classList.remove('pop');
        void this.target.offsetWidth; // Force reflow
        this.target.classList.add('pop');

        // Store position and time for reaction calculation
        this.lastPosition = { x, y };
        this.lastMoveTime = Date.now();

        // Store data for replay
        this.currentReplayData.push({
            x,
            y,
            emoji: this.target.textContent,
            timestamp: this.lastMoveTime
        });

        // Remove pop animation after it completes
        setTimeout(() => {
            this.target.classList.remove('pop');
        }, 300);

        // Adjust speed based on score
        this.adjustSpeed();
    }

    hitTarget(event) {
        if (!this.gameActive) return;

        // Get click coordinates relative to game area
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const clickX = event.clientX - gameAreaRect.left;
        const clickY = event.clientY - gameAreaRect.top;

        // Get target position and size
        const targetRect = this.target.getBoundingClientRect();
        const targetX = targetRect.left - gameAreaRect.left + targetRect.width / 2;
        const targetY = targetRect.top - gameAreaRect.top + targetRect.height / 2;

        // Calculate distance from click to target center
        const distance = Math.sqrt(
            Math.pow(clickX - targetX, 2) + 
            Math.pow(clickY - targetY, 2)
        );

        // Check if click is within target radius (using the smaller dimension)
        const hitRadius = Math.min(targetRect.width, targetRect.height) / 2;
        
        if (distance <= hitRadius) {
            // Play tap sound
            if (this.tapSound) {
                this.tapSound.currentTime = 0;
                this.tapSound.play().catch(error => {
                    console.error('Error playing tap sound:', error);
                });
            }

            // Calculate reaction time
            const reactionTime = Date.now() - this.lastMoveTime;
            this.reactionTimes.push(reactionTime);
            
            // Update score and stats
            this.score++;
            this.scoreElement.textContent = this.score;
            this.reactionTimeElement.textContent = reactionTime;
            
            // Calculate and update average time
            const avgTime = Math.round(
                this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
            );
            this.averageTimeElement.textContent = avgTime;

            // Move target to new position
            this.moveTarget();
        }
    }

    getRandomEmoji() {
        // Get random emoji but avoid repeating the last one
        let newEmoji;
        do {
            const randomIndex = Math.floor(Math.random() * this.targetEmojis.length);
            newEmoji = this.targetEmojis[randomIndex];
        } while (newEmoji === this.target.textContent && this.targetEmojis.length > 1);
        
        return newEmoji;
    }

    adjustSpeed() {
        // Clear existing move timer
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
        }

        // Calculate new interval based on score
        const baseInterval = this.maxSpeed - this.minSpeed;
        const scoreMultiplier = Math.min(this.score / 20, 1); // Max difficulty at score of 20
        const newInterval = Math.max(
            this.maxSpeed - (baseInterval * scoreMultiplier),
            this.minSpeed
        );
        
        // Set new move timer
        this.moveTimer = setInterval(() => {
            if (this.gameActive) {
                this.moveTarget();
            }
        }, newInterval);
    }

    endGame() {
        // Stop the game and clear all timers
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.moveTimer);
        this.moveTimer = null;
        this.gameTimer = null;

        // Hide target and show start button
        this.target.style.display = 'none';
        this.startButton.style.display = 'block';
        
        // Play game complete celebration sequence
        this.playCelebrationSequence();
        
        // Update level stats
        const levelStats = JSON.parse(localStorage.getItem('levelStats')) || {};
        const currentLevelStats = levelStats[this.currentLevel] || { bestScore: 0, unlocked: false };
        
        // Check if it's a new best score for the current level
        const isNewBestScore = this.score > currentLevelStats.bestScore;
        
        // Update best score for current level
        if (isNewBestScore) {
            currentLevelStats.bestScore = this.score;
            levelStats[this.currentLevel] = currentLevelStats;
            
            // Check for level unlocks
            if (this.currentLevel === 'easy' && this.score >= 50) {
                levelStats.medium = { ...levelStats.medium, unlocked: true };
            } else if (this.currentLevel === 'medium' && this.score >= 100) {
                levelStats.hard = { ...levelStats.hard, unlocked: true };
            }
            
            localStorage.setItem('levelStats', JSON.stringify(levelStats));
        }

        // Update player stats
        const stats = JSON.parse(localStorage.getItem('playerStats')) || {
            gamesPlayed: 0,
            bestScore: 0,
            totalScore: 0,
            bestReactionTime: Infinity,
            totalReactionTime: 0,
            totalHits: 0
        };
        
        stats.gamesPlayed++;
        stats.totalScore += this.score;
        if (this.score > stats.bestScore) {
            stats.bestScore = this.score;
        }
        
        // Update reaction time stats
        const avgReactionTime = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
        stats.totalReactionTime += avgReactionTime * this.reactionTimes.length;
        stats.totalHits += this.reactionTimes.length;
        stats.bestReactionTime = Math.min(stats.bestReactionTime, ...this.reactionTimes);
        
        localStorage.setItem('playerStats', JSON.stringify(stats));

        // Save score to high scores list
        const allScores = JSON.parse(localStorage.getItem('allScores')) || [];
        allScores.push({
            player: this.playerNameElement.textContent,
            score: this.score,
            level: this.currentLevel,
            date: new Date().toISOString()
        });
        localStorage.setItem('allScores', JSON.stringify(allScores));

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('highScore', this.highScore);
            
            this.bestReplayData = [...this.currentReplayData];
            localStorage.setItem('bestReplay', JSON.stringify(this.bestReplayData));

            this.showCelebration();
        }

        // Add a delay before showing ghost replay
        setTimeout(() => {
            if (!this.gameActive) { // Only play replay if no new game has started
                this.playGhostReplay();
            }
        }, this.score > this.highScore ? 4000 : 0);
    }

    showCelebration() {
        this.celebration.classList.add('show');
        this.celebrationScore.textContent = this.score;
        this.createConfetti();
        
        // Play celebration sound for new high score
        this.playCelebrationSound();

        setTimeout(() => {
            this.celebration.classList.remove('show');
            this.confettiContainer.innerHTML = '';
        }, 4000);
    }

    createConfetti() {
        const colors = ['#00ff88', '#00cc6a', '#ffffff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();
            this.confettiContainer.appendChild(confetti);

            confetti.addEventListener('animationend', () => confetti.remove());
        }
    }

    playGhostReplay() {
        if (this.bestReplayData.length === 0) return;

        this.ghostTarget.style.display = 'block';
        let replayIndex = 0;

        const replay = () => {
            if (replayIndex >= this.bestReplayData.length) {
                this.ghostTarget.style.display = 'none';
                return;
            }

            const position = this.bestReplayData[replayIndex];
            this.ghostTarget.style.left = `${position.x}px`;
            this.ghostTarget.style.top = `${position.y}px`;
            this.ghostTarget.textContent = position.emoji || '👻';
            this.ghostTarget.classList.add('pop');

            setTimeout(() => {
                this.ghostTarget.classList.remove('pop');
            }, 300);

            replayIndex++;

            const nextDelay = replayIndex < this.bestReplayData.length 
                ? this.bestReplayData[replayIndex].timestamp - position.timestamp
                : 1000;

            this.ghostReplayTimeout = setTimeout(replay, nextDelay);
        };

        replay();
    }

    prepareNewGame() {
        // Clear any existing timers
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.ghostReplayTimeout) {
            clearTimeout(this.ghostReplayTimeout);
            this.ghostReplayTimeout = null;
        }

        // Reset game state
        this.gameActive = false;
        this.score = 0;
        this.timeLeft = 30;
        this.reactionTimes = [];
        this.currentReplayData = [];
        
        // Update display
        this.scoreElement.textContent = '0';
        this.timeElement.textContent = '30';
        this.reactionTimeElement.textContent = '0';
        this.averageTimeElement.textContent = '0';
        
        // Remove any existing celebration or game complete messages
        const existingMessages = document.querySelectorAll('.game-complete-message');
        existingMessages.forEach(msg => msg.remove());
        
        this.celebration.classList.remove('show');
        this.confettiContainer.innerHTML = '';
        
        // Show/hide appropriate elements
        this.startButton.style.display = 'block';
        this.target.style.display = 'none';
        this.ghostTarget.style.display = 'none';
    }

    initializeAccountManagement() {
        const saveUsernameBtn = document.getElementById('saveUsername');
        const usernameInput = document.getElementById('username');

        saveUsernameBtn.addEventListener('click', () => {
            const newUsername = usernameInput.value.trim();
            if (newUsername) {
                localStorage.setItem('username', newUsername);
                this.playerNameElement.textContent = newUsername;
                
                // Show success message
                const message = document.createElement('div');
                message.className = 'success-message';
                message.textContent = 'Username saved successfully!';
                message.style.color = '#00ff88';
                message.style.marginTop = '10px';
                
                const existingMessage = document.querySelector('.success-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                saveUsernameBtn.parentNode.appendChild(message);
                setTimeout(() => message.remove(), 3000);
            }
        });
    }

    playCelebrationSound() {
        if (this.celebrationSound) {
            this.celebrationSound.currentTime = 0;
            this.celebrationSound.play().catch(error => {
                console.error('Celebration sound playback failed:', error);
            });
        }
    }

    playGameCompleteSound() {
        if (this.gameCompleteSound) {
            this.gameCompleteSound.currentTime = 0;
            this.gameCompleteSound.play().catch(error => {
                console.error('Game complete sound playback failed:', error);
            });
        }
    }

    playCelebrationSequence() {
        // Play game complete sound
        this.playGameCompleteSound();

        // Create celebration message
        const message = document.createElement('div');
        message.className = 'game-complete-message';
        message.innerHTML = `
            <div class="message-content">
                <h2>Game Complete! 🎮</h2>
                <p class="final-score">Score: ${this.score}</p>
                <p class="avg-reaction">Average Reaction: ${Math.round(
                    this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
                )}ms</p>
                <div class="emoji-celebration">
                    🎉 🏆 ⭐ 🌟 🎯 🎮
                </div>
            </div>
        `;

        // Style the message
        Object.assign(message.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            zIndex: '1000',
            animation: 'fadeInScale 0.5s ease-out'
        });

        document.body.appendChild(message);

        // Create and add confetti
        this.createConfetti();

        // Remove the message after 4 seconds
        setTimeout(() => {
            message.style.animation = 'fadeOutScale 0.5s ease-in';
            setTimeout(() => message.remove(), 500);
        }, 4000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
@keyframes fall {
    0% {
        transform: translateY(0) rotate(0deg);
    }
    100% {
        transform: translateY(100vh) rotate(360deg);
    }
}`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ReactionGame();
}); 