import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Message from './Message';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CBCResults from './CBCResults';

const Chatbot = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { text: "Hello! Please upload your CBC report in PDF format.", isBot: true }
    ]);
    const [analysisData, setAnalysisData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUpload = async () => {
        const file = fileInputRef.current.files[0];
        
        // Add file size validation (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            setMessages(prev => [...prev, {
                text: "File size should be less than 10MB",
                isBot: true
            }]);
            return;
        }

        const formData = new FormData();
        formData.append('report', file);
        formData.append('patientId', user._id);
        try {
            setMessages(prev => [...prev, {
                text: "Analuz...",
                isBot: true
            }]);

            const cloudinaryResponse = await fetch('http://localhost:5000/api/upload/cloudinary', {
                method: 'POST',
                body: formData
            });
            
            if (!cloudinaryResponse.ok) {
                const errorData = await cloudinaryResponse.json();
                throw new Error(errorData.message || 'Upload failed');
            }
            
            const { fileUrl } = await cloudinaryResponse.json();
            
            // Create new FormData with the Cloudinary URL
            const analysisFormData = new FormData();
            analysisFormData.append('fileUrl', fileUrl);
            
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
    } 

    const handleSavePdf = () => {
        if (!analysisData) {
            alert('No analysis data available. Please upload a report first.');
            return;
        }
    
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            let y = margin;
    
            // Helper function to add wrapped text
            const addWrappedText = (text, x, y, maxWidth, lineHeight = 7) => {
                if (!text) return y; // Handle undefined or null text
                const lines = doc.splitTextToSize(text.toString(), maxWidth);
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
    
            // Helper function to safely get array as string
            const safeJoin = (arr) => {
                return Array.isArray(arr) ? arr.join(', ') : 'None listed';
            };
    
            // Helper function to safely get nested object values
            const safeGet = (obj, key, defaultValue = 'Not specified') => {
                return obj && obj[key] ? obj[key] : defaultValue;
            };
    
            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", 'bold');
            y = addWrappedText('CBC Analysis Report', margin, y, pageWidth - 2 * margin, 10);
            y += 10;
    
            // Parameters Analysis
            doc.setFontSize(14);
            y = addWrappedText('Parameters Analysis', margin, y, pageWidth - 2 * margin);
            y += 5;
    
            doc.setFontSize(12);
            const parameters = analysisData.CBC_Analysis?.parameters || {};
            
            // Add detailed parameters
            for (const param in parameters) {
                const details = parameters[param] || {};
                
                doc.setFont(undefined, 'bold');
                y = addWrappedText(`${param}`, margin, y, pageWidth - 2 * margin);
                
                doc.setFont(undefined, 'normal');
                y = addWrappedText(`Value: ${safeGet(details, 'value')} ${safeGet(details, 'unit')}`, margin + 5, y, pageWidth - 2 * margin);
                y = addWrappedText(`Status: ${safeGet(details, 'status')}`, margin + 5, y, pageWidth - 2 * margin);
                y = addWrappedText(`Possible Conditions: ${safeJoin(details.possible_conditions)}`, margin + 5, y, pageWidth - 2 * margin);
                
                // Recommendations
                const recommendations = details.recommendations || {};
                y = addWrappedText('Recommendations:', margin + 5, y, pageWidth - 2 * margin);
                y = addWrappedText(`• Dietary Changes: ${safeGet(recommendations, 'dietary_changes')}`, margin + 10, y, pageWidth - 2 * margin);
                y = addWrappedText(`• Lifestyle Changes: ${safeGet(recommendations, 'lifestyle_changes')}`, margin + 10, y, pageWidth - 2 * margin);
                y = addWrappedText(`• Medical Attention: ${safeGet(recommendations, 'medical_attention')}`, margin + 10, y, pageWidth - 2 * margin);
                y += 5;
            }
    
            // Overall Assessment
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            y = addWrappedText('Overall Assessment', margin, y, pageWidth - 2 * margin);
            y += 5;
    
            const analysis = analysisData.CBC_Analysis || {};
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            y = addWrappedText(`Urgency Rating: ${safeGet(analysis, 'overall_urgency_rating')}`, margin + 5, y, pageWidth - 2 * margin);
            y = addWrappedText(`Final Assessment: ${safeGet(analysis, 'final_assessment')}`, margin + 5, y, pageWidth - 2 * margin);
            y += 5;
    
            // General Recommendations
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            y = addWrappedText('General Recommendations', margin, y, pageWidth - 2 * margin);
            y += 5;
    
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            const generalRecs = analysis.general_recommendations || {};
            y = addWrappedText(`Dietary: ${safeGet(generalRecs, 'dietary')}`, margin + 5, y, pageWidth - 2 * margin);
            y = addWrappedText(`Lifestyle: ${safeGet(generalRecs, 'lifestyle')}`, margin + 5, y, pageWidth - 2 * margin);
            y = addWrappedText(`Medical Guidance: ${safeGet(generalRecs, 'medical_guidance')}`, margin + 5, y, pageWidth - 2 * margin);
    
            // Save the PDF with a timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `CBC_Analysis_Report_${timestamp}.pdf`;
            
            // Use blob and createObjectURL for better browser compatibility
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
            
            setMessages(prev => [...prev, {
                text: "PDF report has been generated and downloaded successfully!",
                isBot: true
            }]);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setMessages(prev => [...prev, {
                text: "Error generating PDF report. Please try again.",
                isBot: true
            }]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
            >
                {/* Header */}
                <div className="border-b pb-4">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        CBC Report <span className="text-red-600">Analyzer</span>
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Upload your CBC report for instant analysis and recommendations
                    </p>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-sm rounded-lg p-4 ${
                                    message.isBot
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'bg-red-600 text-white'
                                }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2"
                                htmlFor="file-upload"
                            >
                                CBC Report (PDF)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="application/pdf"
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-medium
                                        file:bg-red-50 file:text-red-600
                                        hover:file:bg-red-100
                                        focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                        >
                            {isUploading ? 'Uploading...' : 'Upload & Analyze'}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSavePdf}
                            disabled={!analysisData}
                            className="flex-1 py-3 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:border-red-300 disabled:text-red-300"
                        >
                            Save Report as PDF
                        </motion.button>
                    </div>
                </div>

                {analysisData && (
                    <CBCResults analysisData={analysisData} />
                )}

            </motion.div>
        </div>
    );
};

export default Chatbot;