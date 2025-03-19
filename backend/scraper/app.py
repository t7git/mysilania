import os
import re
import json
import time
import logging
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure Chrome options for Selenium
def get_chrome_options():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    return chrome_options

# Initialize WebDriver
def init_driver():
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=get_chrome_options())
        return driver
    except Exception as e:
        logger.error(f"Error initializing WebDriver: {str(e)}")
        # Fallback to direct path if ChromeDriverManager fails
        try:
            service = Service('/usr/bin/chromedriver')
            driver = webdriver.Chrome(service=service, options=get_chrome_options())
            return driver
        except Exception as e2:
            logger.error(f"Fallback WebDriver initialization failed: {str(e2)}")
            raise

# General search function
def search_general(query):
    """
    Search for item details using general search engines
    """
    results = []
    
    # Google search URL
    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
    
    try:
        driver = init_driver()
        driver.get(search_url)
        
        # Wait for search results to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.g"))
        )
        
        # Get search results
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        search_results = soup.select("div.g")
        
        for result in search_results[:5]:  # Get top 5 results
            try:
                link_element = result.select_one("a")
                if not link_element:
                    continue
                
                link = link_element.get('href')
                if not link or not link.startswith('http'):
                    continue
                
                title_element = result.select_one("h3")
                title = title_element.text if title_element else "No title"
                
                snippet_element = result.select_one("div.VwiC3b")
                snippet = snippet_element.text if snippet_element else "No description"
                
                # Visit the page to extract more details
                driver.get(link)
                time.sleep(3)  # Wait for page to load
                
                page_soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                # Extract potential data
                data = extract_data_from_page(page_soup, query)
                
                results.append({
                    'source': 'general',
                    'source_url': link,
                    'title': title,
                    'description': snippet,
                    'data': data
                })
            except Exception as e:
                logger.error(f"Error processing search result: {str(e)}")
                continue
    
    except Exception as e:
        logger.error(f"Error in general search: {str(e)}")
    
    finally:
        if 'driver' in locals():
            driver.quit()
    
    return results

# Specialized search function for auto parts
def search_auto_parts(query):
    """
    Search for auto parts details using specialized websites
    """
    results = []
    
    # List of specialized auto parts websites
    websites = [
        {
            'name': 'RockAuto',
            'url': f"https://www.rockauto.com/en/search/?query={query.replace(' ', '+')}",
            'item_selector': 'tbody.listing-inner',
            'title_selector': 'span.ra-description',
            'price_selector': 'span.ra-formatted-amount',
            'part_number_selector': 'span.ra-part-number'
        },
        {
            'name': 'AutoZone',
            'url': f"https://www.autozone.com/search?searchText={query.replace(' ', '+')}",
            'item_selector': 'div.product-card',
            'title_selector': 'h2.product-name',
            'price_selector': 'span.price',
            'part_number_selector': 'div.product-details'
        }
    ]
    
    try:
        driver = init_driver()
        
        for website in websites:
            try:
                driver.get(website['url'])
                
                # Wait for search results to load
                try:
                    WebDriverWait(driver, 15).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, website['item_selector']))
                    )
                except TimeoutException:
                    logger.warning(f"Timeout waiting for results on {website['name']}")
                    continue
                
                # Get search results
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                items = soup.select(website['item_selector'])
                
                for item in items[:3]:  # Get top 3 results from each site
                    try:
                        title_element = item.select_one(website['title_selector'])
                        title = title_element.text.strip() if title_element else "No title"
                        
                        price_element = item.select_one(website['price_selector'])
                        price = price_element.text.strip() if price_element else None
                        
                        part_number_element = item.select_one(website['part_number_selector'])
                        part_number = None
                        if part_number_element:
                            # Extract part number using regex
                            part_number_text = part_number_element.text
                            part_number_match = re.search(r'Part #:\s*([A-Z0-9-]+)', part_number_text)
                            if part_number_match:
                                part_number = part_number_match.group(1)
                        
                        # Extract other data from the item
                        data = {
                            'title': title,
                            'price': price,
                            'part_number': part_number,
                            'source_name': website['name']
                        }
                        
                        # Try to extract more details
                        vehicle_make_match = re.search(r'for\s+([A-Za-z]+)', title)
                        if vehicle_make_match:
                            data['vehicle_make'] = vehicle_make_match.group(1)
                        
                        vehicle_model_match = re.search(r'for\s+[A-Za-z]+\s+([A-Za-z0-9]+)', title)
                        if vehicle_model_match:
                            data['vehicle_model'] = vehicle_model_match.group(1)
                        
                        # Extract dimensions if available
                        dimensions_element = item.select_one('div.dimensions, div.specs')
                        if dimensions_element:
                            dimensions_text = dimensions_element.text
                            width_match = re.search(r'Width:\s*([\d.]+)\s*in', dimensions_text)
                            height_match = re.search(r'Height:\s*([\d.]+)\s*in', dimensions_text)
                            depth_match = re.search(r'Depth:\s*([\d.]+)\s*in', dimensions_text)
                            
                            if width_match:
                                data['width'] = float(width_match.group(1))
                            if height_match:
                                data['height'] = float(height_match.group(1))
                            if depth_match:
                                data['depth'] = float(depth_match.group(1))
                        
                        # Extract weight if available
                        weight_element = item.select_one('div.weight, div.specs')
                        if weight_element:
                            weight_text = weight_element.text
                            weight_match = re.search(r'Weight:\s*([\d.]+)\s*(lb|kg)', weight_text)
                            if weight_match:
                                data['weight'] = float(weight_match.group(1))
                                data['weight_unit'] = weight_match.group(2)
                        
                        results.append({
                            'source': 'specialized',
                            'source_url': website['url'],
                            'title': title,
                            'description': f"Part from {website['name']}",
                            'data': data
                        })
                    except Exception as e:
                        logger.error(f"Error processing item from {website['name']}: {str(e)}")
                        continue
            
            except Exception as e:
                logger.error(f"Error searching {website['name']}: {str(e)}")
                continue
    
    except Exception as e:
        logger.error(f"Error in specialized search: {str(e)}")
    
    finally:
        if 'driver' in locals():
            driver.quit()
    
    return results

# Extract data from a webpage
def extract_data_from_page(soup, query):
    """
    Extract structured data from a webpage
    """
    data = {}
    
    # Try to extract part number
    part_number_patterns = [
        r'Part\s*#?\s*:\s*([A-Z0-9-]+)',
        r'Part\s*Number\s*:\s*([A-Z0-9-]+)',
        r'Item\s*#?\s*:\s*([A-Z0-9-]+)',
        r'SKU\s*:\s*([A-Z0-9-]+)'
    ]
    
    for pattern in part_number_patterns:
        part_number_match = re.search(pattern, soup.text)
        if part_number_match:
            data['part_number'] = part_number_match.group(1)
            break
    
    # Try to extract vehicle make and model
    vehicle_info = re.search(r'for\s+([A-Za-z]+)\s+([A-Za-z0-9]+)', soup.text)
    if vehicle_info:
        data['vehicle_make'] = vehicle_info.group(1)
        data['vehicle_model'] = vehicle_info.group(2)
    
    # Try to extract dimensions
    dimensions_pattern = r'Dimensions\s*:\s*([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*(?:in|inches|cm)'
    dimensions_match = re.search(dimensions_pattern, soup.text)
    if dimensions_match:
        data['width'] = float(dimensions_match.group(1))
        data['height'] = float(dimensions_match.group(2))
        data['depth'] = float(dimensions_match.group(3))
    else:
        # Try individual dimension patterns
        width_match = re.search(r'Width\s*:\s*([\d.]+)\s*(?:in|inches|cm)', soup.text)
        height_match = re.search(r'Height\s*:\s*([\d.]+)\s*(?:in|inches|cm)', soup.text)
        depth_match = re.search(r'Depth\s*:\s*([\d.]+)\s*(?:in|inches|cm)', soup.text)
        
        if width_match:
            data['width'] = float(width_match.group(1))
        if height_match:
            data['height'] = float(height_match.group(1))
        if depth_match:
            data['depth'] = float(depth_match.group(1))
    
    # Try to extract weight
    weight_pattern = r'Weight\s*:\s*([\d.]+)\s*(lb|lbs|kg|g)'
    weight_match = re.search(weight_pattern, soup.text)
    if weight_match:
        data['weight'] = float(weight_match.group(1))
        data['weight_unit'] = weight_match.group(2)
    
    # Try to extract price
    price_pattern = r'\$\s*([\d,]+\.?\d*)'
    price_match = re.search(price_pattern, soup.text)
    if price_match:
        data['price'] = float(price_match.group(1).replace(',', ''))
    
    # Try to extract color
    color_pattern = r'Color\s*:\s*([A-Za-z]+)'
    color_match = re.search(color_pattern, soup.text)
    if color_match:
        data['color'] = color_match.group(1)
    
    # Try to extract description
    description_elements = soup.select('div.description, div.product-description, meta[name="description"]')
    if description_elements:
        for element in description_elements:
            if element.name == 'meta':
                data['description'] = element.get('content', '')
            else:
                data['description'] = element.text.strip()
            break
    
    # Try to extract image URL
    image_elements = soup.select('img.product-image, img.main-image')
    if image_elements:
        for img in image_elements:
            src = img.get('src', '')
            if src and (src.startswith('http') or src.startswith('/')):
                data['image_url'] = src
                break
    
    return data

@app.route('/search', methods=['POST'])
def search():
    """
    Search for item details using web scraping
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query']
        sources = data.get('sources', ['general', 'specialized'])
        
        results = []
        
        if 'general' in sources:
            general_results = search_general(query)
            results.extend(general_results)
        
        if 'specialized' in sources:
            specialized_results = search_auto_parts(query)
            results.extend(specialized_results)
        
        return jsonify({'results': results})
    
    except Exception as e:
        logger.error(f"Error in search endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({'status': 'healthy', 'service': 'scraper'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
