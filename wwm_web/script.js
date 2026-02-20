document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const resultsGrid = document.getElementById('results-grid');
    const searchStats = document.getElementById('search-stats');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Sidebar Elements
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // State
    let allData = [];
    let isDarkMode = localStorage.getItem('theme') === 'dark' || 
                     (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const RENDER_LIMIT = 100; // Max items to render to keep DOM light

    // Initialize Theme
    updateTheme(isDarkMode);

    // Fetch Data
    fetchData();

    // Event Listeners
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        handleSearch();
    });
    
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateTheme(isDarkMode);
    });

    // Sidebar Event Listeners
    menuToggle.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // Functions

    function updateTheme(dark) {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    // Toggle Sidebar Function
    function toggleSidebar() {
        const isActive = sidebar.classList.contains('active');
        if (isActive) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = ''; // 恢復網頁滾動
        } else {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // 禁止底層網頁滾動
        }
    }

    async function fetchData() {
        try {
            loadingIndicator.classList.remove('hidden');
            
            // 直接從全域變數讀取
            if (window.QA_DATA) {
                allData = window.QA_DATA;
            } else {
                throw new Error('DATA_NOT_FOUND');
            }
            
            loadingIndicator.classList.add('hidden');
            renderResults(allData);
            updateStats(allData.length, allData.length);
            
        } catch (error) {
            console.error('Error loading data:', error);
            loadingIndicator.classList.add('hidden');
            
            let errorMsg = '無法載入題庫，請檢查 data.js 檔案是否存在。';
            resultsGrid.innerHTML = `<div class="error-wrapper">${errorMsg}</div>`;
        }
    }

    function handleSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        // Show/Hide clear button
        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }

        if (!query) {
            renderResults(allData);
            updateStats(allData.length, allData.length);
            return;
        }

        // Filter logic
        // Check if question OR answer includes the query
        const filtered = allData.filter(item => {
            const q = (item.question || '').toLowerCase();
            const a = (item.answer || '').toLowerCase();
            return q.includes(query) || a.includes(query);
        });

        renderResults(filtered);
        updateStats(filtered.length, allData.length);
    }

    function renderResults(data) {
        resultsGrid.innerHTML = '';

        if (data.length === 0) {
            noResults.classList.remove('hidden');
            return;
        } else {
            noResults.classList.add('hidden');
        }

        const itemsToRender = data.slice(0, RENDER_LIMIT);
        const fragment = document.createDocumentFragment();
        
        itemsToRender.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'card';
            if (index < 20) {
                card.style.animation = `fadeInUp 0.3s ease-out ${index * 0.03}s backwards`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-question">${item.question}</div>
                </div>
                <div class="card-body">
                    <div class="card-answer-group">
                        <span class="card-label">答案</span>
                        <div class="card-answer">${item.answer}</div>
                    </div>
                    <button class="copy-btn" title="複製答案" data-answer="${item.answer}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor
