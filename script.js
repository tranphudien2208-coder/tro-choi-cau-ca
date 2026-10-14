// --- BỘ CÂU HỎI ĐA DẠNG (Trắc nghiệm, Đúng/Sai, Điền khuyết) ---
let questionBank = [
    { 
        type: "multiple", 
        subject: "tinhoc", 
        question: "Trong Python, câu lệnh dùng để xuất dữ liệu ra màn hình là gì?", 
        options: ["input()", "print()", "export()", "write()"], 
        answer: 1 
    },
    { 
        type: "boolean", 
        subject: "tinhoc", 
        question: "Đúng hay Sai: Python là ngôn ngữ lập trình bậc cao?", 
        options: ["Đúng", "Sai"], 
        answer: 0 
    },
    { 
        type: "fill", 
        subject: "tinhoc", 
        question: "Điền từ thích hợp vào chỗ trống: Để lặp với số lần biết trước trong Python, ta dùng lệnh ______.", 
        answer: "for" 
    },
    { 
        type: "multiple", 
        subject: "math", 
        question: "Kết quả của phép tính: 15 + 5 * 2 là bao nhiêu?", 
        options: ["40", "25", "30", "35"], 
        answer: 1 
    }
];

const fishTypes = [
    { name: "Cá Chép Vàng", points: 10, icon: "fa-fish text-yellow-400", rare: false },
    { name: "Cá Nemo", points: 15, icon: "fa-fish-fins text-orange-500", rare: false },
    { name: "Cá Kiếm Khổng Lồ", points: 30, icon: "fa-fish text-sky-600", rare: true },
    { name: "Cá Mập Săn Mồi", points: 50, icon: "fa-fish-fins text-slate-700", rare: true }
];

let currentPlayer = { name: "", avatar: "🥷", subject: "all", score: 0, caughtFish: [] };
let currentQuestion = null;
let localScores = {};
let timerInterval = null;
let timeLeft = 15;
let globalTimeLeft = 15 * 60; // 15 phút đếm ngược tổng
let globalTimerInterval = null;
let boatPosition = 20; // Vị trí % ngang của thuyền

function selectAvatar(emoji, element) {
    currentPlayer.avatar = emoji;
    document.querySelectorAll(".avatar-card").forEach(c => {
        c.classList.remove("selected", "border-sky-400", "bg-sky-50");
        c.classList.add("border-gray-200", "bg-white");
    });
    element.classList.add("selected", "border-sky-400", "bg-sky-50");
    element.classList.remove("border-gray-200", "bg-white");
}

function startGame(e) {
    e.preventDefault();
    const nameInput = document.getElementById("playerNameInput").value.trim();
    if (!nameInput) return;
    currentPlayer.name = nameInput;
    currentPlayer.subject = document.getElementById("subjectSelect").value;
    
    document.getElementById("loginScreen").classList.add("hidden");
    const gameScreen = document.getElementById("gameScreen");
    gameScreen.classList.remove("hidden");
    gameScreen.classList.add("flex");
    
    document.getElementById("userInfo").classList.remove("hidden");
    document.getElementById("userInfo").classList.add("flex");
    document.getElementById("globalTimer").classList.remove("hidden");
    document.getElementById("globalTimer").classList.add("flex");

    document.getElementById("displayPlayerName").innerText = currentPlayer.name;
    document.getElementById("displayAvatar").innerText = currentPlayer.avatar;
    document.getElementById("boatAvatar").innerText = currentPlayer.avatar;

    updateScoreDisplay();
    addLeaderboardEntry(currentPlayer.name, 0);
    initFishParticles();
    startGlobalTimer();
}

// --- DI CHUYỂN NHÂN VẬT ---
function movePlayer(direction) {
    boatPosition += direction * 8;
    if (boatPosition < 5) boatPosition = 5;
    if (boatPosition > 80) boatPosition = 80;
    
    const boat = document.getElementById("fishingBoat");
    boat.style.left = `${boatPosition}%`;
    
    // Cập nhật vị trí dây câu theo thuyền
    const line = document.getElementById("fishingLine");
    line.style.left = `calc(${boatPosition}% + 45px)`;
}

// --- ĐỒNG HỒ TỔNG 15 PHÚT ---
function startGlobalTimer() {
    globalTimerInterval = setInterval(() => {
        globalTimeLeft--;
        let mins = Math.floor(globalTimeLeft / 60);
        let secs = globalTimeLeft % 60;
        document.getElementById("globalTimerDisplay.innerText") = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        document.getElementById("globalTimerDisplay").innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (globalTimeLeft <= 0) {
            clearInterval(globalTimerInterval);
            endGameByTime();
        }
    }, 1000);
}

function endGameByTime() {
    document.getElementById("gameScreen").classList.add("hidden");
    const modal = document.getElementById("gameOverModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const podium = document.getElementById("podiumList");
    podium.innerHTML = "";
    const sorted = Object.entries(localScores).sort((a, b) => b[1] - a[1]).slice(0, 3);

    sorted.forEach(([name, score], idx) => {
        const medals = ["🥇", "🥈", "🥉"];
        const div = document.createElement("div");
        div.className = "flex justify-between items-center bg-white p-3.5 rounded-2xl shadow border-2 border-yellow-300 text-xl font-bold";
        div.innerHTML = `<span>${medals[idx]} ${name}</span> <span class="text-amber-700">${score} điểm</span>`;
        podium.appendChild(div);
    });
}

// --- THẢ CÂU & CÂU HỎI ĐA DẠNG ---
function castHook() {
    const line = document.getElementById("fishingLine");
    const castBtn = document.getElementById("castBtn");
    castBtn.disabled = true;
    line.classList.add("active");

    let availableQuestions = questionBank;
    if (currentPlayer.subject !== "all") {
        availableQuestions = questionBank.filter(q => q.subject === currentPlayer.subject);
    }
    if (availableQuestions.length === 0) availableQuestions = questionBank;
    currentQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setTimeout(() => {
        line.classList.remove("active");
        showQuestionModal();
        castBtn.disabled = false;
    }, 700);
}

function showQuestionModal() {
    document.getElementById("questionText").innerText = currentQuestion.question;
    const badge = document.getElementById("questionTypeBadge");
    const container = document.getElementById("answersContainer");
    container.innerHTML = "";

    if (currentQuestion.type === "multiple" || !currentQuestion.type) {
        badge.innerText = "Trắc nghiệm 4 lựa chọn";
        currentQuestion.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "w-full opt-btn flex items-center p-4 rounded-2xl";
            btn.innerHTML = `
                <div class="bg-sky-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold mr-4">${String.fromCharCode(65 + idx)}</div>
                <div class="flex-grow font-bold text-gray-800 text-lg">${opt}</div>
            `;
            btn.onclick = () => checkAnswer(idx, btn);
            container.appendChild(btn);
        });
    } else if (currentQuestion.type === "boolean") {
        badge.innerText = "Đúng / Sai";
        currentQuestion.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "w-full opt-btn flex items-center p-4 rounded-2xl justify-center text-xl font-bold text-indigo-900";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(idx, btn);
            container.appendChild(btn);
        });
    } else if (currentQuestion.type === "fill") {
        badge.innerText = "Điền khuyết (Điền từ)";
        const input = document.createElement("input");
        input.type = "text";
        input.id = "fillAnswerInput";
        input.placeholder = "Nhập câu trả lời của em...";
        input.className = "w-full p-4 border-4 border-sky-300 rounded-2xl text-xl font-bold text-center mb-3 focus:outline-none focus:border-yellow-400";
        
        const submitBtn = document.createElement("button");
        submitBtn.className = "w-full bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-extrabold py-3.5 rounded-2xl text-xl shadow";
        submitBtn.innerText = "XÁC NHẬN ĐÁP ÁN";
        submitBtn.onclick = () => {
            const val = document.getElementById("fillAnswerInput").value.trim().toLowerCase();
            checkFillAnswer(val, submitBtn);
        };
        container.appendChild(input);
        container.appendChild(submitBtn);
    }

    const modal = document.getElementById("questionModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    startTimer();
}

function startTimer() {
    timeLeft = 15;
    document.getElementById("timerDisplay").innerText = `${timeLeft}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timerDisplay").innerText = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            closeModal();
            logActivity(`⏰ <b>${currentPlayer.name}</b> hết giờ trả lời!`);
        }
    }, 1000);
}

function checkAnswer(selectedIndex, selectedBtn) {
    clearInterval(timerInterval);
    const modalContent = document.getElementById("modalContent");
    
    if (selectedIndex === currentQuestion.answer) {
        modalContent.classList.add("correct-answer-bg");
        processCorrectAnswer(selectedBtn);
    } else {
        modalContent.classList.add("wrong-answer-bg");
        logActivity(`❌ <b>${currentPlayer.name}</b> trả lời chưa đúng, cá bơi mất!`);
    }

    setTimeout(() => {
        modalContent.classList.remove("correct-answer-bg", "wrong-answer-bg");
        closeModal();
    }, 1000);
}

function checkFillAnswer(userVal, btn) {
    clearInterval(timerInterval);
    const modalContent = document.getElementById("modalContent");
    if (userVal === currentQuestion.answer.toLowerCase()) {
        modalContent.classList.add("correct-answer-bg");
        processCorrectAnswer(btn);
    } else {
        modalContent.classList.add("wrong-answer-bg");
        logActivity(`❌ <b>${currentPlayer.name}</b> điền chưa chính xác!`);
    }
    setTimeout(() => {
        modalContent.classList.remove("correct-answer-bg", "wrong-answer-bg");
        closeModal();
    }, 1000);
}

function processCorrectAnswer(btn) {
    const caught = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    currentPlayer.score += caught.points;
    currentPlayer.caughtFish.push(caught);
    updateScoreDisplay();
    
    logActivity(`🎉 <b>${currentPlayer.name}</b> câu được <b>${caught.name}</b> (+${caught.points}đ)!`);
    addLeaderboardEntry(currentPlayer.name, currentPlayer.score);

    if (caught.rare) triggerGiantFishEffect(caught.name);
    else {
        const rect = btn.getBoundingClientRect();
        confetti({ particleCount: 70, spread: 60, origin: { x: rect.x / window.innerWidth, y: rect.y / window.innerHeight } });
    }
    triggerFlyingFishAnimation(caught.icon);
}

function closeModal() {
    clearInterval(timerInterval);
    const modal = document.getElementById("questionModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// --- CHATBOT AI TRỢ LÝ ---
function openChatbot() {
    document.getElementById("chatbotModal").classList.remove("hidden");
    document.getElementById("chatbotModal").classList.add("flex");
}
function closeChatbot() {
    document.getElementById("chatbotModal").classList.add("hidden");
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;

    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML += `<div class="bg-purple-100 text-purple-900 p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] shadow">${text}</div>`;
    input.value = "";

    setTimeout(() => {
        let reply = "Thầy AI đã ghi nhận câu hỏi của em! Hãy cố gắng suy nghĩ hoặc hỏi giáo viên trên lớp để hiểu sâu hơn nhé!";
        if (text.toLowerCase().includes("python") || text.toLowerCase().includes("tin học")) {
            reply = "💡 Mẹo Tin học: Trong Python, lệnh `print()` dùng để in ra màn hình, còn lệnh `input()` dùng để nhận dữ liệu từ bàn phím!";
        } else if (text.toLowerCase().includes("toán")) {
            reply = "💡 Mẹo Toán học: Hãy nhớ thực hiện phép nhân/chia trước, phép cộng/trừ sau nhé!";
        }
        chatMessages.innerHTML += `<div class="bg-purple-600 text-white p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow">${reply}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);
}

// --- HIỆU ỨNG CÁ TO & BỂ CÁ ---
function triggerGiantFishEffect(fishName) {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    const banner = document.createElement("div");
    banner.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-red-600 text-white p-6 rounded-3xl font-black text-2xl z-100 shadow-2xl animate-bounce";
    banner.innerHTML = `🔥 CÂU ĐƯỢC CÁ KHỔNG LỒ!<br><span class="text-yellow-200 text-3xl">${fishName}</span>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 1500);
}

function triggerFlyingFishAnimation(fishIconClass) {
    const flyingFish = document.createElement("div");
    flyingFish.className = `flying-fish ${fishIconClass}`;
    flyingFish.innerHTML = `<i class="fa-solid fa-water"></i>`;
    flyingFish.style.left = `calc(${boatPosition}% + 50px)`;
    flyingFish.style.top = `350px`;
    document.getElementById("fishAnimationContainer").appendChild(flyingFish);

    setTimeout(() => {
        flyingFish.style.left = `${window.innerWidth - 60}px`;
        flyingFish.style.top = `110px`;
        flyingFish.style.transform = 'scale(1.5)';
        flyingFish.style.opacity = 0;
    }, 10);
    setTimeout(() => flyingFish.remove(), 1000);
}

function initFishParticles() {
    const group = document.getElementById("fishSwimGroup");
    group.innerHTML = "";
    const icons = ["fa-fish text-yellow-100", "fa-fish-fins text-red-300", "fa-shrimp text-pink-200"];
    for (let i = 0; i < 5; i++) {
        const f = document.createElement("div");
        f.className = "fish-particle";
        f.innerHTML = `<i class="fa-solid ${icons[i % icons.length]} text-3xl"></i>`;
        f.style.left = `${Math.random() * 80 + 10}%`;
        f.style.top = `${Math.random() * 40 + 50}%`;
        group.appendChild(f);
    }
}

function updateScoreDisplay() {
    document.getElementById("displayScore").innerText = `${currentPlayer.score}đ`;
}

function logActivity(msg) {
    const log = document.getElementById("activityLog");
    const item = document.createElement("div");
    item.className = "p-2.5 bg-sky-900 rounded-lg text-sm border border-sky-800";
    item.innerHTML = msg;
    log.prepend(item);
}

function addLeaderboardEntry(name, score) {
    localScores[name] = Math.max(localScores[name] || 0, score);
    const board = document.getElementById("leaderboard");
    board.innerHTML = "";
    const sorted = Object.entries(localScores).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([pName, pScore], idx) => {
        const row = document.createElement("div");
        row.className = `flex justify-between items-center p-2 rounded-lg text-base ${idx === 0 ? 'bg-yellow-400 text-sky-950 font-bold' : 'bg-sky-900 border border-sky-800'}`;
        row.innerHTML = `<span>#${idx + 1} ${pName}</span><span class="font-extrabold">${pScore}đ</span>`;
        board.appendChild(row);
    });
}

function openAquarium() {
    const list = document.getElementById("aquariumList");
    list.innerHTML = "";
    if (currentPlayer.caughtFish.length === 0) {
        list.innerHTML = `<p class="col-span-3 text-center text-gray-400 py-8">Bể cá đang trống...</p>`;
    } else {
        currentPlayer.caughtFish.forEach(fish => {
            const item = document.createElement("div");
            item.className = `p-3 bg-sky-50 rounded-2xl border-2 ${fish.rare ? 'border-yellow-400' : 'border-sky-200'} flex flex-col items-center text-center`;
            item.innerHTML = `
                <i class="fa-solid ${fish.icon} text-4xl mb-2"></i>
                <span class="text-base font-bold text-gray-800">${fish.name}</span>
                <span class="text-sm text-sky-700 font-semibold">+${fish.points}đ</span>
            `;
            list.appendChild(item);
        });
    }
    document.getElementById("aquariumModal").classList.remove("hidden");
    document.getElementById("aquariumModal").classList.add("flex");
}

function closeAquarium() { document.getElementById("aquariumModal").classList.add("hidden"); }

// Đọc file CSV (Hỗ trợ thêm cột loại câu hỏi type: multiple, boolean, fill)
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById("fileNameDisplay").innerText = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSVQuestions(e.target.result);
    };
    reader.readAsText(file, "UTF-8");
}

function parseCSVQuestions(csvText) {
    const lines = csvText.split(/\r\n|\n/);
    let count = 0;
    questionBank.length = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 3) {
            const qType = cols[0].replace(/["']/g, "").trim() || "multiple";
            const qSub = cols[1].replace(/["']/g, "").trim() || "all";
            const qText = cols[2].replace(/["']/g, "").trim();
            
            if (qType === "fill") {
                questionBank.push({ type: "fill", subject: qSub, question: qText, answer: cols[3].replace(/["']/g, "").trim() });
                count++;
            } else {
                questionBank.push({ 
                    type: qType, 
                    subject: qSub, 
                    question: qText, 
                    options: [cols[3].replace(/["']/g, "").trim(), cols[4].replace(/["']/g, "").trim(), cols[5]?.replace(/["']/g, "").trim(), cols[6]?.replace(/["']/g, "").trim()].filter(Boolean), 
                    answer: parseInt(cols[7]?.replace(/["']/g, "").trim() || 0) 
                });
                count++;
            }
        }
    }
    if (count > 0) alert(`Đã tải thành công ${count} câu hỏi đa dạng vào trò chơi!`);
}
