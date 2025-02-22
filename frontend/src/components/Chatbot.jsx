import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Message from './Message';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! Please upload your CBC report in PDF format.", isBot: true }
    ]);
    const [analysisData, setAnalysisData] = useState(null);
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
                const data = await response.json();
                setAnalysisData(data); // Store the analysis data
                
                setMessages(prev => [...prev, {
                    text: JSON.stringify(data, null, 2),
                    isBot: true
                }]);
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert('Please select a PDF file to upload.');
        }
    };

    const handleSavePdf = () => {
        if (!analysisData) {
            alert('No analysis data available. Please upload a report first.');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        let y = margin;

        // Helper function to add wrapped text
        const addWrappedText = (text, x, y, maxWidth, lineHeight = 7) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, x, y);
                y += lineHeight;
            });
            return y;
        };

        // Title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        y = addWrappedText('CBC Analysis Report', margin, y, pageWidth - 2 * margin, 10);
        y += 10;

        // Parameters Analysis
        doc.setFontSize(14);
        y = addWrappedText('Parameters Analysis', margin, y, pageWidth - 2 * margin);
        y += 5;

        doc.setFontSize(12);
        const parameters = analysisData.CBC_Analysis.parameters;
        
        // Add detailed parameters
        for (const param in parameters) {
            const details = parameters[param];
            
            doc.setFont(undefined, 'bold');
            y = addWrappedText(`${param}`, margin, y, pageWidth - 2 * margin);
            
            doc.setFont(undefined, 'normal');
            y = addWrappedText(`Value: ${details.value} ${details.unit}`, margin + 5, y, pageWidth - 2 * margin);
            y = addWrappedText(`Status: ${details.status}`, margin + 5, y, pageWidth - 2 * margin);
            y = addWrappedText(`Possible Conditions: ${details.possible_conditions.join(', ')}`, margin + 5, y, pageWidth - 2 * margin);
            
            // Recommendations
            y = addWrappedText('Recommendations:', margin + 5, y, pageWidth - 2 * margin);
            y = addWrappedText(`• Dietary Changes: ${details.recommendations.dietary_changes}`, margin + 10, y, pageWidth - 2 * margin);
            y = addWrappedText(`• Lifestyle Changes: ${details.recommendations.lifestyle_changes}`, margin + 10, y, pageWidth - 2 * margin);
            y = addWrappedText(`• Medical Attention: ${details.recommendations.medical_attention}`, margin + 10, y, pageWidth - 2 * margin);
            y += 5;
        }

        // Overall Assessment
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        y = addWrappedText('Overall Assessment', margin, y, pageWidth - 2 * margin);
        y += 5;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        y = addWrappedText(`Urgency Rating: ${analysisData.CBC_Analysis.overall_urgency_rating}`, margin + 5, y, pageWidth - 2 * margin);
        y = addWrappedText(`Final Assessment: ${analysisData.CBC_Analysis.final_assessment}`, margin + 5, y, pageWidth - 2 * margin);
        y += 5;

        // General Recommendations
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        y = addWrappedText('General Recommendations', margin, y, pageWidth - 2 * margin);
        y += 5;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const generalRecs = analysisData.CBC_Analysis.general_recommendations;
        y = addWrappedText(`Dietary: ${generalRecs.dietary}`, margin + 5, y, pageWidth - 2 * margin);
        y = addWrappedText(`Lifestyle: ${generalRecs.lifestyle}`, margin + 5, y, pageWidth - 2 * margin);
        y = addWrappedText(`Medical Guidance: ${generalRecs.medical_guidance}`, margin + 5, y, pageWidth - 2 * margin);

        // Save the PDF
        doc.save('CBC_Analysis_Report.pdf');
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
                <button onClick={handleSavePdf} className="upload-btn">
                    Save Pdf
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
