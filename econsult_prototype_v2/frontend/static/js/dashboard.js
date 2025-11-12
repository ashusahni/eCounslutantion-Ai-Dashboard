// Modern Dashboard JavaScript
class EConsultationDashboard {
    constructor() {
        this.charts = {};
        this.commentsCache = null;
        this.isAnalyzing = false;
        this.isUploading = false;
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalPages = 1;
        this.currentView = 'card'; // 'card' or 'table'
        this.filteredComments = [];
        this.init();
    }

    init() {
        this.hideLoadingScreen();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
        this.setupAutoRefresh();
        this.setupSearchSuggestions();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.remove(), 500);
            }
        }, 1000);
    }

    setupEventListeners() {
        const bulkText = document.getElementById('bulkText');
        if (bulkText) {
            bulkText.addEventListener('input', this.handleTextInput.bind(this));
        }

        this.addButtonEvent('ingestBtn', this.handleIngest.bind(this));
        this.addButtonEvent('csvBtn', this.handleCsvUpload.bind(this));
        this.addButtonEvent('analyzeBtn', this.handleAnalyze.bind(this));
        this.addButtonEvent('clearBtn', this.handleClear.bind(this));
        this.addButtonEvent('clearTextBtn', this.handleClearText.bind(this));
        this.addButtonEvent('downloadTemplateBtn', this.handleDownloadTemplate.bind(this));
        this.addButtonEvent('refreshWordCloudBtn', this.handleRefreshWordCloud.bind(this));
        this.addButtonEvent('refreshCommentsBtn', this.handleRefreshComments.bind(this));
        this.addButtonEvent('exportBtn', this.handleExportData.bind(this));
        this.addButtonEvent('exportCommentsBtn', this.handleExportComments.bind(this));
        this.addButtonEvent('exportSentimentBtn', this.handleExportSentiment.bind(this));
        this.addButtonEvent('helpBtn', this.showHelpModal.bind(this));
        
        // Pagination controls
        this.addButtonEvent('firstPageBtn', () => this.goToPage(1));
        this.addButtonEvent('prevPageBtn', () => this.goToPage(this.currentPage - 1));
        this.addButtonEvent('nextPageBtn', () => this.goToPage(this.currentPage + 1));
        this.addButtonEvent('lastPageBtn', () => this.goToPage(this.totalPages));
        this.addButtonEvent('firstPageBtnFooter', () => this.goToPage(1));
        this.addButtonEvent('prevPageBtnFooter', () => this.goToPage(this.currentPage - 1));
        this.addButtonEvent('nextPageBtnFooter', () => this.goToPage(this.currentPage + 1));
        this.addButtonEvent('lastPageBtnFooter', () => this.goToPage(this.totalPages));
        
        // View toggle
        this.addButtonEvent('cardViewBtn', () => this.switchView('card'));
        this.addButtonEvent('tableViewBtn', () => this.switchView('table'));
        
        // Page size selector
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderComments();
            });
        }

        const csvFile = document.getElementById('csvFile');
        if (csvFile) {
            csvFile.addEventListener('change', this.handleFileSelect.bind(this));
        }

        const clauseSelect = document.getElementById('clauseSelect');
        if (clauseSelect) {
            clauseSelect.addEventListener('change', this.handleClauseChange.bind(this));
        }

        const sentimentFilter = document.getElementById('sentimentFilter');
        const intentFilter = document.getElementById('intentFilter');
        if (sentimentFilter) {
            sentimentFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }
        if (intentFilter) {
            intentFilter.addEventListener('change', this.handleFilterChange.bind(this));
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.handleSearch();
            });
        }
    }

    addButtonEvent(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handler);
        }
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        const csvFile = document.getElementById('csvFile');
        
        if (!uploadArea || !csvFile) return;

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                csvFile.files = files;
                this.handleFileSelect();
            }
        });

        uploadArea.addEventListener('click', () => {
            csvFile.click();
        });
    }

    handleTextInput(e) {
        const text = e.target.value;
        const charCount = text.length;
        const lineCount = text.split('\n').filter(line => line.trim()).length;
        
        document.getElementById('charCount').textContent = `${charCount} characters`;
        document.getElementById('lineCount').textContent = `${lineCount} lines`;
    }

    handleFileSelect() {
        const fileInput = document.getElementById('csvFile');
        const csvBtn = document.getElementById('csvBtn');
        
        if (fileInput.files.length > 0) {
            csvBtn.disabled = false;
            this.showToast('File selected: ' + fileInput.files[0].name, 'info');
        } else {
            csvBtn.disabled = true;
        }
    }

    async handleIngest() {
        if (this.isUploading) return;
        
        const text = document.getElementById('bulkText').value.trim();
        if (!text) {
            this.showToast('Please enter some comments to ingest', 'warning');
            return;
        }

        this.isUploading = true;
        this.setButtonLoading('ingestBtn', true);
        this.showStatusMessage('uploadMsg', 'Uploading comments...', 'info');

        try {
            const items = text.split('\n').map(line => {
                const parts = line.split('::');
                return {
                    text: (parts[0] || '').trim(),
                    clause: (parts[1] || 'overall').trim()
                };
            }).filter(item => item.text);

            const response = await this.apiCall('/ingest_json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items)
            });

            const result = await response.json();
            this.showStatusMessage('uploadMsg', `Successfully ingested ${result.ids?.length || 0} comments`, 'success');
            this.showToast(`Successfully ingested ${result.ids?.length || 0} comments`, 'success');
            
            document.getElementById('bulkText').value = '';
            this.handleTextInput({ target: { value: '' } });
            await this.loadInitialData();
            
        } catch (error) {
            this.showStatusMessage('uploadMsg', 'Failed to ingest comments: ' + error.message, 'error');
            this.showToast('Failed to ingest comments', 'error');
        } finally {
            this.isUploading = false;
            this.setButtonLoading('ingestBtn', false);
        }
    }

    async handleCsvUpload() {
        if (this.isUploading) return;
        
        const fileInput = document.getElementById('csvFile');
        if (!fileInput.files.length) {
            this.showToast('Please select a CSV file first', 'warning');
            return;
        }

        this.isUploading = true;
        this.setButtonLoading('csvBtn', true);
        this.showStatusMessage('csvMsg', 'Uploading CSV file...', 'info');

        try {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            const response = await this.apiCall('/upload_csv', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const result = await response.json();
            this.showStatusMessage('csvMsg', `CSV uploaded successfully: ${result.ingested} rows`, 'success');
            this.showToast(`CSV uploaded successfully: ${result.ingested} rows`, 'success');
            
            fileInput.value = '';
            document.getElementById('csvBtn').disabled = true;
            await this.loadInitialData();
            
        } catch (error) {
            this.showStatusMessage('csvMsg', 'CSV upload failed: ' + error.message, 'error');
            this.showToast('CSV upload failed', 'error');
        } finally {
            this.isUploading = false;
            this.setButtonLoading('csvBtn', false);
        }
    }

    async handleAnalyze() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.setButtonLoading('analyzeBtn', true);
        this.showStatusMessage('analyzeMsg', 'Running AI analysis...', 'info');

        try {
            const response = await this.apiCall('/analyze', { method: 'POST' });
            const result = await response.json();
            
            this.showStatusMessage('analyzeMsg', `Analysis complete: ${result.processed || 0} comments processed`, 'success');
            this.showToast(`Analysis complete: ${result.processed || 0} comments processed`, 'success');
            
            this.refreshWordCloud();
            await this.loadInitialData();
            
        } catch (error) {
            if (error.message.includes('500')) {
                this.showStatusMessage('analyzeMsg', 'Server needs restart. Please restart the server and try again.', 'warning');
                this.showToast('Server needs restart. Please run: python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000', 'warning');
            } else {
                this.showStatusMessage('analyzeMsg', 'Analysis failed: ' + error.message, 'error');
                this.showToast('Analysis failed', 'error');
            }
        } finally {
            this.isAnalyzing = false;
            this.setButtonLoading('analyzeBtn', false);
        }
    }

    handleClear() {
        if (confirm('Are you sure you want to delete ALL comments and predictions? This action cannot be undone.')) {
            this.performClear();
        }
    }

    async performClear() {
        this.setButtonLoading('clearBtn', true);
        this.showStatusMessage('clearMsg', 'Clearing all data...', 'info');

        try {
            const response = await this.apiCall('/clear', { method: 'POST' });
            const result = await response.json();
            
            this.showStatusMessage('clearMsg', result.message || 'All data cleared successfully', 'success');
            this.showToast('All data cleared successfully', 'success');
            
            await this.loadInitialData();
            
            const wordCloudImg = document.getElementById('wordCloudImg');
            const wordCloudPlaceholder = document.getElementById('wordCloudPlaceholder');
            if (wordCloudImg) wordCloudImg.style.display = 'none';
            if (wordCloudPlaceholder) wordCloudPlaceholder.style.display = 'block';
            
        } catch (error) {
            this.showStatusMessage('clearMsg', 'Failed to clear data: ' + error.message, 'error');
            this.showToast('Failed to clear data', 'error');
        } finally {
            this.setButtonLoading('clearBtn', false);
        }
    }

    handleClearText() {
        document.getElementById('bulkText').value = '';
        this.handleTextInput({ target: { value: '' } });
        this.showToast('Text cleared', 'info');
    }

    handleDownloadTemplate() {
        const csvContent = 'Comment,Clause,Date\n"Sample comment 1","Clause 1","2024-01-01"\n"Sample comment 2","Clause 2","2024-01-02"';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'econsultation_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.showToast('Template downloaded', 'success');
    }

    handleRefreshWordCloud() {
        this.refreshWordCloud();
        this.showToast('Word cloud refreshed', 'info');
    }

    handleRefreshComments() {
        this.loadComments();
        this.showToast('Comments refreshed', 'info');
    }

    handleClauseChange() {
        const clauseSelect = document.getElementById('clauseSelect');
        const selectedClause = clauseSelect.value;
        
        if (selectedClause) {
            this.loadClauseIntent(selectedClause);
        }
    }

    handleFilterChange() {
        this.applyFilters();
    }

    handleSearch() {
        this.applyFilters();
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadMetrics(),
                this.loadComments(),
                this.loadClauseOptions()
            ]);
            // Load word cloud if it exists
            this.refreshWordCloud();
            // Update insights
            this.updateInsights();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showToast('Failed to load data', 'error');
        }
    }

    async loadMetrics() {
        try {
            const response = await this.apiCall('/metrics');
            const data = await response.json();
            
            this.updateStats(data);
            this.createSentimentChart(data.overall || {});
            
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    async loadComments() {
        try {
            const response = await this.apiCall('/comments');
            const data = await response.json();
            
            this.commentsCache = data;
            this.filteredComments = data.items || [];
            this.updatePagination();
            this.renderComments();
            
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    async loadClauseOptions() {
        try {
            const response = await this.apiCall('/metrics');
            const data = await response.json();
            const byClause = data.by_clause || {};
            
            const clauseSelect = document.getElementById('clauseSelect');
            if (clauseSelect) {
                clauseSelect.innerHTML = '<option value="">Select Clause</option>';
                
                Object.keys(byClause)
                    .filter(k => k && k.trim().length > 0)
                    .sort()
                    .forEach(clause => {
                        const option = document.createElement('option');
                        option.value = clause;
                        option.textContent = clause;
                        clauseSelect.appendChild(option);
                    });
            }
            
        } catch (error) {
            console.error('Failed to load clause options:', error);
        }
    }

    async loadClauseIntent(clause) {
        try {
            const response = await this.apiCall('/metrics');
            const data = await response.json();
            const byClause = data.by_clause || {};
            const clauseData = byClause[clause] || {};
            
            this.createIntentChart(clauseData);
            
        } catch (error) {
            console.error('Failed to load clause intent:', error);
        }
    }

    createSentimentChart(data) {
        const ctx = document.getElementById('sentimentChart');
        if (!ctx) return;

        if (this.charts.sentiment) {
            this.charts.sentiment.destroy();
        }

        const labels = Object.keys(data);
        const values = Object.values(data);
        const colors = this.getSentimentColors(labels);

        this.charts.sentiment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 3,
                    hoverOffset: 20,
                    hoverBorderWidth: 4,
                    hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                    cutout: '65%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                rotation: -0.5 * Math.PI,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f8fafc',
                            padding: 25,
                            usePointStyle: true,
                            font: { size: 14, weight: '700', family: 'Inter, sans-serif' },
                            generateLabels: (chart) => {
                                const data = chart.data;
                                if (data.labels.length === 0) return [];
                                
                                return data.labels.map((label, index) => {
                                    const dataset = data.datasets[0];
                                    const value = dataset.data[index];
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: dataset.backgroundColor[index],
                                        strokeStyle: dataset.backgroundColor[index],
                                        lineWidth: 2,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: index,
                                        fontColor: '#f8fafc'
                                    };
                                });
                            }
                        },
                        onClick: (e, legendItem, legend) => {
                            const chart = legend.chart;
                            const index = legendItem.index;
                            
                            // Toggle visibility of the segment
                            const meta = chart.getDatasetMeta(0);
                            meta.data[index].hidden = !meta.data[index].hidden;
                            chart.update();
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        cornerRadius: 12,
                        displayColors: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, weight: '600' },
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const total = values.reduce((a, b) => a + b, 0) || 1;
                                const value = context.parsed || 0;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} comments (${percentage}%)`;
                            },
                            afterLabel: (context) => {
                                return 'Click to filter comments';
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const elementIndex = elements[0].index;
                        const label = labels[elementIndex];
                        this.filterBySentiment(label);
                    }
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                }
            }
        });
    }

    createIntentChart(data) {
        const ctx = document.getElementById('intentChart');
        if (!ctx) return;

        if (this.charts.intent) {
            this.charts.intent.destroy();
        }

        const labels = Object.keys(data).filter(k => k !== 'count');
        const values = labels.map(k => data[k] || 0);
        const colors = this.getIntentColors(labels);

        this.charts.intent = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 3,
                    hoverOffset: 20,
                    hoverBorderWidth: 4,
                    hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                    cutout: '65%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                rotation: -0.5 * Math.PI,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f8fafc',
                            padding: 25,
                            usePointStyle: true,
                            font: { size: 14, weight: '700', family: 'Inter, sans-serif' },
                            generateLabels: (chart) => {
                                const data = chart.data;
                                if (data.labels.length === 0) return [];
                                
                                return data.labels.map((label, index) => {
                                    const dataset = data.datasets[0];
                                    const value = dataset.data[index];
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: dataset.backgroundColor[index],
                                        strokeStyle: dataset.backgroundColor[index],
                                        lineWidth: 2,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: index,
                                        fontColor: '#f8fafc'
                                    };
                                });
                            }
                        },
                        onClick: (e, legendItem, legend) => {
                            const chart = legend.chart;
                            const index = legendItem.index;
                            
                            // Toggle visibility of the segment
                            const meta = chart.getDatasetMeta(0);
                            meta.data[index].hidden = !meta.data[index].hidden;
                            chart.update();
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        cornerRadius: 12,
                        displayColors: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, weight: '600' },
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const total = values.reduce((a, b) => a + b, 0) || 1;
                                const value = context.parsed || 0;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} comments (${percentage}%)`;
                            },
                            afterLabel: (context) => {
                                return 'Click to filter comments';
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const elementIndex = elements[0].index;
                        const label = labels[elementIndex];
                        this.filterByIntent(label);
                    }
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                }
            }
        });

        // Force legend text color after chart creation
        setTimeout(() => {
            this.forceLegendTextColor('intentChart');
        }, 100);
    }

    getSentimentColors(labels) {
        const colorMap = {
            'positive': '#22c55e', // Bright green - Positive sentiment
            'negative': '#ef4444', // Red - Negative sentiment  
            'neutral': '#6b7280', // Gray - Neutral sentiment
            'AGREE': '#3b82f6', // Blue - Trust and agreement
            'DISAGREE': '#dc2626', // Dark red - Disagreement and concern
            'SUGGEST_CHANGE': '#059669', // Dark green - Positive change
            'REQUEST_CLARIFICATION': '#d97706', // Orange - Caution and questions
            'CLAUSE_FEEDBACK': '#7c3aed' // Purple - General feedback
        };
        
        // Enhanced color palette for more vibrant sentiment visualization
        const enhancedColors = [
            '#22c55e', // Bright green - Positive
            '#ef4444', // Red - Negative
            '#f59e0b', // Amber - Neutral/Warning
            '#3b82f6', // Blue - Trust
            '#8b5cf6', // Violet - Special
            '#06b6d4', // Cyan - Information
            '#84cc16', // Lime - Success
            '#f97316', // Orange - Attention
            '#ec4899', // Pink - Highlight
            '#6366f1'  // Indigo - Default
        ];
        
        // If we have standard sentiment labels, use the enhanced palette
        const standardSentiments = ['positive', 'negative', 'neutral'];
        if (labels.every(label => standardSentiments.includes(label.toLowerCase()))) {
            return labels.map((label, index) => {
                switch(label.toLowerCase()) {
                    case 'positive': return '#22c55e'; // Bright green
                    case 'negative': return '#ef4444'; // Red
                    case 'neutral': return '#f59e0b'; // Amber (more vibrant than gray)
                    default: return enhancedColors[index % enhancedColors.length];
                }
            });
        }
        
        // For other labels, use the enhanced color palette
        return labels.map((label, index) => {
            const mappedColor = colorMap[label.toLowerCase()];
            return mappedColor || enhancedColors[index % enhancedColors.length];
        });
    }

    getIntentColors(labels) {
        const colorMap = {
            'AGREE': '#2563eb', // Bright blue - Trust and agreement
            'DISAGREE': '#dc2626', // Red - Disagreement and concern
            'SUGGEST_CHANGE': '#16a34a', // Green - Positive change
            'REQUEST_CLARIFICATION': '#ea580c', // Orange - Caution and questions
            'CLAUSE_FEEDBACK': '#9333ea' // Purple - General feedback
        };
        return labels.map(label => colorMap[label] || '#6366f1');
    }

    updateStats(data) {
        const totalComments = data.total_comments || 0;
        const analyzedComments = data.analyzed_comments || 0;
        const totalClauses = Object.keys(data.by_clause || {}).length;

        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('analyzedComments').textContent = analyzedComments;
        document.getElementById('totalClauses').textContent = totalClauses;
    }

    renderCommentsTable(comments) {
        const tbody = document.getElementById('commentsTableBody');
        if (!tbody) return;

        if (comments.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <p>No comments available. Upload data to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = comments.map(comment => `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.clause || 'N/A'}</td>
                <td><span class="pill ${comment.sentiment?.toLowerCase()}">${comment.sentiment || 'N/A'}</span></td>
                <td><span class="pill ${comment.intent}">${comment.intent || 'N/A'}</span></td>
                <td>${comment.summary || 'N/A'}</td>
                <td>${this.truncateText(comment.text || 'N/A', 100)}</td>
                <td>
                    <button class="btn-icon" onclick="dashboard.viewComment(${comment.id})" title="View full comment">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    applyFilters() {
        if (!this.commentsCache) return;

        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const sentimentFilter = document.getElementById('sentimentFilter').value;
        const intentFilter = document.getElementById('intentFilter').value;

        let filteredComments = this.commentsCache.items || [];

        if (searchTerm) {
            filteredComments = filteredComments.filter(comment => {
                const searchText = `${comment.text} ${comment.summary} ${comment.clause}`.toLowerCase();
                return searchText.includes(searchTerm);
            });
        }

        if (sentimentFilter) {
            filteredComments = filteredComments.filter(comment => 
                comment.sentiment?.toLowerCase() === sentimentFilter
            );
        }

        if (intentFilter) {
            filteredComments = filteredComments.filter(comment => 
                comment.intent === intentFilter
            );
        }

        this.filteredComments = filteredComments;
        this.currentPage = 1;
        this.updatePagination();
        this.renderComments();
        this.updateCommentsInfo(filteredComments.length);
        this.updateSearchInfo(filteredComments.length, searchTerm, sentimentFilter, intentFilter);
    }

    updateCommentsInfo(count) {
        const commentsInfo = document.getElementById('commentsInfo');
        if (commentsInfo) {
            commentsInfo.textContent = `Showing ${count} comment${count !== 1 ? 's' : ''}`;
        }
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredComments.length / this.pageSize);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
        
        this.updatePaginationControls();
        this.updatePaginationInfo();
    }

    updatePaginationControls() {
        const firstPageBtn = document.getElementById('firstPageBtn');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const lastPageBtn = document.getElementById('lastPageBtn');
        const firstPageBtnFooter = document.getElementById('firstPageBtnFooter');
        const prevPageBtnFooter = document.getElementById('prevPageBtnFooter');
        const nextPageBtnFooter = document.getElementById('nextPageBtnFooter');
        const lastPageBtnFooter = document.getElementById('lastPageBtnFooter');

        const isFirstPage = this.currentPage === 1;
        const isLastPage = this.currentPage === this.totalPages;

        [firstPageBtn, firstPageBtnFooter].forEach(btn => {
            if (btn) btn.disabled = isFirstPage;
        });
        [prevPageBtn, prevPageBtnFooter].forEach(btn => {
            if (btn) btn.disabled = isFirstPage;
        });
        [nextPageBtn, nextPageBtnFooter].forEach(btn => {
            if (btn) btn.disabled = isLastPage;
        });
        [lastPageBtn, lastPageBtnFooter].forEach(btn => {
            if (btn) btn.disabled = isLastPage;
        });

        this.updatePageNumbers();
    }

    updatePageNumbers() {
        const pageNumbers = document.getElementById('pageNumbers');
        if (!pageNumbers) return;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        pageNumbers.innerHTML = '';

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.goToPage(i));
            pageNumbers.appendChild(pageBtn);
        }
    }

    updatePaginationInfo() {
        const pageInfo = document.getElementById('pageInfo');
        const paginationInfo = document.getElementById('paginationInfo');
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
        
        if (paginationInfo) {
            const startIndex = (this.currentPage - 1) * this.pageSize + 1;
            const endIndex = Math.min(this.currentPage * this.pageSize, this.filteredComments.length);
            paginationInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${this.filteredComments.length} comments`;
        }
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.renderComments();
        this.updatePaginationControls();
        this.updatePaginationInfo();
    }

    switchView(view) {
        this.currentView = view;
        
        const cardView = document.getElementById('cardView');
        const tableView = document.getElementById('tableView');
        const cardViewBtn = document.getElementById('cardViewBtn');
        const tableViewBtn = document.getElementById('tableViewBtn');
        
        if (view === 'card') {
            if (cardView) cardView.style.display = 'block';
            if (tableView) tableView.style.display = 'none';
            if (cardViewBtn) cardViewBtn.classList.add('active');
            if (tableViewBtn) tableViewBtn.classList.remove('active');
        } else {
            if (cardView) cardView.style.display = 'none';
            if (tableView) tableView.style.display = 'block';
            if (cardViewBtn) cardViewBtn.classList.remove('active');
            if (tableViewBtn) tableViewBtn.classList.add('active');
        }
        
        this.renderComments();
    }

    renderComments() {
        if (this.currentView === 'card') {
            this.renderCommentsCards();
        } else {
            this.renderCommentsTable();
        }
    }

    renderCommentsCards() {
        const cardsGrid = document.getElementById('commentsCardsGrid');
        if (!cardsGrid) return;

        if (this.filteredComments.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>No comments available. Upload data to get started.</p>
                </div>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageComments = this.filteredComments.slice(startIndex, endIndex);

        cardsGrid.innerHTML = pageComments.map(comment => this.createCommentCard(comment)).join('');
    }

    createCommentCard(comment) {
        const date = comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'N/A';
        
        return `
            <div class="comment-card">
                <div class="comment-card-header">
                    <span class="comment-id">#${comment.id}</span>
                    <div class="comment-actions">
                        <button class="btn-icon" onclick="dashboard.viewComment(${comment.id})" title="View full comment">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="comment-clause">
                    <i class="fas fa-tag"></i>
                    ${comment.clause || 'N/A'}
                </div>
                
                <div class="comment-pills">
                    <span class="pill ${comment.sentiment?.toLowerCase()}">${comment.sentiment || 'N/A'}</span>
                    <span class="pill ${comment.intent}">${comment.intent || 'N/A'}</span>
                </div>
                
                ${comment.summary ? `
                    <div class="comment-summary">
                        ${comment.summary}
                    </div>
                ` : ''}
                
                <div class="comment-text">
                    ${comment.text || 'No text available'}
                </div>
                
                <div class="comment-meta">
                    <div class="comment-date">
                        <i class="fas fa-calendar"></i>
                        ${date}
                    </div>
                </div>
            </div>
        `;
    }

    renderCommentsTable() {
        const tbody = document.getElementById('commentsTableBody');
        if (!tbody) return;

        if (this.filteredComments.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <p>No comments available. Upload data to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageComments = this.filteredComments.slice(startIndex, endIndex);

        tbody.innerHTML = pageComments.map(comment => `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.clause || 'N/A'}</td>
                <td><span class="pill ${comment.sentiment?.toLowerCase()}">${comment.sentiment || 'N/A'}</span></td>
                <td><span class="pill ${comment.intent}">${comment.intent || 'N/A'}</span></td>
                <td>${comment.summary || 'N/A'}</td>
                <td>${this.truncateText(comment.text || 'N/A', 100)}</td>
                <td>
                    <button class="btn-icon" onclick="dashboard.viewComment(${comment.id})" title="View full comment">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateSearchInfo(count, searchTerm, sentimentFilter, intentFilter) {
        const searchInfo = document.getElementById('searchInfo');
        if (!searchInfo) return;

        const filters = [];
        if (searchTerm) filters.push(`"${searchTerm}"`);
        if (sentimentFilter) filters.push(sentimentFilter);
        if (intentFilter) filters.push(intentFilter);

        if (filters.length > 0) {
            searchInfo.textContent = `Filtered ${count} comment${count !== 1 ? 's' : ''} (${filters.join(' • ')})`;
        } else {
            searchInfo.textContent = '';
        }
    }

    refreshWordCloud() {
        const wordCloudImg = document.getElementById('wordCloudImg');
        const wordCloudPlaceholder = document.getElementById('wordCloudPlaceholder');
        
        if (wordCloudImg && wordCloudPlaceholder) {
            // Show loading state
            wordCloudPlaceholder.innerHTML = `
                <div class="placeholder-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="placeholder-text">
                    <h4>Loading Word Cloud...</h4>
                    <p>Generating visualization from your data</p>
                </div>
            `;
            wordCloudPlaceholder.style.display = 'block';
            wordCloudImg.style.display = 'none';
            
            // Load the word cloud image
            wordCloudImg.src = `/wordcloud?ts=${Date.now()}`;
            
            // Handle successful load
            wordCloudImg.onload = () => {
                wordCloudImg.style.display = 'block';
                wordCloudPlaceholder.style.display = 'none';
            };
            
            // Handle load error
            wordCloudImg.onerror = () => {
                wordCloudPlaceholder.innerHTML = `
                    <div class="placeholder-icon">
                        <i class="fas fa-cloud-rain"></i>
                    </div>
                    <div class="placeholder-text">
                        <h4>No Word Cloud Available</h4>
                        <p>Run analysis to generate word cloud visualization</p>
                    </div>
                `;
                wordCloudPlaceholder.style.display = 'block';
                wordCloudImg.style.display = 'none';
            };
        }
    }

    updateInsights() {
        // Update sentiment insights
        const sentimentData = this.getSentimentData();
        if (sentimentData && sentimentData.length > 0) {
            const total = sentimentData.reduce((sum, item) => sum + item.value, 0);
            const positive = sentimentData.find(item => item.label.toLowerCase().includes('positive'));
            const negative = sentimentData.find(item => item.label.toLowerCase().includes('negative'));
            const neutral = sentimentData.find(item => item.label.toLowerCase().includes('neutral'));

            if (positive) {
                const percentage = Math.round((positive.value / total) * 100);
                const element = document.getElementById('positiveInsight');
                if (element) element.textContent = `${percentage}%`;
            }
            if (negative) {
                const percentage = Math.round((negative.value / total) * 100);
                const element = document.getElementById('negativeInsight');
                if (element) element.textContent = `${percentage}%`;
            }
            if (neutral) {
                const percentage = Math.round((neutral.value / total) * 100);
                const element = document.getElementById('neutralInsight');
                if (element) element.textContent = `${percentage}%`;
            }
        }

        // Update intent insights
        const intentData = this.getIntentData();
        if (intentData && intentData.length > 0) {
            const mostCommon = intentData.reduce((max, item) => item.value > max.value ? item : max);
            const element = document.getElementById('commonIntent');
            if (element) element.textContent = mostCommon.label;
        }

        // Update comment count
        const totalCommentsElement = document.getElementById('totalCommentsCount');
        if (totalCommentsElement) {
            totalCommentsElement.textContent = this.commentsCache ? this.commentsCache.items.length : 0;
        }

        // Update active clauses count
        if (this.commentsCache && this.commentsCache.items) {
            const uniqueClauses = new Set(this.commentsCache.items.map(comment => comment.clause).filter(Boolean));
            const element = document.getElementById('activeClauses');
            if (element) element.textContent = uniqueClauses.size;
        }
    }

    getSentimentData() {
        // This would return the current sentiment chart data
        // For now, return mock data structure
        return [
            { label: 'Positive', value: 45 },
            { label: 'Negative', value: 25 },
            { label: 'Neutral', value: 30 }
        ];
    }

    getIntentData() {
        // This would return the current intent chart data
        // For now, return mock data structure
        return [
            { label: 'AGREE', value: 40 },
            { label: 'DISAGREE', value: 20 },
            { label: 'SUGGEST_CHANGE', value: 25 },
            { label: 'REQUEST_CLARIFICATION', value: 15 }
        ];
    }

    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            button.disabled = false;
            const originalContent = {
                'ingestBtn': '<i class="fas fa-plus"></i> Ingest Comments',
                'csvBtn': '<i class="fas fa-upload"></i> Upload CSV',
                'analyzeBtn': '<i class="fas fa-play"></i> Run Analysis',
                'clearBtn': '<i class="fas fa-trash"></i> Clear All Data'
            };
            button.innerHTML = originalContent[buttonId] || button.innerHTML;
        }
    }

    showStatusMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = message;
        element.className = `status-message ${type}`;
        
        setTimeout(() => {
            element.textContent = '';
            element.className = 'status-message';
        }, 5000);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    async apiCall(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                // Only set Content-Type for non-FormData requests
                ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    viewComment(commentId) {
        if (!this.filteredComments || this.filteredComments.length === 0) {
            this.showToast('No comments loaded', 'warning');
            return;
        }
        
        const comment = this.filteredComments.find(c => c.id === commentId);
        if (!comment) {
            this.showToast('Comment not found', 'error');
            return;
        }
        
        this.showCommentModal(comment);
    }

    showCommentModal(comment) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('commentModal');
        if (!modal) {
            modal = this.createCommentModal();
            document.body.appendChild(modal);
        }
        
        // Populate modal with comment data
        document.getElementById('commentModalTitle').textContent = `Comment #${comment.id}`;
        document.getElementById('commentModalClause').textContent = comment.clause || 'N/A';
        document.getElementById('commentModalSentiment').innerHTML = `<span class="pill ${comment.sentiment?.toLowerCase()}">${comment.sentiment || 'N/A'}</span>`;
        document.getElementById('commentModalIntent').innerHTML = `<span class="pill ${comment.intent}">${comment.intent || 'N/A'}</span>`;
        document.getElementById('commentModalSummary').textContent = comment.summary || 'No summary available';
        document.getElementById('commentModalText').textContent = comment.text || 'No text available';
        document.getElementById('commentModalDate').textContent = comment.created_at ? new Date(comment.created_at).toLocaleString() : 'N/A';
        
        // Show modal
        modal.classList.add('show');
    }

    createCommentModal() {
        const modal = document.createElement('div');
        modal.id = 'commentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="commentModalTitle">Comment Details</h3>
                    <button class="btn-icon modal-close" id="commentModalCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="comment-details">
                        <div class="comment-field">
                            <label>Clause:</label>
                            <span id="commentModalClause">N/A</span>
                        </div>
                        <div class="comment-field">
                            <label>Sentiment:</label>
                            <span id="commentModalSentiment">N/A</span>
                        </div>
                        <div class="comment-field">
                            <label>Intent:</label>
                            <span id="commentModalIntent">N/A</span>
                        </div>
                        <div class="comment-field">
                            <label>Date:</label>
                            <span id="commentModalDate">N/A</span>
                        </div>
                        <div class="comment-field">
                            <label>Summary:</label>
                            <p id="commentModalSummary">No summary available</p>
                        </div>
                        <div class="comment-field">
                            <label>Full Text:</label>
                            <div class="comment-text" id="commentModalText">No text available</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="commentModalCloseBtn2">Close</button>
                    <button class="btn btn-primary" id="commentModalExportBtn">
                        <i class="fas fa-download"></i>
                        Export Comment
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const closeBtn1 = modal.querySelector('#commentModalCloseBtn');
        const closeBtn2 = modal.querySelector('#commentModalCloseBtn2');
        const exportBtn = modal.querySelector('#commentModalExportBtn');
        
        closeBtn1.addEventListener('click', () => this.hideCommentModal());
        closeBtn2.addEventListener('click', () => this.hideCommentModal());
        exportBtn.addEventListener('click', () => this.exportComment());
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideCommentModal();
            }
        });
        
        return modal;
    }

    hideCommentModal() {
        const modal = document.getElementById('commentModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    exportComment() {
        const modal = document.getElementById('commentModal');
        if (!modal) return;
        
        const commentData = {
            id: document.getElementById('commentModalTitle').textContent.replace('Comment #', ''),
            clause: document.getElementById('commentModalClause').textContent,
            sentiment: document.getElementById('commentModalSentiment').textContent.trim(),
            intent: document.getElementById('commentModalIntent').textContent.trim(),
            summary: document.getElementById('commentModalSummary').textContent,
            text: document.getElementById('commentModalText').textContent,
            date: document.getElementById('commentModalDate').textContent
        };
        
        const dataStr = JSON.stringify(commentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `comment_${commentData.id}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Comment exported successfully', 'success');
    }

    // Interactive filtering methods
    filterBySentiment(sentiment) {
        const sentimentFilter = document.getElementById('sentimentFilter');
        if (sentimentFilter) {
            // Map chart labels to filter values
            const sentimentMap = {
                'positive': 'positive',
                'negative': 'negative', 
                'neutral': 'neutral',
                'AGREE': 'positive',
                'DISAGREE': 'negative',
                'SUGGEST_CHANGE': 'positive',
                'REQUEST_CLARIFICATION': 'neutral',
                'CLAUSE_FEEDBACK': 'neutral'
            };
            
            const filterValue = sentimentMap[sentiment] || sentiment.toLowerCase();
            sentimentFilter.value = filterValue;
            this.applyFilters();
            this.showToast(`Filtered by sentiment: ${sentiment}`, 'info');
        }
    }

    filterByIntent(intent) {
        const intentFilter = document.getElementById('intentFilter');
        if (intentFilter) {
            intentFilter.value = intent;
            this.applyFilters();
            this.showToast(`Filtered by intent: ${intent}`, 'info');
        }
    }

    // Export functionality
    handleExportData() {
        if (!this.commentsCache || !this.commentsCache.items) {
            this.showToast('No data to export', 'warning');
            return;
        }
        
        const data = {
            exportDate: new Date().toISOString(),
            totalComments: this.commentsCache.items.length,
            comments: this.commentsCache.items.map(comment => ({
                id: comment.id,
                clause: comment.clause,
                sentiment: comment.sentiment,
                intent: comment.intent,
                summary: comment.summary,
                text: comment.text,
                created_at: comment.created_at
            }))
        };
        
        this.downloadJSON(data, 'econsultation_data_export.json');
        this.showToast('Data exported successfully', 'success');
    }

    handleExportComments() {
        if (!this.filteredComments || this.filteredComments.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }
        
        const csvContent = this.convertToCSV(this.filteredComments);
        this.downloadCSV(csvContent, 'comments_export.csv');
        this.showToast('Comments exported as CSV', 'success');
    }

    handleExportSentiment() {
        if (!this.charts.sentiment) {
            this.showToast('No sentiment chart to export', 'warning');
            return;
        }
        
        const canvas = document.getElementById('sentimentChart');
        const dataURL = canvas.toDataURL('image/png');
        this.downloadImage(dataURL, 'sentiment_analysis_chart.png');
        this.showToast('Sentiment chart exported', 'success');
    }

    convertToCSV(data) {
        const headers = ['ID', 'Clause', 'Sentiment', 'Intent', 'Summary', 'Text', 'Created At'];
        const csvRows = [headers.join(',')];
        
        data.forEach(comment => {
            const row = [
                comment.id,
                `"${comment.clause || ''}"`,
                `"${comment.sentiment || ''}"`,
                `"${comment.intent || ''}"`,
                `"${(comment.summary || '').replace(/"/g, '""')}"`,
                `"${(comment.text || '').replace(/"/g, '""')}"`,
                comment.created_at || ''
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        this.downloadBlob(dataBlob, filename);
    }

    downloadCSV(content, filename) {
        const dataBlob = new Blob([content], { type: 'text/csv' });
        this.downloadBlob(dataBlob, filename);
    }

    downloadImage(dataURL, filename) {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        link.click();
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Ctrl/Cmd + R for refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.loadInitialData();
                this.showToast('Data refreshed', 'info');
            }
            
            // Ctrl/Cmd + E for export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.handleExportData();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.hideCommentModal();
                const modal = document.getElementById('confirmModal');
                if (modal && modal.classList.contains('show')) {
                    modal.classList.remove('show');
                }
            }
        });
    }

    // Auto-refresh functionality
    setupAutoRefresh() {
        // Refresh data every 30 seconds if user is active
        setInterval(() => {
            if (!document.hidden && this.commentsCache) {
                this.loadInitialData();
            }
        }, 30000);
    }

    // Enhanced search with suggestions
    setupSearchSuggestions() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        let suggestions = [];
        let currentSuggestionIndex = -1;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                this.hideSuggestions();
                return;
            }
            
            // Generate suggestions based on existing data
            if (this.commentsCache && this.commentsCache.items) {
                const uniqueClauses = [...new Set(this.commentsCache.items.map(c => c.clause).filter(Boolean))];
                const uniqueSentiments = [...new Set(this.commentsCache.items.map(c => c.sentiment).filter(Boolean))];
                const uniqueIntents = [...new Set(this.commentsCache.items.map(c => c.intent).filter(Boolean))];
                
                suggestions = [
                    ...uniqueClauses.filter(c => c.toLowerCase().includes(query)),
                    ...uniqueSentiments.filter(s => s.toLowerCase().includes(query)),
                    ...uniqueIntents.filter(i => i.toLowerCase().includes(query))
                ].slice(0, 5);
                
                this.showSuggestions(suggestions, searchInput);
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
                this.highlightSuggestion(currentSuggestionIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
                this.highlightSuggestion(currentSuggestionIndex);
            } else if (e.key === 'Enter' && currentSuggestionIndex >= 0) {
                e.preventDefault();
                searchInput.value = suggestions[currentSuggestionIndex];
                this.hideSuggestions();
                this.handleSearch();
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });
    }

    showSuggestions(suggestions, input) {
        this.hideSuggestions();
        
        if (suggestions.length === 0) return;
        
        const container = document.createElement('div');
        container.id = 'searchSuggestions';
        container.className = 'search-suggestions';
        
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                input.value = suggestion;
                this.hideSuggestions();
                this.handleSearch();
            });
            container.appendChild(item);
        });
        
        input.parentNode.appendChild(container);
    }

    highlightSuggestion(index) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        const items = container.querySelectorAll('.suggestion-item');
        items.forEach((item, i) => {
            item.classList.toggle('highlighted', i === index);
        });
    }

    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.remove();
        }
    }

    // Help modal
    showHelpModal() {
        let modal = document.getElementById('helpModal');
        if (!modal) {
            modal = this.createHelpModal();
            document.body.appendChild(modal);
        }
        modal.classList.add('show');
    }

    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content help-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-question-circle"></i> Help & Keyboard Shortcuts</h3>
                    <button class="btn-icon modal-close" id="helpModalCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="help-sections">
                        <div class="help-section">
                            <h4><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h4>
                            <div class="shortcut-list">
                                <div class="shortcut-item">
                                    <kbd>Ctrl/Cmd + K</kbd>
                                    <span>Focus search input</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Ctrl/Cmd + R</kbd>
                                    <span>Refresh data</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Ctrl/Cmd + E</kbd>
                                    <span>Export all data</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Escape</kbd>
                                    <span>Close modals</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-chart-pie"></i> Interactive Charts</h4>
                            <ul>
                                <li>Click on chart segments to filter comments</li>
                                <li>Click on legend items to toggle visibility</li>
                                <li>Hover over segments for detailed information</li>
                                <li>Use the download button to export charts as images</li>
                            </ul>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-search"></i> Search & Filter</h4>
                            <ul>
                                <li>Type in the search box to find specific comments</li>
                                <li>Use filters to narrow down by sentiment or intent</li>
                                <li>Search suggestions appear as you type</li>
                                <li>Use arrow keys to navigate suggestions</li>
                            </ul>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-download"></i> Export Features</h4>
                            <ul>
                                <li>Export all data as JSON or CSV</li>
                                <li>Export individual comments</li>
                                <li>Export charts as images</li>
                                <li>Download CSV templates for data upload</li>
                            </ul>
                        </div>
                        
                        <div class="help-section">
                            <h4><i class="fas fa-comments"></i> Comment Management</h4>
                            <ul>
                                <li>Click the eye icon to view full comment details</li>
                                <li>Export individual comments as JSON</li>
                                <li>Filter comments by clicking on chart segments</li>
                                <li>Real-time updates every 30 seconds</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="helpModalCloseBtn2">Got it!</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const closeBtn1 = modal.querySelector('#helpModalCloseBtn');
        const closeBtn2 = modal.querySelector('#helpModalCloseBtn2');
        
        closeBtn1.addEventListener('click', () => this.hideHelpModal());
        closeBtn2.addEventListener('click', () => this.hideHelpModal());
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideHelpModal();
            }
        });
        
        return modal;
    }

    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    forceLegendTextColor(chartId) {
        setTimeout(() => {
            const chartElement = document.getElementById(chartId);
            if (chartElement) {
                const legendItems = chartElement.parentElement.querySelectorAll('.chartjs-legend li');
                legendItems.forEach(item => {
                    item.style.color = '#f8fafc !important';
                    item.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8)';
                    item.style.fontWeight = '700';
                    
                    const spans = item.querySelectorAll('span');
                    spans.forEach(span => {
                        span.style.color = '#f8fafc !important';
                        span.style.fontWeight = '700';
                    });
                });
            }
        }, 200);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new EConsultationDashboard();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.dashboard) {
        window.dashboard.loadInitialData();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.dashboard && window.dashboard.charts) {
        Object.values(window.dashboard.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
});
