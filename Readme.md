# Backend Part of Assement

This is a backend project developed using Node.js, Express, and MongoDB. The project implements various APIs for managing transactions, fetching statistics, and generating data for charts.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)
- [Usage](#Usage)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/backendpractice.git
2. Navigate to the project directory `cd project-directory`
3. Install the dependencies
`npm install`

## Configuration
PORT=8000

MONGODB_URI=mongodb+srv://<username>:<password>@seeddata1.mv5ya.mongodb.net/?retryWrites=true&w=majority&appName=seeddata1

THIRD_PARTY_API_URL=<Third-party-api-url-here>

CORS_ORIGIN=*


## Scripts

To run the application in development mode, use: `npm run dev`

To start the application in production mode, use: `npm start`

## API Endpoints

The following API endpoints are available:

### Transaction Routes
### Initialize Database

- `URL:` /api/v2/transaction/initDatabase
Method: GET
- `Description:` Initializes the database using data from a third-party API.

### List Transactions

- `URL:` /api/v2/transaction
- `Method:` GET
- `Query Parameters:`
    - page (optional, default: 1): Page number for pagination.
    - perPage (optional, default: 10): Number of records per page.
    - search (optional): Search term for filtering transactions.
    - month (optional): Month for filtering transactions.

### Get Statistics

- `URL:` /api/v2/transaction/statistics
- `Method:` GET
- `Query Parameters:`
    - month: Month for which statistics are to be fetched.

### Get Bar Chart Data

- `URL:` /api/v2/transaction/barchartdata
- `Method:` GET
- `Query Parameters:`
    - month: Month for which bar chart data is to be fetched.

### Get Pie Chart Data

- `URL:` /api/v2/transaction/pieChartdata
- `Method:` GET
- `Query Parameters:`
    - month: Month for which pie chart data is to be fetched.


### Combined Data Response

- `URL:` /api/v2/transaction/combined-data
- `Method:` GET
- `Query Parameters:`
    - month: Month for which combined data is to be fetched.

## Dependencies

This project uses the following dependencies:

- axios: For making HTTP requests.
- cors: For enabling Cross-Origin Resource Sharing.
- dotenv: For loading environment variables.
- express: A minimal and flexible Node.js web application framework.
- mongoose: MongoDB object modeling for Node.js.
- nodemon: Development utility for automatically restarting the server during development.
- prettier: A code formatter.


## Usage
After setting up the project and starting the server, you can access the endpoints mentioned above using a tool like Postman or through your frontend application.
