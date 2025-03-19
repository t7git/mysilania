# mysilania

A comprehensive application for managing niche items (e.g., car parts, furniture, medical equipment) with automated data extraction, organization, and eCommerce integration.

## Project Overview

mysilania is a full-stack application that serves as both a desktop/web interface and an automated backend system for managing inventory of specialized items. The system:

- Captures images (from a phone or other device)
- Extracts text via OCR
- Uses web scraping and AI agents to gather detailed information
- Organizes the extracted and scraped data into a secure, editable database
- Allows dynamic filtering, sorting, and inventory management
- Integrates with eCommerce platforms (like eBay and Shopify) for auto-populating listings and batch posting

## System Architecture

The application follows a modular architecture with the following components:

- **Frontend**: React-based responsive web interface with customizable themes
- **Backend**: Node.js/Express API server with specialized modules for:
  - OCR processing
  - Web scraping
  - Data cleaning and organization
  - Database management
  - eCommerce integration
- **Database**: PostgreSQL for structured data storage
- **Docker**: Containerization for easy deployment and scaling

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)
- Python 3.8+ (for OCR and scraping modules)

### Installation

1. Clone the repository
2. Set up environment variables (copy `.env.example` to `.env` and fill in the values)
3. Run `docker-compose up` to start all services
4. Access the web interface at `http://localhost:3000`

## Project Structure

```
mysilania/
├── backend/             # Backend server and modules
│   ├── api/             # Express API endpoints
│   ├── ocr/             # OCR processing module
│   ├── scraper/         # Web scraping module
│   ├── data_cleaner/    # Data cleaning and organization
│   └── ecommerce/       # eCommerce integration
├── frontend/            # React frontend application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── assets/      # Static assets (images, CSS)
│       └── utils/       # Utility functions
├── database/            # Database scripts and migrations
├── docker/              # Docker configuration files
└── docs/                # Documentation
```

## Features

- Image capture and upload
- OCR text extraction
- Deep web scraping for detailed information
- AI-powered data cleaning and organization
- Secure database with extensive filtering capabilities
- eCommerce integration with eBay and Shopify
- Customizable UI themes with "flower of life" branding

## License

[MIT License](LICENSE)
