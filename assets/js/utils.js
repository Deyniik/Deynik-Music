// Функция загрузки компонентов
async function loadComponent(componentName, targetElementId) {
    try {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(targetElementId).innerHTML = html;
    } catch (error) {
        console.error(`Ошибка загрузки компонента ${componentName}:`, error);
        // Резервный контент на случай ошибки
        document.getElementById(targetElementId).innerHTML = `<div>Ошибка загрузки ${componentName}</div>`;
    }
}

// Функция загрузки всех компонентов
async function loadAllComponents() {
    await Promise.all([
        loadComponent('header', 'header-container'),
        loadComponent('left-panel', 'left-panel-container'),
        loadComponent('right-panel', 'right-panel-container'),
        loadComponent('player', 'player-container')
    ]);
}

// Функция для возврата на главную
function goBack() {
    // Сохраняем состояние перед переходом
    savePlayerState();
    window.location.href = 'index.html';
}

// Сохранение состояния плеера
function savePlayerState() {
    if (window.playerState && window.playerState.audio) {
        sessionStorage.setItem('playerState', JSON.stringify({
            currentTrackId: window.playerState.currentTrackId,
            isPlaying: window.playerState.isPlaying,
            currentTime: window.playerState.audio.currentTime,
            volume: window.playerState.volume
        }));
    }
}

// Восстановление состояния плеера
function restorePlayerState() {
    const savedState = sessionStorage.getItem('playerState');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (window.playerState) {
            window.playerState.currentTrackId = state.currentTrackId;
            window.playerState.isPlaying = state.isPlaying;
            window.playerState.currentTime = state.currentTime;
            window.playerState.volume = state.volume;
        }
        return state;
    }
    return null;
}

// Показать уведомление
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Форматирование времени
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
