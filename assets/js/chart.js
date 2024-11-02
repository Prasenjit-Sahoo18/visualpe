// Authentication and API Configuration
const API_BASE_URL = 'https://bridge-test-api.herokuapp.com';
const LOGIN_PAGE = 'https://ansuman528.github.io/VisualPe/login.html';
const WAIT_PAGE = 'https://ansuman528.github.io/VisualPe/wait.html';

// Check if current page is login page to prevent redirect loops
const isLoginPage = window.location.href.includes('login.html');

// Authentication Check
const checkAuthentication = async () => {
    if (isLoginPage) return; // Don't check auth on login page

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/checklogin`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "x-access-token": jwt
            }
        });

        const data = await response.json();
        
        if (data.wait) {
            window.location.href = WAIT_PAGE;
            return;
        }
        
        if (!data.auth) {
            window.location.href = LOGIN_PAGE;
            return;
        }

        return true; // Authentication successful
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }
};

// Chart Creation Functions
const createBarChart = (elementId, data, labels) => {
    if (!document.getElementById(elementId)) return;

    const ctx = document.getElementById(elementId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Data',
                data: data,
                backgroundColor: [
                    'rgba(218, 140, 255, 1)',
                    'rgba(154, 85, 255, 1)'
                ],
                borderColor: [
                    'rgba(218, 140, 255, 1)',
                    'rgba(154, 85, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

const createPieChart = (elementId, data, labels) => {
    if (!document.getElementById(elementId)) return;

    const ctx = document.getElementById(elementId).getContext('2d');
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(218, 140, 255, 1)',
                    'rgba(154, 85, 255, 1)'
                ],
                borderColor: [
                    'rgba(218, 140, 255, 1)',
                    'rgba(154, 85, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
};

// Data Fetching Function
const getData = async (endpoint, callback) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "x-access-token": jwt
            }
        });

        const data = await response.json();
        if (callback && typeof callback === 'function') {
            callback(data);
        }
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} data:`, error);
    }
};

// Helper function to insert text content
const insert = (elementId, text) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
};

// Initialize charts
const initializeCharts = async () => {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;

    // Define your chart configurations here
    Chart.defaults.global.legend.labels.usePointStyle = true;
    
    // Example usage:
    getData('EPF', (data) => {
        if (data && data.summary) {
            createPieChart(
                'epf-pi',
                [data.summary.employeeBalance, data.summary.employerBalance],
                ['Employee', 'Employer']
            );
            
            createBarChart(
                'epf-bar',
                [data.summary.employeeBalance, data.summary.employerBalance],
                ['Employee', 'Employer']
            );

            insert('epf-cb', data.summary.currentBalance);
            insert('epf-tb', data.summary.totalBalance);
        }
    });

    getData('PPF', (data) => {
        if (data && data.summary) {
            insert('ppf-cb', data.summary.currenBalance);
            insert('ppf-md', data.summary.maturityDate);
        }
    });
};

// Export functions for use in other files
window.Bar = createBarChart;
window.Pi = createPieChart;
window.getData = getData;
window.insert = insert;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeCharts);