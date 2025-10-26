/**
 * Welcome Banner - JavaScript
 * Handles the dismissible welcome banner functionality
 */

(function() {
    'use strict';

    // Constants
    const STORAGE_KEY = 'tldr-kitchen-banner-dismissed';
    const BANNER_ID = 'welcome-banner';
    const CLOSE_BTN_ID = 'close-banner';

    /**
     * Check if banner was previously dismissed
     */
    function isBannerDismissed() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }

    /**
     * Mark banner as dismissed in localStorage
     */
    function setBannerDismissed() {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    /**
     * Hide the banner with animation
     */
    function hideBanner(banner) {
        // Add hidden class for CSS transition
        banner.classList.add('hidden');

        // After animation completes, remove from DOM
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300); // Match the CSS transition duration
    }

    /**
     * Initialize the welcome banner
     */
    function initWelcomeBanner() {
        const banner = document.getElementById(BANNER_ID);
        const closeBtn = document.getElementById(CLOSE_BTN_ID);

        if (!banner) {
            console.warn('Welcome banner element not found');
            return;
        }

        // Check if banner was previously dismissed
        if (isBannerDismissed()) {
            banner.style.display = 'none';
            return;
        }

        // If no close button, just show the banner
        if (!closeBtn) {
            console.warn('Close button not found');
            return;
        }

        // Add click handler to close button
        closeBtn.addEventListener('click', function() {
            hideBanner(banner);
            setBannerDismissed();
        });

        // Add keyboard support (Enter or Space to close)
        closeBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hideBanner(banner);
                setBannerDismissed();
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWelcomeBanner);
    } else {
        // DOM is already ready
        initWelcomeBanner();
    }

})();
