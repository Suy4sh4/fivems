/**
 * TLRP Discord Bot Dashboard - Authentication
 * Handles API key authentication and connection to the bot
 */

class Auth {
    constructor() {
        this.token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY) || CONFIG.CURRENT_API_KEY || null;
        this.isAuthenticated = !!this.token;
        this.authModal = new bootstrap.Modal(document.getElementById('auth-modal'), {
            backdrop: 'static',
            keyboard: false
        });
        
        this.connectionIndicator = document.getElementById('connection-indicator');
        this.connectionText = document.getElementById('connection-text');
        
        this.setupEventListeners();
        
        // Debug connection issues
        console.log('Auth initialized with token:', this.token ? 'exists' : 'none');
        console.log('API URL:', CONFIG.API_URL);
    }
    
    /**
     * Set up event listeners for authentication
     */
    setupEventListeners() {
        // Auth form submission
        document.getElementById('auth-submit-btn').addEventListener('click', () => {
            const apiKey = document.getElementById('api-key-input').value.trim();
            if (!apiKey) {
                alert('Please enter the API key');
                return;
            }
            
            this.authenticate(apiKey);
        });
        
        // API key input Enter key
        document.getElementById('api-key-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('auth-submit-btn').click();
            }
        });
    }
    
    /**
     * Authenticate with the API
     * @param {string} apiKey - The API key to authenticate with
     */
    authenticate(apiKey) {
        this.setConnectionStatus('connecting');
        
        // Save the token
        this.token = apiKey;
        localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, apiKey);
        this.isAuthenticated = true;
        
        // Test the connection
        this.testConnection()
            .then(success => {
                if (success) {
                    this.authModal.hide();
                    UI.initializeApp();
                    console.log('Authentication successful');
                } else {
                    this.logout();
                    alert('Authentication failed. Please check your API key and try again.');
                    console.error('Authentication failed in success handler');
                }
            })
            .catch(error => {
                console.error('Authentication error:', error);
                this.logout();
                alert('Authentication failed. Please check your API key and try again.');
            });
    }
    
    /**
     * Test the connection to the API
     * @returns {Promise<boolean>} - Whether the connection was successful
     */
    async testConnection() {
        try {
            console.log('Testing connection to:', `${CONFIG.API_URL}/api/status`);
            const response = await fetch(`${CONFIG.API_URL}/api/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            });
            
            console.log('Connection test response:', response.status);
            
            if (!response.ok) {
                console.error('API status not OK:', response.status);
                this.setConnectionStatus('offline');
                return false;
            }
            
            const data = await response.json();
            console.log('API status data:', data);
            
            if (data.status === 'online' && data.botConnected) {
                this.setConnectionStatus('online');
                return true;
            } else {
                this.setConnectionStatus('offline');
                return false;
            }
        } catch (error) {
            console.error('Connection test error:', error);
            this.setConnectionStatus('offline');
            return false;
        }
    }
    
    /**
     * Set the connection status indicator
     * @param {string} status - The connection status (online, offline, connecting)
     */
    setConnectionStatus(status) {
        this.connectionIndicator.className = 'connection-indicator ' + status;
        
        switch (status) {
            case 'online':
                this.connectionText = 'Connected to bot';
                break;
            case 'offline':
                this.connectionText = 'Disconnected';
                break;
            case 'connecting':
                this.connectionText = 'Connecting...';
                break;
        }
        
        document.getElementById('connection-text').textContent = this.connectionText;
    }
    
    /**
     * Log out and clear authentication
     */
    logout() {
        this.token = null;
        localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
        this.isAuthenticated = false;
        this.setConnectionStatus('offline');
    }
    
    /**
     * Check if the user is authenticated
     * @returns {boolean} - Whether the user is authenticated
     */
    checkAuth() {
        return this.isAuthenticated;
    }
    
    /**
     * Show the authentication modal
     */
    showAuthModal() {
        this.authModal.show();
    }
    
    /**
     * Make an authenticated API request
     * @param {string} endpoint - The API endpoint to request
     * @param {Object} options - The fetch options
     * @returns {Promise<Response>} - The fetch response
     */
    async apiRequest(endpoint, options = {}) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }
        
        const requestOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        };
        
        try {
            console.log('API request to:', `${CONFIG.API_URL}${endpoint}`);
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, requestOptions);
            
            if (response.status === 401) {
                // Token is invalid, log out
                console.error('Authentication failed in API request');
                this.logout();
                this.showAuthModal();
                throw new Error('Authentication failed');
            }
            
            return response;
        } catch (error) {
            console.error('API request error:', error);
            this.setConnectionStatus('offline');
            throw error;
        }
    }
}