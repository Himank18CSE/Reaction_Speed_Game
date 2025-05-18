class HighScores {
    constructor() {
        this.highScoresList = document.getElementById('highScoresList');
        this.updateHighScoresList();
    }

    updateHighScoresList() {
        const scores = JSON.parse(localStorage.getItem('allScores')) || [];
        
        if (scores.length === 0) {
            this.highScoresList.innerHTML = `
                <div class="no-scores">
                    <p>No high scores yet!</p>
                    <p>Start playing to set some records!</p>
                </div>
            `;
            return;
        }
        
        // Sort scores in descending order
        scores.sort((a, b) => b.score - a.score);
        
        // Display top 10 scores with formatted date
        this.highScoresList.innerHTML = scores.slice(0, 10).map((score, index) => {
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
}

// Initialize the high scores when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HighScores();
}); 