document.getElementById('upload-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (file) {
        const formData = new FormData();
        formData.append('report', file);

        // Show user message
        const chatbotBody = document.getElementById('chatbot-body');
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user-message');
        userMessage.textContent = `Uploaded file: ${file.name}`;
        chatbotBody.appendChild(userMessage);

        // Send file to Flask backend
        fetch('/CBC_report', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            // Show bot message with analysis
            const botMessage = document.createElement('div');
            botMessage.classList.add('message', 'bot-message');
            botMessage.innerHTML = data; // Use innerHTML to render HTML
            chatbotBody.appendChild(botMessage);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please select a PDF file to upload.');
    }
});