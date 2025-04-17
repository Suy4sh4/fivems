/**
 * TLRP Discord Bot Dashboard - Embed Builder
 * Handles the embed builder functionality
 */

class EmbedBuilder {
    static recentEmbeds = [];
    
    /**
     * Initialize the embed builder
     */
    static initialize() {
        if (!UI.currentServer) {
            alert('Please select a server first');
            UI.navigateTo('server-selection');
            return;
        }
        
        this.populateChannels();
        this.setupEventListeners();
        this.updatePreview();
    }
    
    /**
     * Populate the channels dropdown
     */
    static populateChannels() {
        if (!UI.currentServer) return;
        
        const channelSelect = document.getElementById('embed-channel');
        channelSelect.innerHTML = '<option value="" selected disabled>Select channel</option>';
        
        UI.currentServer.channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = `#${channel.name}`;
            channelSelect.appendChild(option);
        });
    }
    
    /**
     * Set up event listeners for the embed builder
     */
    static setupEventListeners() {
        // Form inputs
        const inputs = [
            'embed-title',
            'embed-description',
            'embed-color',
            'embed-image',
            'embed-thumbnail',
            'embed-footer',
            'embed-author',
            'embed-timestamp'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updatePreview());
            }
        });
        
        // Add field button
        document.getElementById('add-field-btn').addEventListener('click', () => {
            this.addField();
        });
        
        // Reset button
        document.getElementById('embed-reset-btn').addEventListener('click', () => {
            this.resetForm();
        });
        
        // Form submission
        document.getElementById('embed-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendEmbed();
        });
    }
    
    /**
     * Add a field to the embed
     * @param {Object} field - The field to add (optional)
     */
    static addField(field = { name: '', value: '', inline: false }) {
        const container = document.getElementById('embed-fields-container');
        const fieldId = Date.now();
        
        const fieldElement = document.createElement('div');
        fieldElement.className = 'field-container';
        fieldElement.dataset.fieldId = fieldId;
        fieldElement.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    <div class="mb-2">
                        <label class="form-label">Field Name</label>
                        <input type="text" class="form-control field-name" value="${field.name}" placeholder="Field name">
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="mb-2">
                        <label class="form-label">Field Value</label>
                        <input type="text" class="form-control field-value" value="${field.value}" placeholder="Field value">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-2">
                        <label class="form-label">Inline</label>
                        <div class="form-check mt-2">
                            <input type="checkbox" class="form-check-input field-inline" ${field.inline ? 'checked' : ''}>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="remove-field-btn" title="Remove field">
                <i class="bi bi-x-circle"></i>
            </button>
        `;
        
        // Add event listeners
        fieldElement.querySelector('.field-name').addEventListener('input', () => this.updatePreview());
        fieldElement.querySelector('.field-value').addEventListener('input', () => this.updatePreview());
        fieldElement.querySelector('.field-inline').addEventListener('change', () => this.updatePreview());
        fieldElement.querySelector('.remove-field-btn').addEventListener('click', () => {
            container.removeChild(fieldElement);
            this.updatePreview();
        });
        
        container.appendChild(fieldElement);
        this.updatePreview();
        
        // Scroll to the new field
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Update the embed preview
     */
    static updatePreview() {
        const title = document.getElementById('embed-title').value;
        const description = document.getElementById('embed-description').value;
        const color = document.getElementById('embed-color').value;
        const image = document.getElementById('embed-image').value;
        const thumbnail = document.getElementById('embed-thumbnail').value;
        const footer = document.getElementById('embed-footer').value;
        const author = document.getElementById('embed-author').value;
        const timestamp = document.getElementById('embed-timestamp').checked;
        
        // Update preview elements
        document.getElementById('preview-title').textContent = title || 'Embed Title';
        document.getElementById('preview-description').textContent = description || 'This is an example description. Edit the form on the left to update this preview.';
        document.getElementById('embed-preview').style.borderColor = color;
        
        // Image
        const previewImage = document.getElementById('preview-image');
        const imageContainer = document.getElementById('preview-image-container');
        if (image) {
            previewImage.src = image;
            previewImage.style.display = 'block';
            imageContainer.style.display = 'block';
        } else {
            previewImage.style.display = 'none';
            imageContainer.style.display = 'none';
        }
        
        // Thumbnail
        const previewThumbnail = document.getElementById('preview-thumbnail');
        const thumbnailContainer = document.getElementById('preview-thumbnail-container');
        if (thumbnail) {
            previewThumbnail.src = thumbnail;
            previewThumbnail.style.display = 'block';
            thumbnailContainer.style.display = 'block';
        } else {
            previewThumbnail.style.display = 'none';
            thumbnailContainer.style.display = 'none';
        }
        
        // Footer
        const footerContainer = document.getElementById('preview-footer-container');
        const footerElement = document.getElementById('preview-footer');
        const timestampElement = document.getElementById('preview-timestamp');
        
        if (footer || timestamp) {
            footerContainer.style.display = 'flex';
            footerElement.textContent = footer;
            
            if (timestamp) {
                timestampElement.style.display = 'inline';
                timestampElement.textContent = timestamp ? ' • ' + new Date().toLocaleString() : '';
            } else {
                timestampElement.style.display = 'none';
            }
        } else {
            footerContainer.style.display = 'none';
        }
        
        // Fields
        const fieldsContainer = document.getElementById('preview-fields');
        fieldsContainer.innerHTML = '';
        
        const fieldElements = document.querySelectorAll('.field-container');
        fieldElements.forEach(fieldElement => {
            const name = fieldElement.querySelector('.field-name').value;
            const value = fieldElement.querySelector('.field-value').value;
            const inline = fieldElement.querySelector('.field-inline').checked;
            
            if (name && value) {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'discord-embed-field';
                fieldDiv.style.display = inline ? 'inline-block' : 'block';
                fieldDiv.style.width = inline ? 'calc(50% - 8px)' : '100%';
                fieldDiv.style.marginRight = inline ? '8px' : '0';
                
                fieldDiv.innerHTML = `
                    <div class="discord-embed-field-name">${name}</div>
                    <div class="discord-embed-field-value">${value}</div>
                `;
                
                fieldsContainer.appendChild(fieldDiv);
            }
        });
    }
    
    /**
     * Reset the embed form
     */
    static resetForm() {
        document.getElementById('embed-title').value = '';
        document.getElementById('embed-description').value = '';
        document.getElementById('embed-color').value = CONFIG.DEFAULT_EMBED_COLOR;
        document.getElementById('embed-image').value = '';
        document.getElementById('embed-thumbnail').value = '';
        document.getElementById('embed-footer').value = '';
        document.getElementById('embed-author').value = '';
        document.getElementById('embed-timestamp').checked = false;
        document.getElementById('embed-channel').value = '';
        
        // Clear fields
        document.getElementById('embed-fields-container').innerHTML = '';
        
        this.updatePreview();
    }
    
    /**
     * Send the embed to Discord
     */
    static async sendEmbed() {
        if (!UI.currentServer) {
            alert('Please select a server first');
            return;
        }
        
        const channelId = document.getElementById('embed-channel').value;
        if (!channelId) {
            alert('Please select a channel');
            return;
        }
        
        // Collect field data
        const fields = [];
        document.querySelectorAll('.field-container').forEach(fieldElement => {
            const name = fieldElement.querySelector('.field-name').value;
            const value = fieldElement.querySelector('.field-value').value;
            const inline = fieldElement.querySelector('.field-inline').checked;
            
            if (name && value) {
                fields.push({ name, value, inline });
            }
        });
        
        // Build embed data
        const embedData = {
            title: document.getElementById('embed-title').value,
            description: document.getElementById('embed-description').value,
            color: document.getElementById('embed-color').value,
            footer: document.getElementById('embed-footer').value,
            author: document.getElementById('embed-author').value,
            image: document.getElementById('embed-image').value,
            thumbnail: document.getElementById('embed-thumbnail').value,
            timestamp: document.getElementById('embed-timestamp').checked,
            fields
        };
        
        // Show loading spinner
        UI.showLoadingSpinner();
        
        try {
            const response = await auth.apiRequest(`/api/servers/${UI.currentServer.id}/embeds`, {
                method: 'POST',
                body: JSON.stringify({
                    channelId,
                    embed: embedData
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send embed');
            }
            
            const data = await response.json();
            
            // Add to recent embeds
            this.addToRecentEmbeds({
                id: data.messageId,
                title: embedData.title,
                channelId,
                channelName: UI.currentServer.channels.find(c => c.id === channelId)?.name || 'Unknown Channel',
                timestamp: Date.now()
            });
            
            // Reset form
            this.resetForm();
            
            alert('Embed sent successfully!');
        } catch (error) {
            console.error('Error sending embed:', error);
            alert('Failed to send embed. Please try again.');
        } finally {
            // Hide loading spinner
            UI.hideLoadingSpinner();
        }
    }
    
    /**
     * Add an embed to the recent embeds list
     * @param {Object} embed - The embed to add
     */
    static addToRecentEmbeds(embed) {
        // Add to the beginning of the array
        this.recentEmbeds.unshift(embed);
        
        // Limit to 5 recent embeds
        if (this.recentEmbeds.length > 5) {
            this.recentEmbeds.pop();
        }
        
        // Update the UI
        const container = document.getElementById('recent-embeds');
        container.innerHTML = '';
        
        if (this.recentEmbeds.length === 0) {
            container.innerHTML = '<li class="list-group-item bg-transparent text-light">No recent embeds</li>';
            return;
        }
        
        this.recentEmbeds.forEach(embed => {
            const item = document.createElement('li');
            item.className = 'list-group-item bg-transparent text-light';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${embed.title || 'Untitled Embed'}</strong>
                        <div class="text-muted small">#${embed.channelName}</div>
                    </div>
                    <small class="text-muted">${UI.formatTimestamp(embed.timestamp)}</small>
                </div>
            `;
            container.appendChild(item);
        });
    }
}