/**
 * TLRP Discord Bot Dashboard - Main Application
 * Entry point for the dashboard
 */

// Global auth instance
let auth;

/**
 * Create default images for the dashboard
 */
function createDefaultImages() {
    // Create the default logo SVG
    const defaultLogoSvg = `
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" fill="#5865F2"/>
        <text x="100" y="115" font-family="Arial" font-size="70" font-weight="bold" fill="white" text-anchor="middle">TLRP</text>
    </svg>
    `;
    
    // Create the default server icon SVG
    const defaultServerSvg = `
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="15" fill="#5865F2"/>
        <text x="50" y="60" font-family="Arial" font-size="35" font-weight="bold" fill="white" text-anchor="middle">TLRP</text>
    </svg>
    `;
    
    // Save SVGs as data URLs
    localStorage.setItem('tlrp_default_logo', 'data:image/svg+xml;base64,' + btoa(defaultLogoSvg));
    localStorage.setItem('tlrp_default_server', 'data:image/svg+xml;base64,' + btoa(defaultServerSvg));
}

// When the document is loaded, initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Create the auth instance
    auth = new Auth();
    
    // Check if the user is authenticated
    if (auth.checkAuth()) {
        // Test the connection before initializing
        auth.testConnection()
            .then(success => {
                if (success) {
                    UI.initializeApp();
                } else {
                    auth.logout();
                    auth.showAuthModal();
                }
            })
            .catch(() => {
                auth.logout();
                auth.showAuthModal();
            });
    } else {
        // Show the auth modal
        auth.showAuthModal();
    }
    
    // Add some default images
    createDefaultImages();
});