// Элементы
const multiplierElement = document.getElementById('multiplier');
const getSignalButton = document.getElementById('getSignalButton');
const progressFill = document.querySelector('.progress-fill');
const winChanceElement = document.getElementById('win-chance');
const winChanceLabel = document.querySelector('.win-chance-label');
const clickSound = document.getElementById('clickSound');
const completeSound = document.getElementById('completeSound');
const menuButton = document.getElementById('menu-button');
const statusText = document.getElementById('status-text');
const progressBar = document.querySelector('.progress-bar');

// Данные для перевода
const translations = {
    ru: {
        title: "LUCKY JET",
        chance_label: "Шанс",
        get_signal_button: "ПОЛУЧИТЬ СИГНАЛ",
        menu_button: "Меню",
        status_waiting: "Сигнал будет доступен, когда заполнится шкала",
        status_ready: "Вы снова можете получить сигнал"
    },
    en: {
        title: "LUCKY JET",
        chance_label: "Chance",
        get_signal_button: "GET SIGNAL",
        menu_button: "Menu",
        status_waiting: "Signal will be available when the bar fills",
        status_ready: "You can get the signal again"
    },
    in: {
        title: "LUCKY JET",
        chance_label: "संभावना",
        get_signal_button: "संकेत प्राप्त करें",
        menu_button: "मेनू",
        status_waiting: "सिग्नल उपलब्ध होगा जब बार भर जाएगा",
        status_ready: "आप फिर से सिग्नल प्राप्त कर सकते हैं"
    }
};

// Текущий язык
let currentLang = localStorage.getItem('language') || 'ru';

// Состояние прогресса
let isProgressRunning = localStorage.getItem('isProgressRunning') === 'true';
let progressStartTime = parseInt(localStorage.getItem('progressStartTime')) || 0;
const progressDuration = 60000; // 60 секунд

// Сохранение множителя и шанса
let currentMultiplier = localStorage.getItem('currentMultiplier') || '';
let currentWinChance = localStorage.getItem('currentWinChance') || '';

// Генерация множителя (80% - 1.00-3.00, 20% - 3.01-10.00)
function generateMultiplier() {
    const random = Math.random();
    if (random < 0.8) {
        return (Math.random() * 2 + 1).toFixed(2); // 1.00 - 3.00 (80%)
    } else {
        return (Math.random() * 7 + 3).toFixed(2); // 3.01 - 10.00 (20%)
    }
}

// Расчёт шанса выигрыша (теперь строже для высоких множителей)
function calculateWinChance(multiplier) {
    multiplier = parseFloat(multiplier);
    if (multiplier <= 1.5) return (Math.random() * 3 + 97).toFixed(2); // 97-100%
    if (multiplier <= 2.0) return (Math.random() * 5 + 92).toFixed(2);  // 92-97%
    if (multiplier <= 3.0) return (Math.random() * 8 + 84).toFixed(2); // 84-92%
    if (multiplier <= 5.0) return (Math.random() * 10 + 70).toFixed(2); // 70-80%
    return (Math.random() * 15 + 50).toFixed(2); // 50-65% (для 5.01-10.00)
}


// Плавная анимация множителя
function animateMultiplier(targetMultiplier, duration = 1000) {
    const startMultiplier = 1.00;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentMultiplier = startMultiplier + (targetMultiplier - startMultiplier) * progress;
        multiplierElement.textContent = `${currentMultiplier.toFixed(2)}x`;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            const winChance = calculateWinChance(targetMultiplier);
            winChanceElement.textContent = `${winChance}%`;
            winChanceLabel.style.display = 'block';
            winChanceElement.style.display = 'block';
            localStorage.setItem('currentMultiplier', targetMultiplier);
            localStorage.setItem('currentWinChance', winChance);
        }
    }
    requestAnimationFrame(update);
}

// Обновление текстов при смене языка
function updateTexts(lang) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        element.textContent = translations[lang][key];
    });
    menuButton.textContent = translations[lang].menu_button;
    statusText.textContent = translations[lang].status_ready;
}

// Запуск анимации прогресс-бара
function startProgressAnimation() {
    isProgressRunning = true;
    progressStartTime = Date.now();
    localStorage.setItem('isProgressRunning', 'true');
    localStorage.setItem('progressStartTime', progressStartTime);

    statusText.textContent = translations[currentLang].status_waiting;
    statusText.style.display = 'block';

    function animate() {
        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min(elapsed / progressDuration, 1);
        progressFill.style.width = `${progress * 100}%`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isProgressRunning = false;
            localStorage.setItem('isProgressRunning', 'false');
            getSignalButton.disabled = false;
            progressFill.style.width = '0';
            statusText.textContent = translations[currentLang].status_ready;
            multiplierElement.textContent = '';
            winChanceElement.textContent = '';
            winChanceLabel.style.display = 'none';
            winChanceElement.style.display = 'none';
        }
    }
    requestAnimationFrame(animate);
}

// Создание звёзд на фоне
function createStars() {
    const starsContainer = document.getElementById('stars-container');
    if (!starsContainer) return;

    const starCount = 50;
    const circle = document.querySelector('.circle');
    const circleRect = circle.getBoundingClientRect();

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        let x, y;
        do {
            x = Math.random() * window.innerWidth;
            y = Math.random() * window.innerHeight;
        } while (
            x > circleRect.left - 50 &&
            x < circleRect.right + 50 &&
            y > circleRect.top - 50 &&
            y < circleRect.bottom + 50
        );

        star.style.top = `${y}px`;
        star.style.left = `${x}px`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

// Переключение языка
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.getElementById('language-button').textContent = lang.toUpperCase() + ' ▼';
    document.getElementById('flag-icon').src = `flags/${lang === 'ru' ? 'ru' : lang === 'en' ? 'us' : 'in'}.svg`;
    updateTexts(lang);
    document.querySelector('.language-switcher').classList.remove('active');
}

function toggleLanguageDropdown() {
    document.querySelector('.language-switcher').classList.toggle('active');
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';

    // Восстановление множителя и шанса
    if (currentMultiplier) {
        multiplierElement.textContent = `${currentMultiplier}x`;
        winChanceElement.textContent = `${currentWinChance}%`;
        winChanceLabel.style.display = 'block';
        winChanceElement.style.display = 'block';
    }

    // Проверка прогресса
    if (isProgressRunning) {
        const elapsed = Date.now() - progressStartTime;
        if (elapsed < progressDuration) {
            const remainingTime = progressDuration - elapsed;
            progressFill.style.width = `${(elapsed / progressDuration) * 100}%`;
            getSignalButton.disabled = true;
            statusText.textContent = translations[currentLang].status_waiting;

            setTimeout(() => {
                progressFill.style.transition = `width ${remainingTime}ms linear`;
                progressFill.style.width = '100%';
            }, 10);

            setTimeout(() => {
                isProgressRunning = false;
                localStorage.setItem('isProgressRunning', 'false');
                getSignalButton.disabled = false;
                progressFill.style.width = '0';
                statusText.textContent = translations[currentLang].status_ready;
                multiplierElement.textContent = '';
                winChanceElement.textContent = '';
            }, remainingTime);
        } else {
            isProgressRunning = false;
            localStorage.setItem('isProgressRunning', 'false');
        }
    }

    createStars();
});

// Обработчик кнопки "Получить сигнал"
getSignalButton.addEventListener('click', () => {
    if (isProgressRunning) return;
    clickSound.play();

    const targetMultiplier = generateMultiplier();
    animateMultiplier(targetMultiplier);
    getSignalButton.disabled = true;
    progressBar.style.display = 'block';
    startProgressAnimation();
});

// Ресайз окна
window.addEventListener('resize', () => {
    document.getElementById('stars-container').innerHTML = '';
    createStars();
});

// Установка языка по умолчанию
setLanguage(currentLang);