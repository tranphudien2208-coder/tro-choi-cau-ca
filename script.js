// --- BỘ CÂU HỎI MẪU ---
const questionBank = [
    { subject: "tinhoc", question: "Trong Python, câu lệnh print('Chào em') dùng để làm gì?", options: ["Nhập dữ liệu", "Xuất dữ liệu", "Lưu dữ liệu", "Xóa dữ liệu"], answer: 1 },
    { subject: "math", question: "Kết quả của: 10 * 3 + 5 là bao nhiêu?", options: ["80", "35", "50", "40"], answer: 1 },
    { subject: "science", question: "Loài vật nào được coi là 'Chúa tể sơn lâm'?", options: ["Voi", "Cá Mập", "Sư Tử", "Hổ"], answer: 3 }
];

// Danh sách cá mới (đẹp hơn)
const fishTypes = [
    { name: "Cá Chép Vàng", points: 10, icon: "fa-fish text-yellow-400", rare: false },
    { name: "Cá Nemo", points: 15, icon: "fa-fish-fins text-orange-500", rare: false },
    { name: "Cá Kiếm Lam", points: 25, icon: "fa-sword text-sky-600", rare: true },
    { name: "Cá Mập Con", points: 50, icon: "fa-fish-fins text-slate-700", rare: true }
];

let currentPlayer = { name: "", subject: "all", score: 0, caughtFish: [] };
let currentQuestion = null;
let localScores = {};

// --- KHỞI ĐỘNG ---
function startGame(e) {
    e.preventDefault();
    const nameInput = document.getElementById("playerNameInput").value.trim();
    if (!nameInput) return;
    currentPlayer.name = nameInput;
    currentPlayer.subject = document.getElementById("subjectSelect").value;
    switchScreen("loginScreen", "gameScreen");
    document.getElementById("userInfo").classList.remove("hidden");
    document.getElementById("userInfo").classList.add("flex");
    document.getElementById("displayPlayerName").innerText = currentPlayer.name;
    updateScoreDisplay();
    addLeaderboardEntry(currentPlayer.name, 0);
    // Bắt đầu particle cá bơi
    initFishParticles();
}

function switchScreen(hideId, showId) {
    document.getElementById(hideId).classList.add("hidden");
    const showEl = document.getElementById(showId);
    showEl.classList.remove("hidden");
    showEl.classList.add("flex");
}

// --- LOGIC THẢ CÂU & HIỂN THỊ CÂU HỎI ---
function castHook() {
    const line = document.getElementById("fishingLine");
    const castBtn = document.getElementById("castBtn");
    const bobber = document.getElementById("bobber");
    castBtn.disabled = true;
    line.classList.add("active");
    // Di chuyển thuyền nhẹ
    document.getElementById("fishingBoat").classList.add("translate-x-3");

    // Chọn câu hỏi
    let availableQuestions = questionBank;
    if (currentPlayer.subject !== "all") {
        availableQuestions = questionBank.filter(q => q.subject === currentPlayer.subject);
    }
    if (availableQuestions.length === 0) availableQuestions = questionBank;
    currentQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setTimeout(() => {
        line.classList.remove("active");
        document.getElementById("fishingBoat").classList.remove("translate-x-3");
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
        btn.className = "w-full opt-btn flex items-center p-6 rounded-2xl hover:scale-105 active:scale-95";
        btn.innerHTML = `
            <div class="opt-btn-label bg-sky-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-extrabold mr-5 shadow">${String.fromCharCode(65 + idx)}</div>
            <div class="opt-btn-text flex-grow">${opt}</div>
        `;
        btn.onclick = () => checkAnswer(idx, btn);
        container.appendChild(btn);
    });

    const modal = document.getElementById("questionModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    // Thêm hiệu ứng modal
    const content = document.getElementById("modalContent");
    setTimeout(() => {
        content.classList.remove("scale-95", "opacity-0");
        content.classList.add("scale-100", "opacity-100");
    }, 50);
}

function checkAnswer(selectedIndex, selectedBtn) {
    const modalContent = document.getElementById("modalContent");
    
    if (selectedIndex === currentQuestion.answer) {
        // --- TRẢ LỜI ĐÚNG (NÂNG CẤP) ---
        modalContent.classList.add("correct-answer-bg");
        // Hiệu ứng Particle nổ sao (NỔ NGAY TẠI NÚT CHỌN)
        const btnRect = selectedBtn.getBoundingClientRect();
        confetti({
            particleCount: 100, spread: 70, origin: { x: btnRect.x / window.innerWidth, y: btnRect.y / window.innerHeight }
        });

        // Bắt cá
        const caught = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        currentPlayer.score += caught.points;
        currentPlayer.caughtFish.push(caught);
        updateScoreDisplay();
        logActivity(`🎉 <b>${currentPlayer.name}</b> trả lời ĐÚNG và bắt được <b>${caught.name}</b> (+${caught.points}đ)!`);
        addLeaderboardEntry(currentPlayer.name, currentPlayer.score);

        // Hiệu ứng Cá Bay từ biển lên bể cá
        triggerFlyingFishAnimation(caught.icon);
    } else {
        // --- TRẢ LỜI SAI (NÂNG CẤP) ---
        modalContent.classList.add("wrong-answer-bg");
        logActivity(`❌ <b>${currentPlayer.name}</b> trả lời chưa đúng, cá đã bơi mất!`);
    }

    // Đóng modal sau hiệu ứng
    setTimeout(() => {
        modalContent.classList.remove("correct-answer-bg", "wrong-answer-bg");
        closeModal();
    }, 1000);
}

function closeModal() {
    const modal = document.getElementById("questionModal");
    const content = document.getElementById("modalContent");
    content.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }, 200);
}

// --- HIỆU ỨNG CÁ BAY TỪ BIỂN LÊN BỂ CÁ ---
function triggerFlyingFishAnimation(fishIconClass) {
    const startPoint = { x: 120, y: 350 }; // Vị trí móc câu
    const endPoint = { x: window.innerWidth - 60, y: 110 }; // Vị trí bể cá

    const flyingFish = document.createElement("div");
    flyingFish.className = `flying-fish ${fishIconClass}`;
    flyingFish.innerHTML = `<i class="fa-solid fa-star-of-life"></i>`; // Particle nhỏ bay kèm
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

    setTimeout(() => {
        flyingFish.remove();
        // Nhấp nháy bể cá
        document.querySelector(".fa-bucket").classList.add("animate-pulse", "text-yellow-300");
        setTimeout(() => document.querySelector(".fa-bucket").classList.remove("animate-pulse", "text-yellow-300"), 500);
    }, 1000);
}

// --- PARTICLE CÁ BƠI ---
function initFishParticles() {
    const fishSwimGroup = document.getElementById("fishSwimGroup");
    fishSwimGroup.innerHTML = "";
    const numFish = 6;
    const fishIcons = ["fa-fish text-yellow-100", "fa-fish-fins text-red-300", "fa-shrimp text-pink-200"];
    
    for (let i = 0; i < numFish; i++) {
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

// --- GIAO DIỆN & BẢNG XẾP HẠNG ---
function updateScoreDisplay() {
    document.getElementById("displayScore").innerText = `${currentPlayer.score}đ`;
    document.getElementById("displayScore").classList.add("scale-110");
    setTimeout(() => document.getElementById("displayScore").classList.remove("scale-110"), 100);
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

// Bể cá
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
                <i class="fa-solid ${fish.icon} text-5xl mb-3 ${fish.rare ? 'animate-pulse' : ''}"></i>
                <span class="text-xl font-extrabold text-gray-800">${fish.name}</span>
                <span class="text-lg text-sky-700 font-bold">+${fish.points}đ</span>
            `;
            list.appendChild(item);
        });
    }
    const modal = document.getElementById("aquariumModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeAquarium() { document.getElementById("aquariumModal").classList.add("hidden"); }

// --- TẢI CÂU HỎI TỪ FILE CSV (.csv) ---
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById("fileNameDisplay").innerText = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSVQuestions(text);
    };
    reader.readAsText(file, "UTF-8");
}

function parseCSVQuestions(csvText) {
    const lines = csvText.split(/\r\n|\n/);
    let loadedCount = 0;
    // Xóa câu hỏi cũ (Tùy chọn)
    questionBank.length = 0; 

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Phân tách CSV chuẩn
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
    if (loadedCount > 0) { alert(`Đã tải thành công ${loadedCount} câu hỏi từ file của thầy cô!`); }
    else { alert("Vui lòng kiểm tra lại định dạng file CSV!"); }
}
