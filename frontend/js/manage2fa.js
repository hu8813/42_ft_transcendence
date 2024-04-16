function display2faPage() {
    function check2FAStatus() {
        // Call backend API to get 2FA status
        fetch(`${getBackendURL()}/2fa-status`)
            .then(response => response.json())
            .then(data => {
                const statusElement = document.getElementById('status');
                statusElement.textContent = data.enabled ? 'Enabled' : 'Not enabled';
            })
            .catch(error => console.error('Error checking 2FA status:', error));
    }

    function enable2FA() {
        document.getElementById('qrCodeSection').style.display = 'block';
        generateQRCode();
    }

    function activate2FA() {
        const activationCode = document.getElementById('activationCode').value;
        // Call backend API to activate 2FA with the provided activation code
        fetch(`${getBackendURL()}/2fa-activate`, {
            method: 'POST',
            body: JSON.stringify({ activationCode }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Reload the page to reflect the updated 2FA status
                location.reload();
            } else {
                throw new Error('Failed to activate 2FA');
            }
        })
        .catch(error => console.error('Error activating 2FA:', error));
    }
    

    function generateQRCode() {
        // Call backend API to generate QR code
        fetch(`${getBackendURL()}/2fa-qr-code`)
            .then(response => response.blob())
            .then(data => {
                const qrCodeElement = document.getElementById('qrCode');
                const qrCodeURL = URL.createObjectURL(data);
                qrCodeElement.innerHTML = `<img src="${qrCodeURL}" alt="QR Code">`;
            })
            .catch(error => console.error('Error generating QR code:', error));
    }

    check2FAStatus();

    document.getElementById('enable2FA').addEventListener('click', enable2FA);
    document.getElementById('activate2FA').addEventListener('click', activate2FA);
}
