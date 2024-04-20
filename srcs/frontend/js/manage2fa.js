async function display2faPage() {
    async function check2FAStatus() {
        try {
            
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();
            let username = localStorage.getItem('userLogin');
            const response = await fetch(`/api/2fa-status?username=${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch 2FA status');
            }

            const data = await response.json();

            const statusElement = document.getElementById('status');
            statusElement.textContent = data.enabled ? 'Enabled' : 'Not enabled';

            
            const enable2FAButton = document.getElementById('enable2FA');
            if (data.enabled) {
                enable2FAButton.textContent = 'Disable 2FA';
            } else {
                enable2FAButton.textContent = 'Enable 2FA';
            }
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    }
 

    function enable2FA() {
        document.getElementById('qrCodeSection').style.display = 'block';
        generateQRCode();
    }
    async function disable2FA() {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();
    
            const response = await fetch(`/api/2fa-deactivate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                }
            });
    
            if (response.ok) {
                const statusElement = document.getElementById('status');
                if (statusElement) {
                    statusElement.textContent = 'Not enabled';
                }
                showNotification("2FA deactivated successfully.", true);
                document.getElementById('errorLabel').textContent = '';  
            } else {
                const responseData = await response.json();
                throw new Error(responseData.error || 'Failed to deactivate 2FA');
            }
        } catch (error) {
            console.error('Error deactivating 2FA:', error);
            showNotification("Failed to deactivate 2FA. Please try again later.", false);
            displayError(error.message);
        }
    }
    
    async function activate2FA() {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();
    
            const activationCode = document.getElementById('activationCode').value;
            console.log(activationCode)
            const response = await fetch(`/api/2fa-activate`, {
                method: 'POST',
                body: JSON.stringify({ activationCode }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                }
            });
    
            if (response.ok) {
                
                location.reload();
            } else {
                const responseData = await response.json();
                throw new Error(responseData.error || 'Failed to activate 2FA');
            }
        } catch (error) {
            console.error('Error activating 2FA:', error);
            displayError(error.message);
        }
    }
    
    async function generateQRCode() {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();
    
            const response = await fetch(`/api/2fa-qr-code`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                }
            });
    
            if (response.ok) {
                const data = await response.blob();
                const qrCodeElement = document.getElementById('qrCode');
                const qrCodeURL = URL.createObjectURL(data);
                qrCodeElement.innerHTML = `<img src="${qrCodeURL}" alt="QR Code">`;
            } else {
                const responseData = await response.json();
                throw new Error(responseData.error || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            displayError(error.message);
        }
    }
    
    async function enableOrDisable2FA() {
        const button = document.getElementById('enable2FA');
        if (button.textContent === 'Enable 2FA') {
            await enable2FA();
            button.textContent = 'Disable 2FA';
        } else {
            await disable2FA();
            button.textContent = 'Enable 2FA';
        }
    }
    
    function displayError(message) {
        const errorLabel = document.getElementById('errorLabel');
        if (errorLabel) {
            errorLabel.textContent = message;
            errorLabel.style.color = 'red'; 
        }
    }
    
    check2FAStatus();

    document.getElementById('enable2FA').addEventListener('click', enableOrDisable2FA);
    document.getElementById('activate2FA').addEventListener('click', activate2FA);
}