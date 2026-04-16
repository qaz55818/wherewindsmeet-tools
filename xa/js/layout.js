/**
 * 《劍嘯笑傲》佈局管理器
 */

window.initLayout = () => {
    // 注入導覽列 (調用獨立模組)
    if (window.NavbarComponent) {
        window.NavbarComponent.inject();
    }

    // 注入頁尾
    injectFooter();
    
    // 注入特效
    injectPaperTexture();
    
    // 處理手持設備選單
    handleMobileMenu();
};

const injectFooter = () => {
    const placeholder = document.getElementById('main-footer');
    if (!placeholder) return;

    placeholder.className = "w-full flex flex-col items-center justify-center gap-6 px-4 py-12 bg-surface-container-highest border-t-0 mt-32";
    placeholder.innerHTML = `
        <div class="flex flex-wrap justify-center gap-6 font-body text-sm tracking-tighter text-on-surface-variant">
            <a class="hover:text-on-surface transition-colors" href="#">服務條款</a>
            <a class="hover:text-on-surface transition-colors" href="#">隱私政策</a>
            <a class="hover:text-on-surface transition-colors" href="#">聯繫我們</a>
            <a class="hover:text-on-surface transition-colors" href="#">官方論壇</a>
        </div>
        <p class="font-body text-sm tracking-tighter text-on-surface-variant">
            © 2024 劍嘯笑傲 Martial Arts Lore. 保留所有權利。
        </p>
    `;
};

const injectPaperTexture = () => {
    const texture = document.createElement('div');
    texture.className = "fixed inset-0 z-[100] paper-texture mix-blend-multiply opacity-50 pointer-events-none";
    document.body.prepend(texture);
};

const handleMobileMenu = () => {
    // 邏輯現在轉移到 NavbarComponent，此處轉為全域管理
    const toggle = document.getElementById('mobile-menu-toggle');
    const close = document.getElementById('mobile-menu-close');
    const menu = document.getElementById('mobile-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => menu.classList.remove('translate-x-full'));
    }
    if (close && menu) {
        close.addEventListener('click', () => menu.classList.add('translate-x-full'));
    }
};
