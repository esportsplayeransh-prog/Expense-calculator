// ==========================================
// 1. GLOBAL VARIABLES & INIT
// ==========================================
let transactions = [];
let myChart = null;
let isCaptchaVerified = false;

window.onload = function () {
    // Check agar Dashboard page par hain
    if (document.getElementById('total-balance')) {
        updateProfile();
        loadDashboard();
    }
};

// Check for logged in user
const user = JSON.parse(localStorage.getItem('expenseUser'));

// Agar user landing page par hai aur pehle se login hai, toh dashboard bhej do
if (window.location.pathname.includes('landing.html') && user) {
    window.location.href = 'dashboard.html';
}

// Agar user dashboard par hai aur login nahi hai, toh landing bhej do
if (window.location.pathname.includes('dashboard.html') && !user) {
    window.location.href = 'landing.html';
}

function revealOnScroll() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100; // Thoda kam kiya taaki jaldi dikhe

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// Scroll hone par chalega
window.addEventListener("scroll", revealOnScroll);

// Pehli baar load hone par bhi chalna chahiye
window.addEventListener("DOMContentLoaded", revealOnScroll);

window.addEventListener("scroll", revealOnScroll);

// ==========================================
// 2. TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(msg, type) {
    let box = document.getElementById('toast-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toast-box';
        document.body.appendChild(box);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;
    toast.style.borderLeftColor = type === 'success' ? '#2ecc71' : '#e74c3c';

    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==========================================
// 3. AUTHENTICATION LOGIC (Login/Signup)
// ==========================================

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const openEyePath = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    const closedEyePath = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22"></path><path d="M12 5a7 7 0 0 1 4.71 1.71"></path>';

    if (input.type === "password") {
        input.type = "text";
        icon.innerHTML = closedEyePath;
    } else {
        input.type = "password";
        icon.innerHTML = openEyePath;
    }
}

function checkStrength() {
    const pass = document.getElementById('signup-password').value;
    const bar = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');

    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;

    if (pass.length === 0) {
        bar.style.width = '0%';
        text.innerText = "Password Strength";
    } else if (pass.length < 8) {
        bar.style.width = '30%';
        bar.style.backgroundColor = '#ff4d4d'; // Red
        text.innerText = "Too Short";
        text.style.color = '#ff4d4d';
    } else if (strength < 3) {
        bar.style.width = '60%';
        bar.style.backgroundColor = '#f1c40f'; // Yellow/Orange
        text.innerText = "Medium";
        text.style.color = '#f1c40f';
    } else {
        bar.style.width = '100%';
        bar.style.backgroundColor = '#2ecc71'; // Green
        text.innerText = "Strong";
        text.style.color = '#2ecc71';
    }
}

function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    if (!name || !email || !pass || !confirmPass) return showToast("Please fill all fields!", "error");
    if (pass !== confirmPass) return showToast("Passwords do not match!", "error");

    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    if (allUsers.some(u => u.email === email)) return showToast("Email registered!", "error");

    allUsers.push({ name, email, password: pass });
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    showToast("Account Created!", "success");
    setTimeout(() => window.location.href = "login.html", 2000);
}

function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    if (!email || !pass) return showToast("Enter details", "error");
    if (!isCaptchaVerified) return showToast("Verify Captcha!", "error");

    const allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    const user = allUsers.find(u => u.email === email && u.password === pass);

    if (user) {
        localStorage.setItem('expenseUser', JSON.stringify(user));
        showToast("Login Successful!", "success");
        setTimeout(() => window.location.href = "dashboard.html", 1500);
    } else {
        showToast("Invalid Credentials!", "error");
    }
}
function verifyCaptcha() {
    if (isCaptchaVerified) return;

    const box = document.getElementById('captchaBox');
    const spinner = document.getElementById('captchaSpinner');
    const check = document.getElementById('captchaCheck');

    // 1. Spinner dikhao
    spinner.style.display = 'block';
    box.style.pointerEvents = 'none'; // Click disable karo

    setTimeout(() => {
        // 2. Spinner hatao aur Checkmark dikhao
        spinner.style.display = 'none';
        check.style.display = 'flex'; // 'flex' ya 'block' check karo
        check.style.opacity = '1';

        box.style.background = '#f0f0f0'; // Thoda grey background
        isCaptchaVerified = true;
        showToast("Verification Success!", "success");
    }, 1200);
}

// ==========================================
// 4. DASHBOARD & TRANSACTIONS
// ==========================================

function loadDashboard() {
    const stored = localStorage.getItem('myExpenses');
    transactions = stored ? JSON.parse(stored) : [];
    displayRecentTransactions();
    updateValues();
    renderChart();
}
function displayRecentTransactions() {
    const allTransactions = JSON.parse(localStorage.getItem('myExpenses')) || [];
    const transactionList = document.getElementById('transaction-list');

    if (!transactionList) return;

    allTransactions.sort((a, b) => b.id - a.id);
    const recentOnes = allTransactions.slice(0, 5);

    transactionList.innerHTML = recentOnes.length === 0 ? "<p style='text-align:center;color:#ccc;'>No data.</p>" : "";

    recentOnes.forEach(t => {
        const li = document.createElement('li');
        // 👇 Ye line add karna zaroori hai layout ke liye
        li.className = `transaction-item ${t.type === 'income' ? 'plus' : 'minus'}`;

        li.innerHTML = `
            <div class="t-info">
                <span class="t-title">${t.title}</span><br>
                <small style="color:#aaa">${new Date(t.id).toLocaleDateString()}</small>
            </div>
            <span class="t-amount">
                ${t.type === 'income' ? '+' : '-'} ₹${t.amount}
            </span>
        `;
        transactionList.appendChild(li);
    });
}
function updateProfile() {
    const user = JSON.parse(localStorage.getItem('expenseUser'));
    const savedPic = localStorage.getItem('profilePic'); // 👈 Photo fetch karo

    if (user) {
        document.getElementById('user-name').innerText = user.name.split(" ")[0];
        document.getElementById('dropdown-name').innerText = user.name;

        const profileInitial = document.getElementById('profile-initial');

        // Agar photo pehle se save hai toh photo dikhao, warna initial dikhao
        if (savedPic) {
            profileInitial.innerHTML = `<img src="${savedPic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else {
            profileInitial.innerText = user.name.charAt(0).toUpperCase();
        }
    }
}

function renderTransactions() {
    const list = document.getElementById('transaction-list');
    if (!list) return;
    list.innerHTML = transactions.length === 0 ? "<p style='text-align:center;color:#ccc;'>No data.</p>" : "";

    transactions.slice().reverse().forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type === 'income' ? 'plus' : 'minus'}`;
        li.innerHTML = `<span class="t-title">${t.title}</span><div class="right-side"><span class="t-amount">${t.type === 'income' ? '+' : '-'} ₹${t.amount}</span><span class="delete-btn" onclick="deleteTrans(${t.id})">✖</span></div>`;
        list.appendChild(li);
    });
}

const form = document.getElementById('expenseForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('t-title').value;
        const amount = parseFloat(document.getElementById('t-amount').value);
        const type = document.getElementById('t-type').value;
        transactions.push({ id: Date.now(), title, amount, type });
        localStorage.setItem('myExpenses', JSON.stringify(transactions));
        loadDashboard();
        closeModal();
        form.reset();
    });
}

function deleteTrans(id) {
    if (confirm('Delete this?')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('myExpenses', JSON.stringify(transactions));
        loadDashboard();
    }
}

function updateValues() {
    if (!document.getElementById('total-balance')) return;
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const expTrans = transactions.filter(t => t.type === 'expense');
    const totalExp = expTrans.reduce((acc, t) => acc + t.amount, 0);
    const avg = expTrans.length ? (totalExp / expTrans.length).toFixed(0) : 0;

    let topCat = "None";
    if (expTrans.length > 0) {
        const map = {};
        expTrans.forEach(t => map[t.title] = (map[t.title] || 0) + t.amount);
        topCat = Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b);
    }
    document.getElementById('total-balance').innerText = total;
    document.getElementById('average-spend').innerText = avg;
    document.getElementById('top-category').innerText = topCat;
}

function renderChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx || transactions.length === 0) return;
    const expTrans = transactions.filter(t => t.type === 'expense');
    const map = {};
    expTrans.forEach(t => map[t.title] = (map[t.title] || 0) + t.amount);
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(map), datasets: [{ data: Object.values(map), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }
    });
}

// ==========================================
// 5. NAVIGATION & SETTINGS
// ==========================================

function showSection(sectionId) {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('settings-section').style.display = 'none';
    document.getElementById('history-section').style.display = 'none';
    document.getElementById(sectionId + '-section').style.display = 'block';

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (sectionId === 'dashboard') buttons[0].classList.add('active');
    if (sectionId === 'history') { buttons[1].classList.add('active'); filterHistory('all'); }
    if (sectionId === 'settings') { buttons[2].classList.add('active'); loadSettingsData(); }
}

function filterHistory(range) {
    const historyList = document.getElementById('history-list');
    const filteredTotalDisplay = document.getElementById('filtered-total');
    const allTransactions = JSON.parse(localStorage.getItem('myExpenses')) || [];
    let filtered = [];
    const now = new Date();

    if (range === 'all') filtered = allTransactions;
    else if (range === 'week') filtered = allTransactions.filter(t => (now - new Date(t.id)) < 7 * 24 * 60 * 60 * 1000);
    else if (range === 'month') filtered = allTransactions.filter(t => (now - new Date(t.id)) < 30 * 24 * 60 * 60 * 1000);

    historyList.innerHTML = "";
    let total = 0;
    filtered.slice().reverse().forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type === 'income' ? 'plus' : 'minus'}`;
        li.innerHTML = `<div><span class="t-title">${t.title}</span><br><small style="color:#aaa">${new Date(t.id).toLocaleDateString()}</small></div><span class="t-amount">${t.type === 'income' ? '+' : '-'} ₹${t.amount}</span>`;
        historyList.appendChild(li);
        total += (t.type === 'income' ? t.amount : -t.amount);
    });
    filteredTotalDisplay.innerText = `₹ ${total.toFixed(2)}`;
}

function loadSettingsData() {
    const user = JSON.parse(localStorage.getItem('expenseUser'));
    if (user) {
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
    }
}

function saveProfile() {
    const newName = document.getElementById('edit-name').value;
    if (!newName) return showToast("Name empty!", "error");
    let user = JSON.parse(localStorage.getItem('expenseUser'));
    user.name = newName;
    localStorage.setItem('expenseUser', JSON.stringify(user));
    updateProfile();
    showToast("Profile Updated!", "success");
}

function resetAllData() {
    if (confirm("Reset everything?")) {
        localStorage.removeItem('myExpenses');
        transactions = [];
        loadDashboard();
        showToast("Reset Done!", "error");
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('close');
    document.querySelector('.main-content').classList.toggle('expand');
}

// Helper Helpers
function toggleMenu() { document.getElementById('subMenu').classList.toggle('open-menu'); }
function logout() { window.location.href = 'login.html'; }
function openModal() { document.getElementById('expense-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('expense-modal').style.display = 'none'; }

// --- Theme Toggle Logic ---
function toggleTheme() {
    const isDark = document.getElementById('theme-toggle').checked;
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// Load Theme on Startup
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').checked = true;
        }
    }
});

// --- Permanently Delete Account ---
function deleteAccount() {
    if (confirm("WARNING: This will delete your user account and all data. Continue?")) {
        localStorage.clear(); // Sab saaf
        showToast("Account Deleted", "error");
        setTimeout(() => window.location.href = 'signup.html', 1500);
    }
}
function previewFile() {
    const preview = document.getElementById('preview-img');
    const file = document.getElementById('profile-upload').files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result; // Ye image ko Base64 string bana dega
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

function saveProfilePic() {
    const imgData = document.getElementById('preview-img').src;
    localStorage.setItem('profilePic', imgData);

    // Dashboard ki photo bhi update karo
    if (document.getElementById('profile-initial')) {
        document.getElementById('profile-initial').innerHTML = `<img src="${imgData}" style="width:100%; height:100%; border-radius:50%;">`;
    }
    showToast("Profile Picture Updated!", "success");
}

// ==========================================
// HISTORY & SEARCH LOGIC
// ==========================================
let currentTab = 'all'; // Default tab

// 1. Tab Switcher
function setTab(tab) {
    currentTab = tab;

    // UI Update: Active class change karo
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Filter Apply karo
    applyFilters();
}

// 2. Master Filter Function (Search + Date)
function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const historyList = document.getElementById('history-list');
    const totalDisplay = document.getElementById('filtered-total');

    // Data fetch karo
    const allTransactions = JSON.parse(localStorage.getItem('myExpenses')) || [];
    const now = new Date();

    // --- STEP 1: DATE FILTER (Java Logic: If-Else) ---
    let filtered = allTransactions.filter(t => {
        const tDate = new Date(t.id);
        const diffTime = Math.abs(now - tDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (currentTab === 'week') return diffDays <= 7;
        if (currentTab === 'month') return diffDays <= 30;
        return true; // 'all' ke liye sab true
    });

    // --- STEP 2: SEARCH FILTER (String Matching) ---
    if (searchQuery) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery));
    }

    // Sort: Latest pehle
    filtered.sort((a, b) => b.id - a.id);

    // --- STEP 3: RENDER UI ---
    historyList.innerHTML = "";
    let total = 0;

    if (filtered.length === 0) {
        historyList.innerHTML = "<p style='text-align:center; color:#ccc; padding:20px;'>No results found.</p>";
    } else {
        filtered.forEach(t => {
            const li = document.createElement('li');
            li.className = `transaction-item ${t.type === 'income' ? 'plus' : 'minus'}`;
            const dateStr = new Date(t.id).toLocaleDateString();

            li.innerHTML = `
                <div>
                    <span class="t-title">${t.title}</span><br>
                    <small style="color:#aaa">${dateStr}</small>
                </div>
                <span class="t-amount">${t.type === 'income' ? '+' : '-'} ₹${t.amount}</span>
            `;
            historyList.appendChild(li);

            // Total calculation based on Type
            if (t.type === 'income') total += t.amount;
            else total -= t.amount;
        });
    }

    // Total Update
    totalDisplay.innerText = `₹ ${total.toFixed(2)}`;
}
