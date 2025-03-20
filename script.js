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

// Функция для плавной генерации множителя
function generateMultiplier() {
    const minMultiplier = 1.0;
    const maxMultiplier = 10.0;
    return (Math.random() * (maxMultiplier - minMultiplier) + minMultiplier).toFixed(2);
}

// Функция для расчета шанса в зависимости от множителя
function calculateWinChance(multiplier) {
    if (multiplier >= 1.00 && multiplier <= 4.00) {
        return (Math.random() * (97.00 - 90.00) + 90.00).toFixed(2);
    } else if (multiplier > 4.00 && multiplier <= 10.00) {
        return (Math.random() * (89.00 - 70.00) + 70.00).toFixed(2);
    }
    return 0.00;
}

// Функция для плавного изменения множителя
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

            // Сохраняем множитель и шанс
            localStorage.setItem('currentMultiplier', targetMultiplier);
            localStorage.setItem('currentWinChance', winChance);
        }
    }
    requestAnimationFrame(update);
}

// Функция для обновления текстов
function updateTexts(lang) {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        element.textContent = translations[lang][key];
    });
    menuButton.textContent = translations[lang].menu_button;
    statusText.textContent = translations[lang].status_ready;
}

// Функция для запуска анимации прогресса
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

            progressBar.classList.add('complete');
            setTimeout(() => progressBar.classList.remove('complete'), 1000);

            progressFill.style.transition = 'none';
            progressFill.style.width = '0';
            progressBar.style.display = 'none';

            statusText.textContent = translations[currentLang].status_ready;

            // Скрываем множитель и шанс
            multiplierElement.textContent = '';
            winChanceElement.textContent = '';
            winChanceLabel.style.display = 'none';
            winChanceElement.style.display = 'none';
        }
    }
    requestAnimationFrame(animate);
}

// Функция для сброса прогресса
function resetProgress() {
    progressFill.style.width = '0';
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }

    // Восстановление множителя и шанса
    if (currentMultiplier) {
        multiplierElement.textContent = `${currentMultiplier}x`;
    }
    if (currentWinChance) {
        winChanceElement.textContent = `${currentWinChance}%`;
        winChanceLabel.style.display = 'block';
        winChanceElement.style.display = 'block';
    }

    if (isProgressRunning) {
        const elapsed = Date.now() - progressStartTime;
        if (elapsed < progressDuration) {
            const remainingTime = progressDuration - elapsed;

            progressFill.style.width = `${(elapsed / progressDuration) * 100}%`;

            setTimeout(() => {
                progressFill.style.transition = `width ${remainingTime}ms linear`;
                progressFill.style.width = '100%';
            }, 10);

            getSignalButton.disabled = true;

            statusText.textContent = translations[currentLang].status_waiting;
            statusText.style.display = 'block';

            setTimeout(() => {
                isProgressRunning = false;
                localStorage.setItem('isProgressRunning', 'false');
                getSignalButton.disabled = false;

                progressFill.style.transition = 'none';
                progressFill.style.width = '0';
                progressBar.style.display = 'none';

                statusText.textContent = translations[currentLang].status_ready;

                // Скрываем множитель и шанс
                multiplierElement.textContent = '';
                winChanceElement.textContent = '';
                winChanceLabel.style.display = 'none';
                winChanceElement.style.display = 'none';
            }, remainingTime);
        } else {
            isProgressRunning = false;
            localStorage.setItem('isProgressRunning', 'false');
            getSignalButton.disabled = false;

            progressFill.style.transition = 'none';
            progressFill.style.width = '0';
            progressBar.style.display = 'none';

            statusText.textContent = translations[currentLang].status_ready;
            statusText.style.display = 'block';

            // Скрываем множитель и шанс
            multiplierElement.textContent = '';
            winChanceElement.textContent = '';
            winChanceLabel.style.display = 'none';
            winChanceElement.style.display = 'none';
        }
    } else {
        statusText.textContent = translations[currentLang].status_ready;
        statusText.style.display = 'block';

        progressBar.style.display = 'none';
    }

    createStars();
});

// Обработчик нажатия на кнопку
getSignalButton.addEventListener('click', () => {
    if (isProgressRunning) return;

    clickSound.play();

    // Очищаем сохраненные данные при начале нового цикла
    localStorage.removeItem('currentMultiplier');
    localStorage.removeItem('currentWinChance');

    const targetMultiplier = generateMultiplier();
    animateMultiplier(targetMultiplier);

    getSignalButton.disabled = true;

    progressBar.style.display = 'block';
    resetProgress();

    startProgressAnimation();
});

// Создание звездочек
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
            x > circleRect.left &&
            x < circleRect.right &&
            y > circleRect.top &&
            y < circleRect.bottom
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
    const languageButton = document.getElementById('language-button');
    languageButton.textContent = lang.toUpperCase() + ' ▼';

    const flagIcon = document.getElementById('flag-icon');
    flagIcon.src = `flags/${lang === 'ru' ? 'ru' : lang === 'en' ? 'us' : 'in'}.svg`;

    updateTexts(lang);
    document.querySelector('.language-switcher').classList.remove('active');
}

function toggleLanguageDropdown() {
    const switcher = document.querySelector('.language-switcher');
    switcher.classList.toggle('active');
}

// Установка языка по умолчанию
setLanguage(currentLang);

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    const starsContainer = document.getElementById('stars-container');
    starsContainer.innerHTML = '';
    createStars();
});