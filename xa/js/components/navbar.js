/**
 * 《劍嘯笑傲》導覽列組件 (獨立模組)
 */

window.NavbarComponent = {
    /**
     * 導覽列 HTML 模板
     */
    template: `
        <div class="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-10 py-4 max-w-screen-2xl mx-auto bg-surface-container-low transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(30,27,18,0.06)]" id="navbar-container">
            <div class="text-3xl font-bold text-on-surface font-headline tracking-widest shrink-0 cursor-pointer" onclick="window.location.href='index.html'">
                劍嘯笑傲
            </div>
            
            <!-- Desktop Menu (Expanded) -->
            <div class="hidden xl:flex gap-6 items-center font-label font-medium text-[16px]">
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="index.html">首頁</a>
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="gemes.html">遊戲新聞</a>
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="about.html">遊戲介紹</a>
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="school.html">門派介紹</a>
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="hotday.html">活動專區</a>
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="community.html">社群中心</a>
                <a class="nav-item text-on-surface-variant pb-1 hover:text-primary transition-colors duration-300" href="paypa.html">儲值中心</a>
            </div>

            <!-- Action Area -->
            <div class="hidden md:flex items-center gap-6 shrink-0">
                <div class="flex items-center gap-4 mr-2 border-r border-outline-variant/30 pr-6">
                    <a class="nav-auth-item text-on-surface-variant hover:text-primary transition-colors font-label font-medium text-sm" href="login.html">登入</a>
                    <a class="nav-auth-item text-on-surface-variant hover:text-primary transition-colors font-label font-medium text-sm" href="register.html">註冊</a>
                </div>
                <a id="nav-download-btn" href="down.html" class="bg-primary text-on-primary font-label font-medium px-8 py-3 btn-brushstroke hover:bg-primary-container transition-all shadow-[0_8px_20px_-10px_rgba(57,0,3,0.4)] block">遊戲下載</a>
            </div>

            <!-- Mobile Toggle -->
            <button id="mobile-menu-toggle" class="xl:hidden text-on-surface p-2">
                <span class="material-symbols-outlined text-3xl">menu</span>
            </button>

            <!-- Mobile Dropdown -->
            <div id="mobile-menu" class="fixed inset-0 bg-surface-container-low z-[60] flex flex-col items-center justify-center gap-6 translate-x-full transition-transform duration-300 xl:hidden overflow-y-auto pt-20">
                <button id="mobile-menu-close" class="absolute top-6 right-6 text-on-surface">
                    <span class="material-symbols-outlined text-4xl">close</span>
                </button>
                <a class="text-2xl font-headline" href="index.html">首頁</a>
                <a class="text-2xl font-headline" href="gemes.html">遊戲新聞</a>
                <a class="text-2xl font-headline" href="about.html">遊戲介紹</a>
                <a class="text-2xl font-headline" href="school.html">門派介紹</a>
                <a class="text-2xl font-headline" href="hotday.html">活動專區</a>
                <a class="text-2xl font-headline" href="community.html">社群中心</a>
                <a class="text-2xl font-headline" href="paypa.html">儲值中心</a>
                <div class="h-px w-full bg-outline-variant/20 my-2"></div>
                <div class="flex gap-8">
                    <a class="text-lg font-headline text-primary" href="login.html">登入</a>
                    <a class="text-lg font-headline text-primary" href="register.html">註冊</a>
                </div>
                <a class="bg-primary text-on-primary font-headline text-xl px-12 py-4 btn-brushstroke mt-2" href="down.html">立即下載</a>
            </div>
        </div>
    `,

    /**
     * 執行注入
     */
    inject: function() {
        const placeholder = document.getElementById('main-nav');
        if (!placeholder) return;
        
        placeholder.innerHTML = this.template;
        this.initLogic();
    },

    /**
     * 組件內部邏輯 (高亮, 滾動切換等)
     */
    initLogic: function() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-item, #mobile-menu a, .nav-auth-item');
        
        links.forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.remove('text-on-surface-variant');
                link.classList.add('text-primary', 'font-bold');
                if (link.classList.contains('nav-item')) {
                    link.classList.add('border-b-2', 'border-primary');
                }
            }
        });

        // 下載按鈕高亮
        const downloadBtn = document.getElementById('nav-download-btn');
        if (downloadBtn && path === 'down.html') {
            downloadBtn.classList.add('bg-primary-container', 'ring-2', 'ring-primary', 'ring-offset-2');
        }

        // 滾動監聽 (隨滾動變透明度或高度)
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar-container');
            if (window.scrollY > 50) {
                nav.classList.add('py-2', 'bg-opacity-90', 'backdrop-blur-md');
                nav.classList.remove('py-4');
            } else {
                nav.classList.add('py-4');
                nav.classList.remove('py-2', 'bg-opacity-90', 'backdrop-blur-md');
            }
        });
    }
};
