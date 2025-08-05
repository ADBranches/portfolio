// Set current year
document.getElementById('currentyear').textContent = new Date().getFullYear();

// Set last modified date
document.getElementById('lastModified').textContent = `Last Modified: ${document.lastModified}`;

// Placeholder for future interactivity (e.g., skill filtering)
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio loaded');
    // Add future features like skill filtering or project modals here
});
