/**
 * TLRP Discord Bot Dashboard - UI Management
 * Handles UI interactions and page navigation
 */

class UI {
    static currentPage = 'dashboard';
    static currentServer = null;
    static servers = [];
    static roleSelectionCallback = null;
    
    /**
     * Initialize the UI
     */
    static initializeApp() {
        this.setupEventListeners();
        this.loadServers();
        
        // Set the default page
        this.navigateTo('server-selection');
    }
    
    /**
     * Set up event listeners for the UI
     */
    static setupEventListeners() {
        // Navigation links
        document.getElementById('dashboard-nav').addEventListener('click', () => {
            this.navigateTo(this.currentServer ? 'welcome' : 'server-selection');
        });
        
        document.getElementById('embed-builder-nav').addEventListener('click', () => {
            this.navigateTo('embed-builder');
        });
        
        document.getElementById('reaction-roles-nav').addEventListener('click', () => {
            this.navigateTo('reaction-roles');
        });
        
        // Welcome page buttons
        document.getElementById('welcome-embed-btn').addEventListener('click', () => {
            this.navigateTo('embed-builder');
        });
        
        document.getElementById('welcome-roles-btn').addEventListener('click', () => {
            this.navigateTo('reaction-roles');
        });
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshCurrentPage();
        });
        
        // Help button
        document.getElementById('help-btn').addEventListener('click', () => {
            alert('Help documentation is coming soon!');
        });
        
        // Role selection modal
        document.getElementById('role-search').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#role-selection-list .list-group-item');
            
            items.forEach(item => {
                const roleName = item.textContent.toLowerCase();
                if (roleName.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    /**
     * Navigate to a page
     * @param {string} page - The page to navigate to
     */
    static navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.content-page').forEach(el => {
            el.classList.add('d-none');
        });
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show the selected page
        switch (page) {
            case 'server-selection':
                document.getElementById('server-selection-page').classList.remove('d-none');
                document.getElementById('dashboard-nav').classList.add('active');
                document.getElementById('page-title').textContent = 'Server Selection';
                break;
            case 'welcome':
                document.getElementById('welcome-page').classList.remove('d-none');
                document.getElementById('dashboard-nav').classList.add('active');
                document.getElementById('page-title').textContent = 'Dashboard';
                break;
            case 'embed-builder':
                document.getElementById('embed-builder-page').classList.remove('d-none');
                document.getElementById('embed-builder-nav').classList.add('active');
                document.getElementById('page-title').textContent = 'Embed Builder';
                EmbedBuilder.initialize();
                break;
            case 'reaction-roles':
                document.getElementById('reaction-roles-page').classList.remove('d-none');
                document.getElementById('reaction-roles-nav').classList.add('active');
                document.getElementById('page-title').textContent = 'Reaction Roles';
                ReactionRoles.initialize();
                break;
        }
        
        this.currentPage = page;
    }
    
    /**
     * Refresh the current page
     */
    static refreshCurrentPage() {
        switch (this.currentPage) {
            case 'server-selection':
                this.loadServers();
                break;
            case 'embed-builder':
                EmbedBuilder.initialize();
                break;
            case 'reaction-roles':
                ReactionRoles.initialize();
                break;
        }
    }
    
    /**
     * Load the servers the bot is in
     */
    static async loadServers() {
        // Show loading spinner
        document.getElementById('servers-loading').style.display = 'inline-block';
        
        try {
            const response = await auth.apiRequest('/api/servers');
            if (!response.ok) {
                throw new Error('Failed to load servers');
            }
            
            const data = await response.json();
            this.servers = data.servers;
            
            // Clear server list
            const serverList = document.getElementById('server-list');
            serverList.innerHTML = '';
            
            // Clear server cards
            const serverCards = document.getElementById('server-cards');
            serverCards.innerHTML = '';
            
            // Add servers to list and cards
            this.servers.forEach(server => {
                // Add to sidebar
                const listItem = document.createElement('li');
                listItem.className = 'nav-item';
                listItem.innerHTML = `
                    <a class="nav-link" href="#" data-server-id="${server.id}">
                        <img src="${server.icon || 'img/default-server.png'}" alt="${server.name}" class="server-icon" onerror="this.src='img/default-server.png'">
                        ${server.name}
                    </a>
                `;
                listItem.querySelector('a').addEventListener('click', () => {
                    this.selectServer(server.id);
                });
                serverList.appendChild(listItem);
                
                // Add card
                const card = document.createElement('div');
                card.className = 'col';
                card.innerHTML = `
                    <div class="server-card" data-server-id="${server.id}">
                        <div class="server-banner"></div>
                        <img src="${server.icon || 'img/default-server.png'}" alt="${server.name}" class="server-icon-large" onerror="this.src='img/default-server.png'">
                        <div class="server-info">
                            <h5>${server.name}</h5>
                            <p><i class="bi bi-people-fill"></i> ${server.memberCount} members</p>
                            <button class="btn btn-primary btn-sm">Manage Server</button>
                        </div>
                    </div>
                `;
                card.querySelector('.server-card').addEventListener('click', () => {
                    this.selectServer(server.id);
                });
                serverCards.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading servers:', error);
            alert('Failed to load servers. Please check your connection and try again.');
        } finally {
            // Hide loading spinner
            document.getElementById('servers-loading').style.display = 'none';
        }
    }
    
    /**
     * Select a server
     * @param {string} serverId - The ID of the server to select
     */
    static async selectServer(serverId) {
        try {
            // Show loading spinner
            UI.showLoadingSpinner();
            
            const response = await auth.apiRequest(`/api/servers/${serverId}`);
            if (!response.ok) {
                throw new Error('Failed to load server details');
            }
            
            const server = await response.json();
            this.currentServer = server;
            
            // Update server in sidebar
            document.querySelectorAll('#server-list .nav-link').forEach(el => {
                if (el.dataset.serverId === serverId) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            
            // Navigate to welcome page
            this.navigateTo('welcome');
            
            // Update page title with server name
            document.getElementById('page-title').textContent = server.name;
        } catch (error) {
            console.error('Error selecting server:', error);
            alert('Failed to load server details. Please try again.');
        } finally {
            // Hide loading spinner
            UI.hideLoadingSpinner();
        }
    }
    
    /**
     * Show the loading spinner
     */
    static showLoadingSpinner() {
        document.getElementById('loading-spinner').style.display = 'flex';
    }
    
    /**
     * Hide the loading spinner
     */
    static hideLoadingSpinner() {
        document.getElementById('loading-spinner').style.display = 'none';
    }
    
    /**
     * Show the role selection modal
     * @param {Function} callback - The callback to call when a role is selected
     */
    static showRoleSelectionModal(callback) {
        if (!this.currentServer) {
            alert('Please select a server first');
            return;
        }
        
        // Set the callback
        this.roleSelectionCallback = callback;
        
        // Clear the role list
        const roleList = document.getElementById('role-selection-list');
        roleList.innerHTML = '';
        
        // Add roles to the list
        this.currentServer.roles.forEach(role => {
            const item = document.createElement('button');
            item.className = 'list-group-item bg-dark text-light';
            item.innerHTML = `
                <span class="role-dot" style="background-color: ${role.color}"></span>
                ${role.name}
            `;
            item.addEventListener('click', () => {
                if (this.roleSelectionCallback) {
                    this.roleSelectionCallback(role);
                }
                
                // Hide the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('role-selection-modal'));
                modal.hide();
                
                // Clear the search field
                document.getElementById('role-search').value = '';
            });
            roleList.appendChild(item);
        });
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('role-selection-modal'));
        modal.show();
    }
    
    /**
     * Format a timestamp
     * @param {number} timestamp - The timestamp to format
     * @returns {string} - The formatted timestamp
     */
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}