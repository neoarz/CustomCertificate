// Handle checkbox selection visual feedback
document.querySelectorAll('.services-table input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Remove background color change when checkbox is checked
        // Just leave the checkbox's own styling to show selection
    });
});

// Improve mobile responsiveness by adding touchstart handlers
document.querySelectorAll('.services-table input[type="checkbox"], .services-table label, input[type="radio"], .tab-item').forEach(element => {
    // Add touchstart handler for faster mobile response
    element.addEventListener('touchstart', function(e) {
        // Prevent double-firing of events on mobile
        e.preventDefault();
        
        if (element.tagName === 'INPUT') {
            // Toggle checkbox state directly for immediate feedback
            if (element.type === 'checkbox') {
                // Don't toggle if it's disabled
                if (!element.disabled) {
                    element.checked = !element.checked;
                    // Trigger change event to ensure any listeners are notified
                    element.dispatchEvent(new Event('change'));
                }
            } else if (element.type === 'radio') {
                element.checked = true;
                element.dispatchEvent(new Event('change'));
            }
        } else if (element.tagName === 'LABEL') {
            // Find the associated input and click it
            const inputId = element.getAttribute('for');
            if (inputId) {
                const input = document.getElementById(inputId);
                if (input && !input.disabled) {
                    input.dispatchEvent(new Event('change'));
                }
            }
        } else if (element.classList.contains('tab-item')) {
            // Handle tab switching
            document.querySelectorAll('.tab-item').forEach(t => {
                t.classList.remove('active');
            });
            
            element.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabId = element.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        }
    }, { passive: false });
});

// Handle tab switching
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-item').forEach(t => {
            t.classList.remove('active');
        });
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId + '-tab').classList.add('active');
    });
});

// Function to toggle checkboxes based on bundle ID type
function toggleEntitlements(isWildcard) {
    const allCheckboxes = document.querySelectorAll('.services-table input[type="checkbox"]');
    
    allCheckboxes.forEach(checkbox => {
        if (isWildcard) {
            // If it's a wildcard, disable and uncheck all checkboxes
            checkbox.disabled = true;
            checkbox.checked = false;
            
            // Add greyed out appearance to the entire row
            const row = checkbox.closest('tr');
            if (row) {
                row.classList.add('disabled-row');
            }
        } else {
            // If it's explicit, enable all checkboxes
            checkbox.disabled = false;
            
            // Remove greyed out appearance
            const row = checkbox.closest('tr');
            if (row) {
                row.classList.remove('disabled-row');
            }
        }
    });
}

// Handle Bundle ID radio buttons
document.querySelectorAll('input[name="bundle-id"]').forEach(radio => {
    radio.addEventListener('change', function() {
        // Update active states
        document.querySelectorAll('.bundle-id-container .radio-label').forEach(label => {
            label.classList.remove('active');
        });
        this.closest('.radio-label').classList.add('active');
        
        // Update the form note based on the selection
        const formNote = this.closest('.form-column').querySelector('.form-note');
        if (this.id === 'explicit') {
            formNote.textContent = 'We recommend using a reverse-domain name style string (i.e., com.domainname.appname). It cannot contain an asterisk (*).';
            // Enable entitlements
            toggleEntitlements(false);
        } else if (this.id === 'wildcard') {
            formNote.textContent = 'Example: com.domainname.* (Wildcard certificates cannot have entitlements)';
            // Disable entitlements
            toggleEntitlements(true);
        }
    });
});

// Initialize the UI state based on the default selected option
document.addEventListener('DOMContentLoaded', () => {
    const wildcardSelected = document.getElementById('wildcard').checked;
    toggleEntitlements(wildcardSelected);
});

// Handle export functionality
document.getElementById('export-btn').addEventListener('click', () => {
    const description = document.querySelector('input[type="text"]').value || 'No description';
    const udid = document.querySelectorAll('input[type="text"]')[1].value || 'No UDID provided';
    const discordUsername = document.querySelectorAll('input[type="text"]')[2].value || 'No Discord username provided';
    const bundleId = document.querySelectorAll('input[type="text"]')[3].value || 'com.example.app';
    
    // Get all selected capabilities
    const selectedCapabilities = [];
    document.querySelectorAll('#capabilities-tab .services-table input[type="checkbox"]').forEach((checkbox) => {
        if (checkbox.checked) {
            const serviceName = checkbox.parentElement.nextElementSibling.querySelector('label').innerText;
            selectedCapabilities.push(serviceName);
        }
    });
    
    // Get all selected app services
    const selectedAppServices = [];
    document.querySelectorAll('#app-services-tab .services-table input[type="checkbox"]').forEach((checkbox) => {
        if (checkbox.checked) {
            const serviceName = checkbox.parentElement.nextElementSibling.querySelector('label').innerText;
            selectedAppServices.push(serviceName);
        }
    });
    
    // Create export content
    let exportContent = `Neosign App ID Registration\n`;
    exportContent += `=========================\n\n`;
    exportContent += `Description: ${description}\n`;
    exportContent += `Device UDID: ${udid}\n`;
    exportContent += `Discord Username: ${discordUsername}\n`;
    exportContent += `Bundle ID: ${bundleId}\n\n`;
    
    // Add capabilities section
    exportContent += `Selected Capabilities:\n`;
    if (selectedCapabilities.length === 0) {
        exportContent += `- None selected\n`;
    } else {
        selectedCapabilities.forEach((capability) => {
            exportContent += `- ${capability}\n`;
        });
    }
    
    // Add app services section
    exportContent += `\nSelected App Services:\n`;
    if (selectedAppServices.length === 0) {
        exportContent += `- None selected\n`;
    } else {
        selectedAppServices.forEach((service) => {
            exportContent += `- ${service}\n`;
        });
    }
    
    // Create a blob and download
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neosign-app-id-registration-${bundleId.replace(/\./g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Prevent context menu on protected elements
document.addEventListener('DOMContentLoaded', () => {
    const protectedElements = document.querySelectorAll('.button, .logo-img, .service-icon, .info-icon, .service-name, .logo, .no-copy-content');
    
    protectedElements.forEach(element => {
        element.addEventListener('contextmenu', event => {
            event.preventDefault();
            return false;
        });
        
        // Prevent drag start
        element.addEventListener('dragstart', event => {
            event.preventDefault();
            return false;
        });
        
        // Prevent copy
        element.addEventListener('copy', event => {
            event.preventDefault();
            return false;
        });
    });
    
    // Apply to document level for images
    document.addEventListener('contextmenu', event => {
        if (event.target.tagName === 'IMG') {
            event.preventDefault();
            return false;
        }
    });
}); 