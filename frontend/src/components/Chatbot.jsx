import { useState, useRef } from 'react';
import Message from './Message';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! Please upload your CBC report in PDF format.", isBot: true }
    ]);
    const fileInputRef = useRef(null);

    const handleUpload = async () => {
        const file = fileInputRef.current.files[0];
        
        if (file) {
            const formData = new FormData();
            formData.append('report', file);

            setMessages(prev => [...prev, {
                text: `Uploaded file: ${file.name}`,
                isBot: false
            }]);

            try {
                const response = await fetch('http://127.0.0.1:5000/CBC_report', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.text();
                
                setMessages(prev => [...prev, {
                    text: data,
                    isBot: true
                }]);
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert('Please select a PDF file to upload.');
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h2>CBC Report Analyzer</h2>
            </div>
            <div className="chatbot-body">
                {messages.map((message, index) => (
                    <Message key={index} text={message.text} isBot={message.isBot} />
                ))}
            </div>
            <div className="chatbot-footer">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    className="file-input"
                />
                <button onClick={handleUpload} className="upload-btn">
                    Upload
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
