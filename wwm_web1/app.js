import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==========================================
// Firebase 專案設定
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBb8FCyP4bT8zkNXZymqkhXL7CU8QaDp_U",
    authDomain: "wwm-web-142a4.firebaseapp.com",
    projectId: "wwm-web-142a4",
    storageBucket: "wwm-web-142a4.firebasestorage.app",
    messagingSenderId: "902808232658",
    appId: "1:902808232658:web:a16b7f0c812fe4254cc30b"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 常數設定
const COLLECTION_NAME = 'leave_records';
const CONFIG_COLLECTION = 'system_config';
const CONFIG_DOC = 'settings';

// 系統狀態
let currentIp = "Unknown";
let isAdmin = false;
let systemConfig = { cdTimeMinutes: 0, bannedIps: [] };
let allRecords = [];

// DOM 元素
const form = document.getElementById('leaveForm');
const reasonSelect = document.getElementById('reasonSelect');
const reasonOther = document.getElementById('reasonOther');
const submitBtn = document.getElementById('submitBtn');
const recordsContainer = document.getElementById('recordsContainer');
const emptyState = document.getElementById('emptyState');
const toastEl = document.getElementById('toastMessage');

// 管理員 DOM
const openAdminBtn = document.getElementById('openAdminBtn');
const adminAuthModal = document.getElementById('adminAuthModal');
const adminPwdInput = document.getElementById('adminPwdInput');
const verifyAdminBtn = document.getElementById('verifyAdminBtn');
const cancelAdminBtn = document.getElementById('cancelAdminBtn');
const adminPanel = document.getElementById('adminPanel');
const cdTimeInput = document.getElementById('cdTimeInput');
const saveCdBtn = document.getElementById('saveCdBtn');
const banIpInput = document.getElementById('banIpInput');
const banIpBtn = document.getElementById('banIpBtn');
const bannedIpsList = document.getElementById('bannedIpsList');

// 獲取使用者 IP
async function fetchIp() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        currentIp = data.ip;
    } catch (error) {
        console.warn("無法取得 IP 資訊", error);
        currentIp = "Unknown_" + Math.random().toString(36).substr(2, 9);
    }
}

// 提示訊息功能
function showToast(message, isError = false) {
    toastEl.textContent = message;
    toastEl.style.backgroundColor = isError ? '#5a4a3f' : '#8c2a2a';
    toastEl.classList.remove('show');
    void toastEl.offsetWidth; 
    toastEl.classList.add('show');
    setTimeout(() => { toastEl.classList.remove('show'); }, 3000);
}

// 監聽選單變更，控制「其他」文字框顯示
reasonSelect.addEventListener('change', (e) => {
    if (e.target.value === '其他') {
        reasonOther.classList.remove('hidden');
        reasonOther.required = true;
    } else {
        reasonOther.classList.add('hidden');
        reasonOther.required = false;
        reasonOther.value = ''; 
    }
});

// 確保設定檔存在並載入系統設定 (CD、封鎖清單)
async function initSystemConfig() {
    const configRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
    const docSnap = await getDoc(configRef);
    
    if (!docSnap.exists()) {
        await setDoc(configRef, { cdTimeMinutes: 0, bannedIps: [] });
    }

    onSnapshot(configRef, (snapshot) => {
        if(snapshot.exists()) {
            systemConfig = snapshot.data();
            if (isAdmin) {
                cdTimeInput.value = systemConfig.cdTimeMinutes || 0;
                renderBannedIps();
            }
        }
    });
}

// 載入與即時監聽請假資料
function loadData() {
    const q = query(collection(db, COLLECTION_NAME), orderBy('submitTime', 'desc'));

    onSnapshot(q, (snapshot) => {
        allRecords = [];
        snapshot.forEach((doc) => {
            allRecords.push({ id: doc.id, ...doc.data() });
        });
        renderRecords(allRecords);
    }, (error) => {
        console.error("讀取失敗:", error);
        showToast("無法連接卷宗庫，請檢查權限", true);
    });
}

// 渲染封鎖 IP 清單 (僅管理員)
function renderBannedIps() {
    if (!systemConfig.bannedIps || systemConfig.bannedIps.length === 0) {
        bannedIpsList.innerHTML = '<span class="italic text-[#8e7f70]">無</span>';
        return;
    }
    
    bannedIpsList.innerHTML = '';
    systemConfig.bannedIps.forEach(ip => {
        const span = document.createElement('span');
        span.className = 'inline-flex items-center bg-[#8c2a2a] text-[#f2e9de] px-2 py-0.5 rounded mr-2 mb-2 text-xs';
        span.innerHTML = `${escapeHTML(ip)} <button data-ip="${escapeHTML(ip)}" class="ml-1 text-[#eaddcf] hover:text-white unban-btn">×</button>`;
        bannedIpsList.appendChild(span);
    });

    document.querySelectorAll('.unban-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const ipToRemove = e.target.getAttribute('data-ip');
            const newBannedList = systemConfig.bannedIps.filter(ip => ip !== ipToRemove);
            await updateDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC), { bannedIps: newBannedList });
            showToast(`已解除封鎖 ${ipToRemove}`);
        });
    });
}

// 渲染紀錄列表
window.deleteRecord = async function(id) {
    if(confirm("確定要銷毀這份請假卷宗嗎？此操作無法復原。")) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            showToast("卷宗已銷毀");
        } catch (e) {
            showToast("銷毀失敗，請檢查權限", true);
        }
    }
};

function renderRecords(records) {
    if (records.length === 0) {
        recordsContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    const leaveCounts = {};
    records.forEach(r => {
        const name = (r.gameId || '').trim();
        if (name) {
            leaveCounts[name] = (leaveCounts[name] || 0) + 1;
        }
    });

    emptyState.classList.add('hidden');
    recordsContainer.classList.remove('hidden');
    recordsContainer.innerHTML = '';

    records.forEach(record => {
        const submitDateObj = new Date(record.submitTime);
        const dateStr = submitDateObj.toLocaleDateString('zh-TW') + ' ' + 
                        submitDateObj.getHours().toString().padStart(2, '0') + ':' + 
                        submitDateObj.getMinutes().toString().padStart(2, '0');

        let weekdayStr = "";
        if (record.leaveDate) {
            const dateParts = record.leaveDate.split('-');
            if (dateParts.length === 3) {
                const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                const days = ['日', '一', '二', '三', '四', '五', '六'];
                weekdayStr = ` (星期${days[localDate.getDay()]})`;
            }
        }

        const playerName = (record.gameId || '').trim();
        const totalLeaves = leaveCounts[playerName] || 1;
        
        const safeGameId = escapeHTML(record.gameId);
        const safeReason = escapeHTML(record.reason).replace(/\n/g, '<br>');
        const safeIp = escapeHTML(record.ipAddress || '無紀錄');

        const adminHtml = isAdmin ? `
            <div class="mt-3 pt-2 border-t border-[#a89a8c]/30 flex justify-between items-center">
                <span class="text-xs text-[#8c2a2a] font-bold">來源 IP: ${safeIp}</span>
                <button onclick="deleteRecord('${record.id}')" class="text-xs bg-[#8c2a2a] text-white px-3 py-1 rounded hover:bg-[#a33535] transition">撤回/刪除</button>
            </div>
        ` : '';

        const card = document.createElement('div');
        card.className = 'bg-white/40 p-4 border-l-4 border-[#8c2a2a] shadow-sm mb-3 relative';
        
        card.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <span class="font-bold text-lg text-[#8c2a2a] flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                    ${safeGameId}
                    <span class="text-xs bg-[#eaddcf] text-[#5a4a3f] px-2 py-0.5 rounded ml-2 font-normal border border-[#a89a8c]">累計請假 ${totalLeaves} 次</span>
                </span>
                <span class="text-xs text-[#8e7f70] mt-1 sm:mt-0">呈交於: ${dateStr}</span>
            </div>
            <div class="text-sm mb-2 text-[#5a4a3f] border-b border-[#a89a8c]/30 pb-2">
                <span class="font-bold">請假日期：</span> ${record.leaveDate}${weekdayStr}
            </div>
            <div class="text-sm text-[#3e362e] bg-white/60 p-3 rounded leading-relaxed">
                <span class="font-bold text-[#5a4a3f]">事由：</span><br/>
                ${safeReason}
            </div>
            ${adminHtml}
        `;
        recordsContainer.appendChild(card);
    });
}

// 處理表單提交
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (systemConfig.bannedIps && systemConfig.bannedIps.includes(currentIp)) {
        showToast('您已被禁止呈交請假帖，請聯繫管理員。', true);
        return;
    }

    if (systemConfig.cdTimeMinutes > 0 && currentIp !== "Unknown") {
        const myLastRecord = allRecords.find(r => r.ipAddress === currentIp);
        if (myLastRecord) {
            const diffMinutes = (Date.now() - myLastRecord.submitTime) / 60000;
            if (diffMinutes < systemConfig.cdTimeMinutes) {
                const remain = Math.ceil(systemConfig.cdTimeMinutes - diffMinutes);
                showToast(`請假冷卻中，請於 ${remain} 分鐘後再試。`, true);
                return;
            }
        }
    }

    const gameId = document.getElementById('gameId').value.trim();
    const leaveDate = document.getElementById('leaveDate').value;
    
    let finalReason = reasonSelect.value;
    if (finalReason === '其他') {
        finalReason = reasonOther.value.trim();
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="animate-pulse">呈交中...</span>';

    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            gameId: gameId,
            leaveDate: leaveDate,
            reason: finalReason,
            submitTime: Date.now(),
            ipAddress: currentIp
        });

        showToast('請假帖已飛鴿傳書呈交！');
        form.reset();
        reasonOther.classList.add('hidden');
        reasonOther.required = false;
        
    } catch (error) {
        console.error("寫入失敗:", error);
        showToast('呈交失敗，請檢查資料庫權限設定', true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '呈交請假帖';
    }
});

// 管理員系統綁定
openAdminBtn.addEventListener('click', () => {
    if (isAdmin) {
        isAdmin = false;
        adminPanel.classList.add('hidden');
        openAdminBtn.innerHTML = "⚙️ 管理模式";
        showToast("已退出管理模式");
        renderRecords(allRecords);
    } else {
        adminAuthModal.classList.remove('hidden');
        adminPwdInput.value = '';
        adminPwdInput.focus();
    }
});

cancelAdminBtn.addEventListener('click', () => {
    adminAuthModal.classList.add('hidden');
});

// 連線至 Firestore 比對密碼
verifyAdminBtn.addEventListener('click', async () => {
    const inputPwd = adminPwdInput.value.trim();
    if (!inputPwd) return;

    verifyAdminBtn.disabled = true;
    verifyAdminBtn.innerHTML = "驗證中...";

    try {
        const adminAuthRef = doc(db, CONFIG_COLLECTION, 'admin_auth');
        const adminSnap = await getDoc(adminAuthRef);
        
        let dbPassword = "admin888"; 
        
        if (adminSnap.exists()) {
            dbPassword = adminSnap.data().password;
        } else {
            await setDoc(adminAuthRef, { password: "admin888" });
        }

        if (inputPwd === dbPassword) {
            isAdmin = true;
            adminAuthModal.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            openAdminBtn.innerHTML = "🔒 退出管理";
            
            cdTimeInput.value = systemConfig.cdTimeMinutes || 0;
            renderBannedIps();
            renderRecords(allRecords); 
            
            showToast("身分驗證成功，管理模式已開啟");
        } else {
            showToast("密碼錯誤，請重新輸入", true);
        }
    } catch (error) {
        console.error("密碼驗證異常:", error);
        showToast("驗證異常，請確認資料庫連線或規則", true);
    } finally {
        verifyAdminBtn.disabled = false;
        verifyAdminBtn.innerHTML = "驗證";
    }
});

// 儲存 CD 時間
saveCdBtn.addEventListener('click', async () => {
    const newCd = parseInt(cdTimeInput.value) || 0;
    try {
        await updateDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC), { cdTimeMinutes: newCd });
        showToast("冷卻時間更新成功");
    } catch(e) { showToast("更新失敗", true); }
});

// 封鎖 IP
banIpBtn.addEventListener('click', async () => {
    const ipToBan = banIpInput.value.trim();
    if (!ipToBan) return;
    
    const currentBanned = systemConfig.bannedIps || [];
    if (currentBanned.includes(ipToBan)) {
        showToast("此 IP 已在封鎖清單中", true);
        return;
    }

    try {
        currentBanned.push(ipToBan);
        await updateDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC), { bannedIps: currentBanned });
        banIpInput.value = '';
        showToast(`已封鎖 IP: ${ipToBan}`);
    } catch(e) { showToast("封鎖失敗", true); }
});

// 簡單的 HTML 防護
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 系統啟動順序
fetchIp().then(() => {
    initSystemConfig();
    loadData();
});