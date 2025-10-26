/**
 * Twinkling Stars Animation for Header
 * Creates randomly positioned stars that fade in and out
 */

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    if (!header) return;

    // Configuration
    const numberOfStars = 50;
    const minSize = 2;
    const maxSize = 3;
    const minDuration = 2;
    const maxDuration = 5;

    // Create stars
    for (let i = 0; i < numberOfStars; i++) {
        createStar();
    }

    function createStar() {
        const star = document.createElement('div');
        star.className = 'twinkling-star';

        // Random position within header
        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;

        // Random size
        const size = Math.random() * (maxSize - minSize) + minSize;

        // Random animation duration and delay
        const duration = Math.random() * (maxDuration - minDuration) + minDuration;
        const delay = Math.random() * maxDuration;

        // Apply styles
        star.style.left = `${xPos}%`;
        star.style.top = `${yPos}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        // Add to header
        header.appendChild(star);
    }
});
