// --- BỘ CÂU HỎI MẪU DÀNH CHO HỌC SINH ---
const questionBank = [
    {
        subject: "tinhoc",
        question: "Trong Python, câu lệnh nào dùng để xuất dữ liệu ra màn hình?",
        options: ["input()", "print()", "export()", "write()"],
        answer: 1
    },
    {
        subject: "tinhoc",
        question: "Đâu là cú pháp đúng của câu lệnh rẽ nhánh thiếu trong Python?",
        options: ["if điều_kiện:", "if điều_kiện then", "if (điều_kiện) do", "check điều_kiện:"],
        answer: 0
    },
    {
        subject: "tinhoc",
        question: "Thiết bị nào sau đây là thiết bị vào (Input device) của máy tính?",
        options: ["Màn hình", "Máy in", "Bàn phím", "Loa"],
        answer: 2
    },
    {
        subject: "math",
        question: "Kết quả của phép tính: 15 + 5 * 2 là bao nhiêu?",
        options: ["40", "25", "30", "35"],
        answer: 1
    },
    {
        subject: "science",
        question: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
        options: ["Trái Đất", "Sao Hỏa", "Sao Thủy", "Sao Kim"],
        answer: 2
    }
];

// Danh sách các loại cá có thể câu được
const fishTypes = [
    { name: "Cá Chép Vàng", points: 10, icon: "fa-fish text-yellow-400" },
    { name: "Cá Hề Nemo", points: 15, icon: "fa-fish-fins text-orange-500" },
    { name: "Cá Ngừ Đại Dương", points: 25, icon: "fa-fish text-blue-600" },
    { name: "Tôm Hùm Đỏ", points: 30, icon: "fa-shrimp text-red-500" },
    { name: "Cá Mập Con (Rất hiếm)", points: 50, icon: "fa-fish-fins text-slate-700" }
];

// Trạng thái người chơi
let currentPlayer = {
    name: "",
    subject: "all",
    score: 0,
    caughtFish: []
};

let currentQuestion = null;

// --- KHỞI TẠO & ĐĂNG NHẬP ---
function startGame(e) {
    e.preventDefault();
    const nameInput = document.getElementById("playerNameInput").value.trim();
    const subjectInput = document.getElementById("subjectSelect").value;

    if (!nameInput) return;

    currentPlayer.name = nameInput;
    currentPlayer.subject = subjectInput;

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");
    document.getElementById("gameScreen").classList.add("flex");
    document.getElementById("userInfo").classList.remove("hidden");
    document.getElementById("userInfo").classList.add("flex");

    document.getElementById("displayPlayerName").innerText = currentPlayer.name;
    updateScoreDisplay();
    
    // Thêm lượt chơi vào bảng xếp hạng giả lập/local
    addLeaderboardEntry(currentPlayer.name, currentPlayer.score);
}

// --- LOGIC THẢ CÂU & HIỂN THỊ CÂU HỎI ---
function castHook() {
    const line = document.getElementById("fishingLine");
    const castBtn = document.getElementById("castBtn");
    
    castBtn.disabled = true;
    line.classList.add("active");

    // Lọc câu hỏi theo môn học
    let availableQuestions = questionBank;
    if (currentPlayer.subject !== "all") {
        availableQuestions = questionBank.filter(q => q.subject === currentPlayer.subject);
    }
    
    if (availableQuestions.length === 0) availableQuestions = questionBank;

    // Chọn ngẫu nhiên 1 câu hỏi
    currentQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setTimeout(() => {
        showQuestionModal();
        line.classList.remove("active");
        castBtn.disabled = false;
    }, 900);
}

function showQuestionModal() {
    document.getElementById("questionCategory").innerText = currentQuestion.subject.toUpperCase();
    document.getElementById("questionText").innerText = currentQuestion.question;

    const container = document.getElementById("answersContainer");
    container.innerHTML = "";

    currentQuestion.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "w-full text-left p-3.5 border-2 border-sky-200 rounded-xl hover:bg-sky-50 hover:border-sky-400 font-semibold text-gray-700 transition flex items-center gap-3";
        btn.innerHTML = `<span class="bg-sky-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">${String.fromCharCode(65 + idx)}</span> ${opt}`;
        btn.onclick = () => checkAnswer(idx);
        container.appendChild(btn);
    });

    document.getElementById("questionModal").classList.remove("hidden");
}

function checkAnswer(selectedIndex) {
    document.getElementById("questionModal").classList.add("hidden");

    if (selectedIndex === currentQuestion.answer) {
        // Trả lời đúng -> Bắt cá thành công
        const caught = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        currentPlayer.score += caught.points;
        currentPlayer.caughtFish.push(caught);

        updateScoreDisplay();
        logActivity(`🎉 <b>${currentPlayer.name}</b> đã trả lời ĐÚNG và câu được <b>${caught.name}</b> (+${caught.points}đ)!`);
        addLeaderboardEntry(currentPlayer.name, currentPlayer.score);
        alert(`CHÚC MỪNG! Em đã trả lời đúng và bắt được ${caught.name} (+${caught.points} điểm)!`);
    } else {
        // Trả lời sai -> Cá sổng
        logActivity(`❌ <b>${currentPlayer.name}</b> trả lời chưa đúng, cá đã bơi mất!`);
        alert("Rất tiếc! Đáp án chưa chính xác, cá đã bơi mất rồi. Hãy thử lại câu tiếp theo nhé!");
    }
}

// --- CẬP NHẬT GIAO DIỆN ---
function updateScoreDisplay() {
    document.getElementById("displayScore").innerText = `${currentPlayer.score} đ`;
}

function logActivity(message) {
    const logContainer = document.getElementById("activityLog");
    const item = document.createElement("div");
    item.className = "p-2 bg-sky-50 rounded-lg border border-sky-100 text-xs";
    item.innerHTML = message;
    
    logContainer.prepend(item);
}

// Bảng xếp hạng tạm thời trên giao diện
let localScores = {};

function addLeaderboardEntry(name, score) {
    localScores[name] = Math.max(localScores[name] || 0, score);
    const leaderboardEl = document.getElementById("leaderboard");
    leaderboardEl.innerHTML = "";

    const sorted = Object.entries(localScores).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([pName, pScore], index) => {
        const row = document.createElement("div");
        row.className = "flex justify-between items-center p-1.5 rounded-md bg-gray-50 text-xs";
        row.innerHTML = `
            <span class="font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}">#${index + 1} ${pName}</span>
            <span class="font-extrabold text-sky-700">${pScore} đ</span>
        `;
        leaderboardEl.appendChild(row);
    });
}

// Bể cá cá nhân
function openAquarium() {
    const list = document.getElementById("aquariumList");
    list.innerHTML = "";

    if (currentPlayer.caughtFish.length === 0) {
        list.innerHTML = `<p class="col-span-2 text-center text-gray-400 text-sm py-4">Bể cá đang trống. Hãy đi câu cá ngay nhé!</p>`;
    } else {
        currentPlayer.caughtFish.forEach(fish => {
            const item = document.createElement("div");
            item.className = "p-3 bg-sky-50 rounded-xl border border-sky-200 flex flex-col items-center text-center";
            item.innerHTML = `
                <i class="fa-solid ${fish.icon} text-3xl mb-1"></i>
                <span class="text-xs font-bold text-gray-700">${fish.name}</span>
                <span class="text-[10px] text-sky-600 font-semibold">+${fish.points} điểm</span>
            `;
            list.appendChild(item);
        });
    }

    document.getElementById("aquariumModal").classList.remove("hidden");
}

function closeAquarium() {
    document.getElementById("aquariumModal").classList.add("hidden");
}