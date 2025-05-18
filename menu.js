class MainMenu {
    constructor() {
        this.menuGamesPlayed = document.getElementById('menuGamesPlayed');
        this.menuBestTime = document.getElementById('menuBestTime');
        this.menuAvgTime = document.getElementById('menuAvgTime');
        
        this.updateMenuStats();
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
}

// Initialize the menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MainMenu();
}); 