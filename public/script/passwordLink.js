import { showErrorNotification, showSuccessMssge } from "./messageHandler.js";

document.getElementById('sendlink').addEventListener('click', sendLink, { once: true });

async function sendLink() {
    const spinner = document.querySelector('#spin');
    spinner.style.display = "block";
    
    const email = document.querySelector('#email').value.trim();

    try {
        if (email == "") {
            throw new Error("Please Enter Email")
        }
        const reply = await fetch('/sendLink', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (!reply.ok) {
            throw new Error('Failed to send link');
        }

        const response = await reply.json();
        if (response.status) {
            spinner.style.display = "none";
           showSuccessMssge(response.message);
        } else {
            spinner.style.display = "none";
            _showErrorNotification(response);
        }
    } catch (error) {
        spinner.style.display = "none";
        showErrorNotification( error.message ); // Show error message from catch block
    }
}

