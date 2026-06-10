// Configuration File for Google Sheets Integration
// ================================================

// Replace with your Google Apps Script deployment URL
// Follow these steps to create it:
// 1. Go to your Google Sheet: https://sheets.google.com
// 2. Click Extensions > Apps Script
// 3. Paste the code below into Apps Script
// 4. Click Deploy > New Deployment > Web app
// 5. Copy the deployment URL and paste it here

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent';

// Google Sheet Configuration
const GOOGLE_SHEET_CONFIG = {
    sheetName: 'ELH Test Results',
    headers: [
        'Timestamp',
        'Full Name',
        'Email Address',
        'Educational Level',
        'Total Score',
        'Level',
        'Grammar Score',
        'Vocabulary Score',
        'Reading Score',
        'Writing Score'
    ]
};

// ================================================
// GOOGLE APPS SCRIPT CODE
// ================================================
// Paste this code into your Google Apps Script project:

/*
function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSheet();
        const data = JSON.parse(e.postData.contents);
        
        // Check if headers exist, if not create them
        if (sheet.getLastRow() === 0) {
            const headers = [
                'Timestamp',
                'Full Name',
                'Email Address',
                'Educational Level',
                'Total Score',
                'Level',
                'Grammar Score',
                'Vocabulary Score',
                'Reading Score',
                'Writing Score'
            ];
            sheet.appendRow(headers);
        }
        
        // Add data row
        sheet.appendRow([
            new Date(data.timestamp).toLocaleString(),
            data.fullName,
            data.email,
            data.educationLevel,
            data.totalScore,
            data.level,
            data.grammarScore,
            data.vocabularyScore,
            data.readingScore,
            data.writingScore
        ]);
        
        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({success: true, message: 'Data saved successfully'}))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
*/

// ================================================
// SETUP INSTRUCTIONS
// ================================================

/*
STEP 1: Create a Google Sheet
- Go to https://sheets.google.com
- Create a new spreadsheet
- Name it "ELH Test Results"
- Share it with the appropriate people

STEP 2: Set up Google Apps Script
- Open your Google Sheet
- Click "Extensions" menu
- Select "Apps Script"
- Delete any existing code
- Paste the code from the comment above
- Click "Deploy" button
- Select "New Deployment"
- Choose type: "Web app"
- Execute as: Your account
- Who has access: "Anyone"
- Click "Deploy"
- Copy the deployment URL (it looks like: https://script.google.com/macros/d/XXXXX/usercontent)

STEP 3: Update this Configuration File
- Replace YOUR_DEPLOYMENT_ID in the URL above with your actual deployment ID
- Or paste the full URL from step 2

STEP 4: Verify Everything Works
- Go to your Google Sheet
- Submit a test from the placement test
- Check if the data appears in your sheet

TROUBLESHOOTING:
- If data doesn't save, check the Apps Script deployment URL
- Make sure the sheet is shared with view/edit permissions
- Check browser console (F12) for error messages
- Results are automatically saved locally in browser storage as backup
*/

// ================================================
// UTILITY FUNCTIONS
// ================================================

function isGoogleSheetsConfigured() {
    return GOOGLE_APPS_SCRIPT_URL !== 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent';
}

function getConfigStatus() {
    return {
        configured: isGoogleSheetsConfigured(),
        url: GOOGLE_APPS_SCRIPT_URL,
        message: isGoogleSheetsConfigured() 
            ? '✓ Google Sheets is configured' 
            : '⚠ Google Sheets is NOT configured. Results will be saved locally only.'
    };
}

// Log configuration status
console.log('%c English Learning Hub - Configuration Status', 'color: #667eea; font-weight: bold; font-size: 14px;');
console.log(getConfigStatus());

// ================================================
// TEST DATA (FOR DEMO/TESTING)
// ================================================

const DEMO_DATA = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    educationLevel: 'Bachelor',
    totalScore: 75,
    level: 'B2 Upper-Intermediate',
    grammarScore: '15/20',
    vocabularyScore: '12/15',
    readingScore: '8/10',
    writingScore: 20,
    timestamp: new Date().toISOString()
};

// Function to test data saving
function testDataSaving() {
    console.log('%c Testing data save functionality...', 'color: #764ba2; font-style: italic;');
    
    if (isGoogleSheetsConfigured()) {
        console.log('✓ Sending test data to Google Sheets...');
        fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(DEMO_DATA)
        })
        .then(response => response.json())
        .then(data => {
            console.log('✓ Response from Google Sheets:', data);
        })
        .catch(error => {
            console.error('✗ Error:', error);
        });
    } else {
        console.log('⚠ Google Sheets URL not configured. Skipping network test.');
    }
}

// ================================================
// EXPORT FUNCTIONS
// ================================================

function exportResultsToCSV() {
    const results = JSON.parse(localStorage.getItem('testResults') || '[]');
    if (results.length === 0) {
        alert('No results to export');
        return;
    }
    
    let csv = 'Timestamp,Full Name,Email,Educational Level,Total Score,Level,Grammar Score,Vocabulary Score,Reading Score,Writing Score\n';
    
    results.forEach(result => {
        csv += `"${result.timestamp}","${result.fullName}","${result.email}","${result.educationLevel}","${result.totalScore}","${result.level}","${result.grammarScore}","${result.vocabularyScore}","${result.readingScore}","${result.writingScore}"\n`;
    });
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `ELH_Results_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function getLocalResults() {
    return JSON.parse(localStorage.getItem('testResults') || '[]');
}

function clearLocalResults() {
    if (confirm('Are you sure you want to clear all local results? This cannot be undone.')) {
        localStorage.removeItem('testResults');
        console.log('✓ Local results cleared');
    }
}