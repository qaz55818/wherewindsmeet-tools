/**
 * 《劍嘯笑傲》全站主控入口
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 初始化全站佈局 (Navbar, Footer, Effects)
    if (typeof window.initLayout === 'function') {
        window.initLayout();
    }
    
    // 2. 元素登場動畫效果
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, { threshold: 0.1 });

    // 自動偵測並套用動畫
    const animatedElements = document.querySelectorAll('section, article, .hero-content');
    animatedElements.forEach(el => {
        el.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
        observer.observe(el);
    });

    // 3. 通用音效或小特技 (預留)
});
