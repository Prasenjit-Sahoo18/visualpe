class ChartManager {
    checkAuth() {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            window.location.href = "/login.html";
            return;
        }
        // Optional: Verify token validity
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                localStorage.removeItem("jwt");
                window.location.href = "/login.html";
            }
        } catch (e) {
            localStorage.removeItem("jwt");
            window.location.href = "/login.html";
        }
    }

    constructor() {
        this.pl1 = [
            'rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)',
            // ... (keep all your color values)
        ];
        
        this.pl2 = [
            'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)',
            // ... (keep all your color values)
        ];

        this.token = localStorage.getItem('token');
        this.initializeChartConfigs();
    }

    initializeChartConfigs() {
        this.doughnutPieConfig = {
            data: {
                datasets: [{
                    data: [],
                    backgroundColor: this.pl1,
                    borderColor: this.pl2
                }],
                labels: ['employee', 'employer']
            },
            options: {
                responsive: true,
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

        this.barConfig = {
            data: {
                labels: [],
                datasets: [{
                    label: '₹',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                legend: {
                    display: false
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        };
    }

    async getPulseData(type) {
        try {
            const response = await fetch(
                `https://raw.githubusercontent.com/PhonePe/pulse/master/data/aggregated/transaction/country/india/${type}`,
                {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                        "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching pulse data:", error);
            throw error;
        }
    }

    async getData(type) {
        try {
            if (!this.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(
                `https://bridge-test-api.herokuapp.com/get-data/${type}`,
                {
                    method: 'get',
                    mode: 'cors',
                    credentials: 'same-origin',
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Authorization": `Bearer ${this.token}`
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    throw new Error('Authentication failed');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }

    insert(id, data) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = data;
        }
    }

    createPieChart(id, data, labels) {
        try {
            const canvas = document.getElementById(id);
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            
            // Destroy existing chart if it exists
            if (canvas.chart) {
                canvas.chart.destroy();
            }

            this.doughnutPieConfig.data.datasets[0].data = data;
            this.doughnutPieConfig.data.labels = labels;

            canvas.chart = new Chart(ctx, {
                type: 'pie',
                data: this.doughnutPieConfig.data,
                options: this.doughnutPieConfig.options
            });
        } catch (error) {
            console.error(`Error creating pie chart for ${id}:`, error);
        }
    }

    createBarChart(id, data, labels) {
        try {
            const canvas = document.getElementById(id);
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            
            // Destroy existing chart if it exists
            if (canvas.chart) {
                canvas.chart.destroy();
            }

            this.barConfig.data.datasets[0].data = data;
            this.barConfig.data.labels = labels;

            canvas.chart = new Chart(ctx, {
                type: 'bar',
                data: this.barConfig.data,
                options: this.barConfig.options
            });
        } catch (error) {
            console.error(`Error creating bar chart for ${id}:`, error);
        }
    }

    // Utility method to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    // Method to update all charts
    async updateCharts() {
        try {
            // Update all your charts here
            const depositData = await this.getData('DEPOSIT');
            this.createBarChart('deposit-chart', 
                [depositData.currentValue, depositData.investmentValue],
                ['Current Value', 'Investment Value']
            );

            // Add more chart updates as needed
        } catch (error) {
            console.error("Error updating charts:", error);
        }
    }

    // Method to initialize everything
    async initialize() {
        try {
            await this.updateCharts();
            // Set up any event listeners or periodic updates
            setInterval(() => this.updateCharts(), 300000); // Update every 5 minutes
        } catch (error) {
            console.error("Error initializing charts:", error);
        }
    }
}

// Create and initialize the chart manager when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const chartManager = new ChartManager();
    chartManager.initialize();
});

// Export for use in other files
export default ChartManager;