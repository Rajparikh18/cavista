import os
from flask import Flask, jsonify, render_template, request

import numpy as np
from flask_cors import CORS
from groq import Groq
from test import extract_text_from_pdf
import re
import json
from flask_cors import CORS
from flask import send_file
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def extract_json(data):
    match = re.search(r'```(.*?)```', data, re.DOTALL)
    
    if match:
        json_str = match.group(1).strip()
        try:
            return json.loads(json_str) 
        except json.JSONDecodeError as e:
            print("Invalid JSON:", e)
            return None
    else:
        print("No JSON found in backticks")
        return None

folder_path = 'files'
if not os.path.exists(folder_path):
    os.makedirs(folder_path)

def get_completion_0(data , prompt):
    try:
            client = Groq(api_key="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")
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": f"{prompt}. here is the data : {data}"}
                ],
                model="llama3-70b-8192",
                temperature=0.01
            )
            response = chat_completion.choices[0].message.content
            return response
    except Exception as e:
        return "An error occurred while generating the response."


app = Flask(__name__)
CORS(app)

def calculate_severity(cbc_data):
    weights = {
        "Hemoglobin (Hb)": 20,
        "Packed Cell Volume (PCV)": 10,
        "Mean Corpuscular Volume (MCV)": 10,
        "Total RBC count": 20,
        "MCH": 10,
        "MCHC": 5,
        "Basophils": 3,
        "Neutrophils": 7,
        "RDW": 7,
        "Total WBC count": 20,
        "Platelet Count": 15,
        "Monocytes": 3,
        "Lymphocytes": 3,
        "Eosinophils": 2
    }
    
    total_weight = sum(weights.values())
    
    total_weighted_severity = 0

    for param, details in cbc_data.get("parameters", {}).items():
        if param in weights and "severity_rating" in details:
            severity_rating = details["severity_rating"]
            weight = weights[param]
            total_weighted_severity += severity_rating * weight
    overall_severity_score = total_weighted_severity / total_weight

    if overall_severity_score <= 1.5:
        severity_level = 1
        assessment = "No Significant Issue"
    elif overall_severity_score <= 2.5:
        severity_level = 2
        assessment = "Mild abnormalities detected"
    elif overall_severity_score <= 3.5:
        severity_level = 3
        assessment = "Follow-up Needed"
    elif overall_severity_score <= 4.5:
        severity_level = 4
        assessment = "Severe abnormalities present"
    else:
        severity_level = 5
        assessment = "Immediate Concern - Consult a doctor"

    return severity_level, assessment

def format_cbc_analysis_to_text(cbc_analysis):
    text_output = "Complete Blood Count (CBC) Analysis Report\n"
    text_output += "========================================\n\n"
    
    parameters = cbc_analysis.get("CBC_Analysis", {}).get("parameters", {})
    for param, details in parameters.items():
        text_output += f"Parameter: {param}\n"
        text_output += f"  - Value: {details.get('value', 'N/A')} {details.get('unit', '')}\n"
        text_output += f"  - Status: {details.get('status', 'N/A')}\n"
        text_output += f"  - Severity Rating: {details.get('severity_rating', 'N/A')}\n"
        text_output += f"  - Possible Conditions: {', '.join(details.get('possible_conditions', ['N/A']))}\n"
        text_output += f"  - Recommendations:\n"
        recommendations = details.get('recommendations', {})
        text_output += f"    * Dietary Changes: {recommendations.get('dietary_changes', 'N/A')}\n"
        text_output += f"    * Lifestyle Changes: {recommendations.get('lifestyle_changes', 'N/A')}\n"
        text_output += f"    * Medical Attention: {recommendations.get('medical_attention', 'N/A')}\n"
        text_output += "\n"
    
    overall_urgency_rating = cbc_analysis.get("CBC_Analysis", {}).get("overall_urgency_rating", "N/A")
    final_assessment = cbc_analysis.get("CBC_Analysis", {}).get("final_assessment", "N/A")
    text_output += f"Overall Urgency Rating: {overall_urgency_rating}\n"
    text_output += f"Final Assessment: {final_assessment}\n\n"
    
    general_recommendations = cbc_analysis.get("CBC_Analysis", {}).get("general_recommendations", {})
    text_output += "General Recommendations:\n"
    text_output += f"  - Dietary: {general_recommendations.get('dietary', 'N/A')}\n"
    text_output += f"  - Lifestyle: {general_recommendations.get('lifestyle', 'N/A')}\n"
    text_output += f"  - Medical Guidance: {general_recommendations.get('medical_guidance', 'N/A')}\n"
    
    return text_output

@app.route('/CBC_report', methods=["POST"])
def CBC_report():
    prompt_extract = """You are given a pathology report in text format. Extract the relevant values for the Complete Blood Count (CBC) and format them in JSON. Ensure each value is associated with its correct unit and ignore unnecessary information."""

    file = request.files['report']
    filepath = 'files/'
    filename = file.filename
    filepath = os.path.join(filepath, filename)
    file.save(filepath)
    
    data = extract_text_from_pdf(filepath, prompt=prompt_extract)
    
    prompt_analysis = """
    You are a medical AI assistant specializing in hematology and blood analysis. Given a patient's CBC (Complete Blood Count) data in JSON format, analyze each parameter against predefined thresholds to determine severity, associated conditions, and personalized recommendations.

    ### Analysis Process:
    1. **Threshold-based Evaluation:**
       - Compare each parameter against normal and critical ranges.
       - Assign severity ratings based on deviations:
         - **1**: Normal values
         - **2**: Mild abnormalities
         - **3**: Moderate deviations
         - **4**: Significant deviations
         - **5**: Critical values requiring immediate attention
       - Identify specific conditions associated with each abnormal value.

    2. **Comprehensive Report:**
       - **Parameter-wise analysis**:
         - Status of each parameter (Normal, Mild, Moderate, Severe, Critical)
         - Possible conditions linked to deviations
         - Suggested corrective measures

       - **Overall Urgency Rating**:
         - The highest severity rating among all parameters determines the urgency level.
         - Urgency scale (out of 5):
           - **1-2**: No Significant Issue
           - **3**: Follow-up Needed
           - **4-5**: Immediate Concern

       - **Recommendations**:
         - Dietary and lifestyle changes to improve blood health.
         - When to seek medical attention.
         - If critical, suggest immediate consultation.

    ### Output Format (Strictly Follow JSON Structure):
    {"CBC_Analysis": {
      "parameters": {
        "WBC": {
          "value": "<extracted_value>",
          "unit": "K/µL",
          "status": "Normal / Mild / Moderate / Severe / Critical",
          "severity_rating": "<1-5>",
          "possible_conditions": ["Leukopenia", "Leukocytosis"],
          "recommendations": {
            "dietary_changes": "Increase vitamin C intake to support immunity.",
            "lifestyle_changes": "Maintain hygiene and avoid infections.",
            "medical_attention": "Consult if fever persists."
          }
        }
      },
      "overall_urgency_rating": "Take the value from variable severity level",
      "final_assessment": "No Significant Issue / Follow-up Needed / Immediate Concern",
      "general_recommendations": {
        "dietary": "Iron, folate, and vitamin B12-rich diet recommended.",
        "lifestyle": "Regular check-ups, hydration, and balanced diet.",
        "medical_guidance": "Seek immediate medical help if symptoms worsen."
      }
    }}
    """
    
    response = get_completion_0(data=data, prompt=prompt_analysis)
    cbc_analysis = extract_json(response)
    
    severity_level, assessment = calculate_severity(cbc_analysis.get("CBC_Analysis", {}))
    print(severity_level, assessment)
    cbc_analysis["CBC_Analysis"]["overall_urgency_rating"] = severity_level
    cbc_analysis["CBC_Analysis"]["final_assessment"] = assessment
    
    html_output = format_cbc_analysis_to_html(cbc_analysis)
    
    return html_output

def format_cbc_analysis_to_html(cbc_analysis):
    html_output = """
    <div class="report-container">
        <h2>Complete Blood Count (CBC) Analysis Report</h2>
        <div class="report-section">
            <h3>Parameters Analysis</h3>
            <ul>
    """

    parameters = cbc_analysis.get("CBC_Analysis", {}).get("parameters", {})
    for param, details in parameters.items():
        html_output += f"""
        <li>
            <strong>{param}</strong>
            <ul>
                <li>Value: {details.get('value', 'N/A')} {details.get('unit', '')}</li>
                <li>Status: {details.get('status', 'N/A')}</li>
                <li>Severity Rating: {details.get('severity_rating', 'N/A')}</li>
                <li>Possible Conditions: {', '.join(details.get('possible_conditions', ['N/A']))}</li>
                <li>Recommendations:
                    <ul>
                        <li>Dietary Changes: {details.get('recommendations', {}).get('dietary_changes', 'N/A')}</li>
                        <li>Lifestyle Changes: {details.get('recommendations', {}).get('lifestyle_changes', 'N/A')}</li>
                        <li>Medical Attention: {details.get('recommendations', {}).get('medical_attention', 'N/A')}</li>
                    </ul>
                </li>
            </ul>
        </li>
        """

    html_output += """
            </ul>
        </div>
        <div class="report-section">
            <h3>Overall Assessment</h3>
            <p><strong>Urgency Rating:</strong> {overall_urgency_rating}</p>
            <p><strong>Final Assessment:</strong> {final_assessment}</p>
        </div>
        <div class="report-section">
            <h3>General Recommendations</h3>
            <ul>
                <li><strong>Dietary:</strong> {dietary}</li>
                <li><strong>Lifestyle:</strong> {lifestyle}</li>
                <li><strong>Medical Guidance:</strong> {medical_guidance}</li>
            </ul>
        </div>
    </div>
    """.format(
        overall_urgency_rating=cbc_analysis.get("CBC_Analysis", {}).get("overall_urgency_rating", "N/A"),
        final_assessment=cbc_analysis.get("CBC_Analysis", {}).get("final_assessment", "N/A"),
        dietary=cbc_analysis.get("CBC_Analysis", {}).get("general_recommendations", {}).get("dietary", "N/A"),
        lifestyle=cbc_analysis.get("CBC_Analysis", {}).get("general_recommendations", {}).get("lifestyle", "N/A"),
        medical_guidance=cbc_analysis.get("CBC_Analysis", {}).get("general_recommendations", {}).get("medical_guidance", "N/A")
    )

    return jsonify(cbc_analysis)
  
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)