import os
import cv2
import numpy as np
import pytesseract
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure OCR engine
pytesseract.pytesseract.tesseract_cmd = os.environ.get('TESSERACT_CMD', 'tesseract')

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """
    Preprocess the image to improve OCR accuracy
    """
    # Read image
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding to enhance text
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    
    # Apply dilation and erosion to remove noise
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    
    # Save the preprocessed image
    preprocessed_path = os.path.join(
        os.path.dirname(image_path),
        'preprocessed_' + os.path.basename(image_path)
    )
    cv2.imwrite(preprocessed_path, opening)
    
    return preprocessed_path

def extract_text(image_path):
    """
    Extract text from image using OCR
    """
    # Preprocess the image
    preprocessed_path = preprocess_image(image_path)
    
    # Use Tesseract to extract text
    text = pytesseract.image_to_string(Image.open(preprocessed_path))
    
    # Clean up temporary file
    os.remove(preprocessed_path)
    
    return text

def process_text(text):
    """
    Process the extracted text to identify key information
    """
    # Remove extra whitespace
    processed_text = re.sub(r'\s+', ' ', text).strip()
    
    # Extract potential part numbers (alphanumeric sequences)
    part_numbers = re.findall(r'[A-Z0-9]{5,}', processed_text)
    
    # Extract potential vehicle makes
    common_makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai', 'Kia']
    vehicle_makes = []
    for make in common_makes:
        if re.search(r'\b' + make + r'\b', processed_text, re.IGNORECASE):
            vehicle_makes.append(make)
    
    # Extract potential dimensions (e.g., 10x20x30)
    dimensions = re.findall(r'\b\d+(\.\d+)?[xX]\d+(\.\d+)?([xX]\d+(\.\d+)?)?\b', processed_text)
    
    # Extract potential weights
    weights = re.findall(r'\b\d+(\.\d+)?\s*(kg|g|lb|oz|pound|ounce)\b', processed_text, re.IGNORECASE)
    
    # Extract potential prices
    prices = re.findall(r'\$\s*\d+(\.\d{2})?', processed_text)
    
    # Organize extracted information
    extracted_info = {
        'part_numbers': part_numbers,
        'vehicle_makes': vehicle_makes,
        'dimensions': [d[0] for d in dimensions],
        'weights': [f"{w[0]} {w[1]}" for w in weights],
        'prices': prices
    }
    
    return processed_text, extracted_info

@app.route('/process', methods=['POST'])
def process_image():
    """
    Process an uploaded image with OCR
    """
    # Check if image file is present
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({'error': 'No image file selected'}), 400
    
    # Check if file is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from image
        raw_text = extract_text(filepath)
        
        # Process the extracted text
        processed_text, extracted_info = process_text(raw_text)
        
        # Clean up temporary file
        os.remove(filepath)
        
        return jsonify({
            'text': raw_text,
            'processed_text': processed_text,
            'extracted_info': extracted_info
        })
    
    except Exception as e:
        # Clean up temporary file if it exists
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({'status': 'healthy', 'service': 'ocr'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
