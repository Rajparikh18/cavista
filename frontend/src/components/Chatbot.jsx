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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-6 md:px-16">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">CBC Report Analyzer</h2>
                <div className="overflow-y-auto max-h-80 mb-4 p-4 bg-gray-100 rounded-lg">
                    {messages.map((message, index) => (
                        <Message key={index} text={message.text} isBot={message.isBot} />
                    ))}
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="application/pdf"
                        className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-red-600 file:text-white
                                   hover:file:bg-red-700"
                    />
                    <button 
                        onClick={handleUpload} 
                        className="w-full bg-red-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors">
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
