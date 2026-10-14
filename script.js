const questionBank = [
    { subject: "tinhoc", question: "Trong Python, câu lệnh print() dùng để làm gì?", options: ["Nhập dữ liệu", "Xuất dữ liệu", "Lưu dữ liệu", "Xóa dữ liệu"], answer: 1 },
    { subject: "math", question: "Kết quả của phép tính: 10 * 3 + 5 là bao nhiêu?", options: ["80", "35", "50", "40"], answer: 1 },
    { subject: "science", question: "Hành tinh nào gần Mặt Trời nhất?", options: ["Trái Đất", "Sao Hỏa", "Sao Thủy", "Sao Kim"], answer: 2 }
];

// Phân loại cá (Cá thường & Cá To/Hiếm đặc biệt)
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
    document.getElementById("displayPlayerName").innerText = currentPlayer.name;
    document.getElementById("displayAvatar").innerText = currentPlayer.avatar;
    document.getElementById("boatAvatar").innerText = currentPlayer.avatar;

    updateScoreDisplay();
    addLeaderboardEntry(currentPlayer.name, 0);
    initFishParticles();
}

// --- THẢ CÂU & ĐỒNG HỒ ĐẾM NGƯỢC ---
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
    document.getElementById("questionCategory").innerText = currentQuestion.subject.toUpperCase();
    document.getElementById("questionText").innerText = currentQuestion.question;
    const container = document.getElementById("answersContainer");
    container.innerHTML = "";

    currentQuestion.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "w-full opt-btn flex items-center p-5 rounded-2xl";
        btn.innerHTML = `
            <div class="bg-sky-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-extrabold mr-5 shadow">${String.fromCharCode(65 + idx)}</div>
            <div class="flex-grow font-bold text-gray-800 text-xl">${opt}</div>
        `;
        btn.onclick = () => checkAnswer(idx, btn);
        container.appendChild(btn);
    });

    const modal = document.getElementById("questionModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const content = document.getElementById("modalContent");
    setTimeout(() => {
        content.classList.remove("scale-95", "opacity-0");
        content.classList.add("scale-100", "opacity-100");
    }, 50);

    // Bắt đầu đồng hồ đếm ngược (15 giây)
    startTimer();
}

function startTimer() {
    timeLeft = 15;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.innerText = `${timeLeft}s`;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOutAnswer();
        }
    }, 1000);
}

function timeOutAnswer() {
    closeModal();
    logActivity(`⏰ <b>${currentPlayer.name}</b> đã hết giờ! Cá đã bơi mất.`);
    alert("Hết giờ mất rồi! Em đã bỏ lỡ cơ hội câu con cá này.");
}

function checkAnswer(selectedIndex, selectedBtn) {
    clearInterval(timerInterval); // Dừng đồng hồ
    const modalContent = document.getElementById("modalContent");
    
    if (selectedIndex === currentQuestion.answer) {
        modalContent.classList.add("correct-answer-bg");
        
        // Chọn ngẫu nhiên loại cá (có tỉ lệ ra cá hiếm/cá to)
        const caught = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        currentPlayer.score += caught.points;
        currentPlayer.caughtFish.push(caught);
        updateScoreDisplay();
        
        logActivity(`🎉 <b>${currentPlayer.name}</b> trả lời ĐÚNG và câu được <b>${caught.name}</b> (+${caught.points}đ)!`);
        addLeaderboardEntry(currentPlayer.name, currentPlayer.score);

        // Hiệu ứng đặc biệt nếu câu được cá to / cá hiếm
        if (caught.rare) {
            triggerGiantFishEffect(caught.name);
        } else {
            triggerConfettiAt(selectedBtn);
        }

        triggerFlyingFishAnimation(caught.icon);
    } else {
        modalContent.classList.add("wrong-answer-bg");
        logActivity(`❌ <b>${currentPlayer.name}</b> trả lời chưa đúng, cá đã bơi mất!`);
    }

    setTimeout(() => {
        modalContent.classList.remove("correct-answer-bg", "wrong-answer-bg");
        closeModal();
    }, 1000);
}

function closeModal() {
    clearInterval(timerInterval);
    const modal = document.getElementById("questionModal");
    const content = document.getElementById("modalContent");
    content.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }, 200);
}

// --- HIỆU ỨNG ĐẶC BIỆT KHI CÂU ĐƯỢC CÁ TO / CÁ HIẾM ---
function triggerGiantFishEffect(fishName) {
    // Pháo hoa lớn toàn màn hình
    confetti({
        particleCount: 150, spread: 100, origin: { y: 0.6 }
    });

    // Hiển thị banner vinh danh cá to giữa màn hình
    const banner = document.createElement("div");
    banner.className = "giant-fish-banner";
    banner.innerHTML = `🔥 CÂU ĐƯỢC CÁ KHỔNG LỒ!<br><span class="text-yellow-200 text-3xl">${fishName}</span>`;
    document.body.appendChild(banner);

    setTimeout(() => banner.remove(), 1500);
}

function triggerConfettiAt(btn) {
    const rect = btn.getBoundingClientRect();
    confetti({
        particleCount: 80, spread: 60, origin: { x: rect.x / window.innerWidth, y: rect.y / window.innerHeight }
    });
}

function triggerFlyingFishAnimation(fishIconClass) {
    const startPoint = { x: 120, y: 350 };
    const endPoint = { x: window.innerWidth - 60, y: 110 };

    const flyingFish = document.createElement("div");
    flyingFish.className = `flying-fish ${fishIconClass}`;
    flyingFish.innerHTML = `<i class="fa-solid fa-water"></i>`;
    flyingFish.style.left = `${startPoint.x}px`;
    flyingFish.style.top = `${startPoint.y}px`;
    flyingFish.style.transform = 'translate(-50%, -50%) scale(0.2)';
    document.getElementById("fishAnimationContainer").appendChild(flyingFish);

    setTimeout(() => {
        flyingFish.style.left = `${endPoint.x}px`;
        flyingFish.style.top = `${endPoint.y}px`;
        flyingFish.style.transform = 'translate(-50%, -50%) scale(1.5)';
        flyingFish.style.opacity = 0;
    }, 10);

    setTimeout(() => flyingFish.remove(), 1000);
}

function initFishParticles() {
    const fishSwimGroup = document.getElementById("fishSwimGroup");
    fishSwimGroup.innerHTML = "";
    const fishIcons = ["fa-fish text-yellow-100", "fa-fish-fins text-red-300", "fa-shrimp text-pink-200"];
    
    for (let i = 0; i < 5; i++) {
        const f = document.createElement("div");
        f.className = "fish-particle";
        f.innerHTML = `<i class="fa-solid ${fishIcons[i % fishIcons.length]} text-3xl"></i>`;
        f.style.left = `${Math.random() * 80 + 10}%`;
        f.style.top = `${Math.random() * 40 + 50}%`;
        f.style.animationDelay = `${Math.random() * 5}s`;
        f.style.animationDuration = `${Math.random() * 5 + 8}s`;
        fishSwimGroup.appendChild(f);
    }
}

function updateScoreDisplay() {
    document.getElementById("displayScore").innerText = `${currentPlayer.score}đ`;
}

function logActivity(message) {
    const logContainer = document.getElementById("activityLog");
    const item = document.createElement("div");
    item.className = "p-3 bg-sky-900 rounded-lg text-lg border border-sky-800";
    item.innerHTML = message;
    logContainer.prepend(item);
}

function addLeaderboardEntry(name, score) {
    localScores[name] = Math.max(localScores[name] || 0, score);
    const leaderboardEl = document.getElementById("leaderboard");
    leaderboardEl.innerHTML = "";
    const sorted = Object.entries(localScores).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([pName, pScore], index) => {
        const row = document.createElement("div");
        row.className = `flex justify-between items-center p-2.5 rounded-lg text-xl ${index === 0 ? 'bg-yellow-400 text-sky-950 font-bold' : 'bg-sky-900 border border-sky-800'}`;
        row.innerHTML = `<span>#${index + 1} ${pName}</span><span class="font-extrabold">${pScore}đ</span>`;
        leaderboardEl.appendChild(row);
    });
}

function openAquarium() {
    const list = document.getElementById("aquariumList");
    list.innerHTML = "";
    if (currentPlayer.caughtFish.length === 0) {
        list.innerHTML = `<p class="col-span-2 md:col-span-3 text-center text-gray-400 text-lg py-10">Bể cá đang trống...</p>`;
    } else {
        currentPlayer.caughtFish.forEach(fish => {
            const item = document.createElement("div");
            item.className = `p-4 bg-sky-50 rounded-2xl border-2 ${fish.rare ? 'border-yellow-400 shadow-lg' : 'border-sky-200'} flex flex-col items-center text-center`;
            item.innerHTML = `
                <i class="fa-solid ${fish.icon} text-5xl mb-3 ${fish.rare ? 'animate-bounce' : ''}"></i>
                <span class="text-xl font-extrabold text-gray-800">${fish.name}</span>
                <span class="text-lg text-sky-700 font-bold">+${fish.points}đ</span>
            `;
            list.appendChild(item);
        });
    }
    document.getElementById("aquariumModal").classList.remove("hidden");
    document.getElementById("aquariumModal").classList.add("flex");
}

function closeAquarium() { document.getElementById("aquariumModal").classList.add("hidden"); }

// Đọc file CSV
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
    let loadedCount = 0;
    questionBank.length = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 7) {
            questionBank.push({
                subject: cols[0].replace(/["']/g, "").trim(),
                question: cols[1].replace(/["']/g, "").trim(),
                options: [cols[2].replace(/["']/g, "").trim(), cols[3].replace(/["']/g, "").trim(), cols[4].replace(/["']/g, "").trim(), cols[5].replace(/["']/g, "").trim()],
                answer: parseInt(cols[6].replace(/["']/g, "").trim())
            });
            loadedCount++;
        }
    }
    if (loadedCount > 0) alert(`Đã tải thành công ${loadedCount} câu hỏi mới!`);
}
