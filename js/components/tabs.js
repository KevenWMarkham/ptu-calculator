/**
 * Tab Navigation Component
 */

const TabsComponent = {
    /**
     * Initialize tab navigation
     */
    init() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId, tabButtons, tabContents);
            });
        });
    },

    /**
     * Switch to a specific tab
     * @param {string} tabId - Tab identifier
     * @param {NodeList} tabButtons - Tab button elements
     * @param {NodeList} tabContents - Tab content elements
     */
    switchTab(tabId, tabButtons, tabContents) {
        // Update buttons
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // Update content
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        // Trigger custom event for any tab-specific initialization
        document.dispatchEvent(new CustomEvent('tabChanged', { detail: { tabId } }));
    },

    /**
     * Get current active tab
     * @returns {string} Current tab ID
     */
    getCurrentTab() {
        const activeBtn = document.querySelector('.tab-btn.active');
        return activeBtn ? activeBtn.getAttribute('data-tab') : null;
    },

    /**
     * Programmatically switch to a tab
     * @param {string} tabId - Tab to switch to
     */
    goToTab(tabId) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        this.switchTab(tabId, tabButtons, tabContents);
    }
};
