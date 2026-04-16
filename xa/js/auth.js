/**
 * 《劍嘯笑傲》會員系統邏輯模組
 */

window.AuthSystem = {
    /**
     * 初始化登入頁面邏輯
     */
    initLogin: function() {
        const loginForm = document.getElementById('login-form');
        const accountInput = document.getElementById('account');
        const rememberCheckbox = document.getElementById('remember-me');

        // 載入記住的帳號
        const savedAccount = localStorage.getItem('v_account');
        if (savedAccount && accountInput) {
            accountInput.value = savedAccount;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // 處理記住帳號
                if (rememberCheckbox.checked) {
                    localStorage.setItem('v_account', accountInput.value);
                } else {
                    localStorage.removeItem('v_account');
                }
                // 設置當前登入狀態 (Session)
                sessionStorage.setItem('current_user', accountInput.value);
                
                alert('登入成功！正在前往江湖...');
                window.location.href = 'index.html';
            });
        }
        
        this.generateCaptcha('login-captcha');
    },

    /**
     * 初始化註冊頁面邏輯
     */
    initRegister: function() {
        const registerForm = document.getElementById('register-form');
        const accountInput = document.getElementById('reg-account');
        const passwordInput = document.getElementById('reg-password');
        const confirmInput = document.getElementById('reg-confirm');
        const strengthBar = document.getElementById('strength-bar');
        const checkBtn = document.getElementById('check-availability');

        // 強制小寫功能
        if (accountInput) {
            accountInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
            });
        }

        // 密碼強度監控
        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', (e) => {
                const strength = this.calculateStrength(e.target.value);
                this.updateStrengthUI(strength, strengthBar);
            });
        }

        // 帳號可用性檢測 (模擬)
        if (checkBtn && accountInput) {
            checkBtn.addEventListener('click', () => {
                if (!accountInput.value) return alert('請先輸入帳號');
                checkBtn.innerHTML = '<span class="animate-spin material-symbols-outlined text-sm">refresh</span> 檢測中';
                setTimeout(() => {
                    checkBtn.innerHTML = '檢測可用性';
                    alert(`帳號 "${accountInput.value}" 可以使用！`);
                }, 1000);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (passwordInput.value !== confirmInput.value) {
                    return alert('兩次输入的密碼不一致！');
                }
                alert('註冊成功！歡迎加入《劍嘯笑傲》');
                window.location.href = 'login.html';
            });
        }

        this.generateCaptcha('reg-captcha');
    },

    /**
     * 計算密碼強度 (1-4)
     */
    calculateStrength: function(pwd) {
        let score = 0;
        if (!pwd) return 0;
        if (pwd.length >= 6) score++;
        if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;
        if (pwd.length >= 12) score++;
        return score;
    },

    /**
     * 更新強度條 UI
     */
    updateStrengthUI: function(score, bar) {
        const colors = ['#c4c7c7', '#e74c3c', '#f1c40f', '#2ecc71', '#3498db'];
        const widths = ['0%', '25%', '50%', '75%', '100%'];
        bar.style.width = widths[score];
        bar.style.backgroundColor = colors[score];
        bar.style.color = colors[score]; // 用於 box-shadow
    },

    /**
     * 產生模擬驗證碼
     */
    generateCaptcha: function(id) {
        const box = document.getElementById(id);
        if (!box) return;
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        box.innerText = code;
        box.style.fontFamily = "'Zhi Mang Xing', cursive";
        box.style.fontSize = '1.5rem';
        box.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
    }
};
