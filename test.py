import PyPDF2
from groq import Groq

def extract_text_from_pdf(pdf_path , prompt="Extract text from this CBC report"):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()

    try:
            client = Groq(api_key="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")
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": f"{prompt}. here is the pdf data : {text}"}
                ],
                model="llama3-70b-8192",
                temperature=0.1 \
            )
            response = chat_completion.choices[0].message.content
            return response
    except Exception as e:
        return "An error occurred while generating the response."



