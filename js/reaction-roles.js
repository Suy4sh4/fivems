/**
 * TLRP Discord Bot Dashboard - Reaction Roles
 * Handles the reaction roles functionality
 */

class ReactionRoles {
    static existingMenus = [];
    
    /**
     * Initialize the reaction roles page
     */
    static initialize() {
        if (!UI.currentServer) {
            alert('Please select a server first');
            UI.navigateTo('server-selection');
            return;
        }
        
        this.populateChannels();
        this.setupEventListeners();
        this.loadExistingMenus();
        this.updatePreview();
    }
    
    /**
     * Populate the channels dropdown
     */
    static populateChannels() {
        if (!UI.currentServer) return;
        
        const channelSelect = document.getElementById('reaction-role-channel');
        channelSelect.innerHTML = '<option value="" selected disabled>Select channel</option>';
        
        UI.currentServer.channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = `#${channel.name}`;
            channelSelect.appendChild(option);
        });
    }
    
    /**
     * Set up event listeners for the reaction roles page
     */
    static setupEventListeners() {
        // Form inputs
        const inputs = [
            'reaction-role-title',
            'reaction-role-description',
            'reaction-role-color',
            'reaction-role-style'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updatePreview());
            }
        });
        
        // Add role button
        document.getElementById('add-role-btn').addEventListener('click', () => {
            this.addRoleField();
        });
        
        // Reset button
        document.getElementById('reaction-role-reset-btn').addEventListener('click', () => {
            this.resetForm();
        });
        
        // Form submission
        document.getElementById('reaction-role-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createRoleMenu();
        });
    }
    
    /**
     * Load existing role menus from the server
     */
    static async loadExistingMenus() {
        if (!UI.currentServer) return;
        
        try {
            UI.showLoadingSpinner();
            
            const response = await auth.apiRequest(`/api/servers/${UI.currentServer.id}/reaction-roles`);
            if (!response.ok) {
                throw new Error('Failed to load reaction role menus');
            }
            
            const data = await response.json();
            this.existingMenus = data.menus || [];
            
            // Update the UI
            this.updateExistingMenusList();
        } catch (error) {
            console.error('Error loading reaction role menus:', error);
            alert('Failed to load existing reaction role menus. Please try again.');
        } finally {
            UI.hideLoadingSpinner();
        }
    }
    
    /**
     * Update the list of existing role menus
     */
    static updateExistingMenusList() {
        const container = document.getElementById('existing-role-menus');
        container.innerHTML = '';
        
        if (this.existingMenus.length === 0) {
            container.innerHTML = '<li class="list-group-item bg-transparent text-light">No role menus found</li>';
            return;
        }
        
        this.existingMenus.forEach(menu => {
            const item = document.createElement('li');
            item.className = 'list-group-item bg-transparent text-light';
            
            // Count roles by color
            const rolesByColor = {};
            menu.roles.forEach(role => {
                if (!rolesByColor[role.color]) {
                    rolesByColor[role.color] = 0;
                }
                rolesByColor[role.color]++;
            });
            
            // Create role dots
            const roleDots = Object.entries(rolesByColor).map(([color, count]) => {
                return `<span class="role-dot" style="background-color: ${color}" title="${count} roles"></span>`;
            }).join('');
            
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${menu.title}</strong>
                        <div class="text-muted small">#${menu.channelName}</div>
                        <div class="mt-1">${roleDots} <small>${menu.roles.length} role${menu.roles.length !== 1 ? 's' : ''}</small></div>
                    </div>
                    <div>
                        <a href="https://discord.com/channels/${UI.currentServer.id}/${menu.channelId}/${menu.messageId}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-box-arrow-up-right"></i>
                        </a>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    /**
     * Add a role field to the form
     * @param {Object} role - Optional role data to pre-fill
     */
    static addRoleField(role = null) {
        const container = document.getElementById('reaction-roles-container');
        const roleId = Date.now();
        
        const fieldElement = document.createElement('div');
        fieldElement.className = 'role-container';
        fieldElement.dataset.roleId = roleId;
        
        // Set default values if role is provided
        const roleData = role || { id: '', name: '', emoji: '🎮', description: '' };
        
        fieldElement.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    <div class="mb-2">
                        <label class="form-label">Role</label>
                        <div class="input-group">
                            <input type="text" class="form-control role-name" value="${roleData.name}" placeholder="Select role" readonly>
                            <input type="hidden" class="role-id" value="${roleData.id}">
                            <button class="btn btn-outline-secondary select-role-btn" type="button">Select</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="mb-2">
                        <label class="form-label">Emoji</label>
                        <div class="input-group">
                            <button class="btn emoji-button" type="button">
                                <span class="current-emoji">${roleData.emoji}</span>
                            </button>
                            <select class="form-select emoji-select">
                                ${CONFIG.COMMON_EMOJIS.map(emoji => `<option value="${emoji}" ${emoji === roleData.emoji ? 'selected' : ''}>${emoji}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-2">
                        <label class="form-label">Description</label>
                        <input type="text" class="form-control role-description" value="${roleData.description}" placeholder="Optional description">
                    </div>
                </div>
            </div>
            <button type="button" class="remove-role-btn" title="Remove role">
                <i class="bi bi-x-circle"></i>
            </button>
        `;
        
        // Add event listeners
        fieldElement.querySelector('.select-role-btn').addEventListener('click', () => {
            UI.showRoleSelectionModal(selectedRole => {
                fieldElement.querySelector('.role-name').value = selectedRole.name;
                fieldElement.querySelector('.role-id').value = selectedRole.id;
                this.updatePreview();
            });
        });
        
        fieldElement.querySelector('.emoji-select').addEventListener('change', (e) => {
            fieldElement.querySelector('.current-emoji').textContent = e.target.value;
            this.updatePreview();
        });
        
        fieldElement.querySelector('.role-description').addEventListener('input', () => {
            this.updatePreview();
        });
        
        fieldElement.querySelector('.remove-role-btn').addEventListener('click', () => {
            container.removeChild(fieldElement);
            this.updatePreview();
        });
        
        container.appendChild(fieldElement);
        this.updatePreview();
        
        // Scroll to the new field
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Update the role menu preview
     */
    static updatePreview() {
        const title = document.getElementById('reaction-role-title').value;
        const description = document.getElementById('reaction-role-description').value;
        const color = document.getElementById('reaction-role-color').value;
        const style = document.getElementById('reaction-role-style').value;
        
        // Update preview elements
        document.getElementById('role-preview-title').textContent = title || 'Role Menu Title';
        document.getElementById('role-preview-description').textContent = description || 'Select a role below';
        document.getElementById('role-menu-preview').style.borderColor = color;
        
        // Update buttons preview
        const buttonsContainer = document.getElementById('role-buttons-preview');
        buttonsContainer.innerHTML = '';
        
        // Get roles from form
        const roles = [];
        document.querySelectorAll('.role-container').forEach(container => {
            const name = container.querySelector('.role-name').value;
            const id = container.querySelector('.role-id').value;
            const emoji = container.querySelector('.current-emoji').textContent;
            
            if (name && id) {
                roles.push({ name, id, emoji });
            }
        });
        
        // If using buttons style, show buttons
        if (style === 'buttons' && roles.length > 0) {
            roles.forEach(role => {
                const button = document.createElement('button');
                button.className = 'discord-button primary';
                button.innerHTML = `
                    ${role.emoji} ${role.name}
                `;
                buttonsContainer.appendChild(button);
            });
        } else if (roles.length > 0) {
            // If using reactions style, show description
            const reactionsText = document.createElement('div');
            reactionsText.className = 'mt-2 text-muted';
            reactionsText.innerHTML = 'React with: ' + roles.map(role => role.emoji).join(' ');
            buttonsContainer.appendChild(reactionsText);
        }
    }
    
    /**
     * Reset the reaction role form
     */
    static resetForm() {
        document.getElementById('reaction-role-title').value = '';
        document.getElementById('reaction-role-description').value = '';
        document.getElementById('reaction-role-color').value = CONFIG.DEFAULT_EMBED_COLOR;
        document.getElementById('reaction-role-style').value = 'buttons';
        document.getElementById('reaction-role-channel').value = '';
        
        // Clear roles
        document.getElementById('reaction-roles-container').innerHTML = '';
        
        this.updatePreview();
    }
    
    /**
     * Create a new reaction role menu
     */
    static async createRoleMenu() {
        if (!UI.currentServer) {
            alert('Please select a server first');
            return;
        }
        
        const channelId = document.getElementById('reaction-role-channel').value;
        if (!channelId) {
            alert('Please select a channel');
            return;
        }
        
        // Collect role data
        const roles = [];
        document.querySelectorAll('.role-container').forEach(container => {
            const name = container.querySelector('.role-name').value;
            const id = container.querySelector('.role-id').value;
            const emoji = container.querySelector('.current-emoji').textContent;
            const description = container.querySelector('.role-description').value;
            
            if (name && id) {
                roles.push({ id, name, emoji, description });
            }
        });
        
        if (roles.length === 0) {
            alert('Please add at least one role to the menu');
            return;
        }
        
        // Build menu data
        const menuData = {
            title: document.getElementById('reaction-role-title').value,
            description: document.getElementById('reaction-role-description').value,
            color: document.getElementById('reaction-role-color').value,
            style: document.getElementById('reaction-role-style').value,
            roles
        };
        
        // Show loading spinner
        UI.showLoadingSpinner();
        
        try {
            const response = await auth.apiRequest(`/api/servers/${UI.currentServer.id}/reaction-roles`, {
                method: 'POST',
                body: JSON.stringify({
                    channelId,
                    ...menuData
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create reaction role menu');
            }
            
            await response.json();
            
            // Reset form
            this.resetForm();
            
            // Reload existing menus
            await this.loadExistingMenus();
            
            alert('Reaction role menu created successfully!');
        } catch (error) {
            console.error('Error creating reaction role menu:', error);
            alert('Failed to create reaction role menu. Please try again.');
        } finally {
            // Hide loading spinner
            UI.hideLoadingSpinner();
        }
    }
}