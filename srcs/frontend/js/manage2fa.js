async function display2faPage() {
    let disable2faVal = await translateKey('disable2fa');
    let enable2faVal = await translateKey('enable2fa');
    let FAenabledVal = await translateKey('2FAdisabled');
    let FAenabledVal2 = await translateKey('2FAenabled');
    let faDeactivated = await translateKey('2faDeactivated');
    let faActivated = await translateKey('2faActivated');
    let faFailed = await translateKey('2faFailed');
    let activate2fa = await translateKey('activate2fa');
    async function check2FAStatus(username) {
        try {
            
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();
            let username = localStorage.getItem('userLogin');
            const response = await fetch(`/api/2fa-status?username=${username}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch 2FA status');
            }

            const data = await response.json();
            
            const statusElement = document.getElementById('2FAdisabled');
            //console.log("2fa enabled", data.enabled);
            statusElement.textContent = data.enabled ? FAenabledVal2 : FAenabledVal;

            const enable2FAButton = document.getElementById('enable2FA');
            if (data.enabled) {
                enable2FAButton.textContent = disable2faVal;
            } else {
                enable2FAButton.textContent = enable2faVal;
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
                    statusElement.textContent = FAenabledVal;
                }
                showNotification(faDeactivated, true);
                document.getElementById('qrCodeSection').style.display = 'none';
                document.getElementById('qrCode').innerHTML = '';
                document.getElementById('activationCode').value = '';
                document.getElementById('errorLabel').textContent = '';  
            } else {
                const responseData = await response.json();
                throw new Error(responseData.error || 'Failed to deactivate 2FA');
            }
        } catch (error) {
            console.error('Error deactivating 2FA:', error);
            showNotification(faFailed, false);
            displayError(error.message);
        }
    }
    
    async function activate2FA() {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();
    
            const activationCode = document.getElementById('activationCode').value;
    
            if (!activationCode || !(/^\d{6}$/.test(activationCode))) {
                displayError('Activation code must be a 6-digit numeric value.');
                return;
            }
    
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
                showNotification(faActivated, true);
                document.getElementById('qrCodeSection').style.display = 'none';
                document.getElementById('qrCode').innerHTML = '';
                document.getElementById('activationCode').value = '';
                document.getElementById('errorLabel').textContent = '';
                //location.reload();
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
        const statusElement = document.getElementById('2FAdisabled');
        if (button.textContent === enable2faVal) {
            await enable2FA();
            
            button.textContent = disable2faVal;
            if (statusElement) 
                statusElement.textContent = FAenabledVal;
            
        } else {
            await disable2FA();
            
            button.textContent = enable2faVal;
            if (statusElement) 
                statusElement.textContent = FAenabledVal2;
        }
    }
    
    function displayError(message) {
        const errorLabel = document.getElementById('errorLabel');
        if (errorLabel) {
            errorLabel.textContent = message;
            errorLabel.style.color = 'red'; 
        }
    }
    username = localStorage.getItem('userLogin');
    check2FAStatus(username);

    document.getElementById('enable2FA').addEventListener('click', enableOrDisable2FA);
    if (document.getElementById('activate2fa'))
        document.getElementById('activate2fa').addEventListener('click', activate2FA);
    currrentLanguage2 = localStorage.getItem('language');
    translate(currrentLanguage2);
}