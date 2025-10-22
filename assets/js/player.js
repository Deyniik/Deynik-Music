// Основная функция инициализации плеера
function initializePlayer() {
    // Восстанавливаем состояние
    const savedState = restorePlayerState();
    
    // Инициализируем элементы после загрузки DOM
    setTimeout(() => {
        setupPlayerEventListeners();
        initializeTrackList();
        
        // Восстанавливаем состояние интерфейса
        if (savedState && window.tracks[savedState.currentTrackId]) {
            updateInterfaceForTrack(savedState.currentTrackId);
            
            // Восстанавливаем воспроизведение если нужно
            if (savedState.isPlaying && window.playerState.audio) {
                window.playerState.audio.currentTime = savedState.currentTime;
                window.playerState.audio.volume = savedState.volume / 100;
                updateProgressDisplay();
            }
        } else {
            // Инициализация первого трека
            changeTrack(window.playerState.currentTrackId);
        }
    }, 100);
}

// Настройка обработчиков событий плеера
function setupPlayerEventListeners() {
    const playBtn = document.getElementById('play-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const likeButton = document.getElementById('like-btn');
    const randomTrackBtn = document.getElementById('random-track-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressSlider = document.getElementById('progress-slider');
    const albumPlayBtn = document.getElementById('album-play-btn');

    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', playPreviousTrack);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', playNextTrack);
    }
    
    if (likeButton) {
        likeButton.addEventListener('click', toggleLike);
    }
    
    if (randomTrackBtn) {
        randomTrackBtn.addEventListener('click', playRandomTrack);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', handleVolumeChange);
    }
    
    if (progressSlider) {
        progressSlider.addEventListener('input', handleProgressChange);
        progressSlider.addEventListener('change', handleProgressChangeEnd);
    }
    
    if (albumPlayBtn) {
        albumPlayBtn.addEventListener('click', togglePlay);
    }

    // Обработчик завершения трека
    if (window.playerState.audio) {
        window.playerState.audio.addEventListener('ended', handleTrackEnd);
    }

    // Сохранение состояния при закрытии страницы
    window.addEventListener('beforeunload', savePlayerState);
}

// Инициализация списка треков
function initializeTrackList() {
    const stationList = document.getElementById('station-list');
    if (!stationList) return;

    stationList.innerHTML = '';
    
    Object.keys(window.tracks).forEach(trackId => {
        const track = window.tracks[trackId];
        const li = document.createElement('li');
        li.setAttribute('data-track', trackId);
        
        if (trackId === window.playerState.currentTrackId) {
            li.classList.add('active');
        }
        
        li.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span class="station-icon"><i class="${track.icon}"></i></span> ${track.name}
            </div>
            <div class="station-likes">
                <span class="likes-count">${track.likes}</span> <i class="far fa-heart"></i>
            </div>
        `;
        
        li.addEventListener('click', function() {
            playTrack(trackId);
        });
        
        stationList.appendChild(li);
    });

    // Настройка категорий
    setupCategoryFilters();
}

// Настройка фильтров по категориям
function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Обновление активной кнопки
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Показ/скрытие треков по категории
            const trackItems = document.querySelectorAll('.station-list li');
            trackItems.forEach(item => {
                const trackId = item.getAttribute('data-track');
                const trackCategory = window.tracks[trackId]?.category;
                
                if (category === 'all' || trackCategory === category) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Воспроизведение/пауза
function togglePlay() {
    if (window.playerState.isPlaying) {
        pauseTrack();
    } else {
        playCurrentTrack();
    }
}

// Воспроизведение текущего трека
function playCurrentTrack() {
    if (!window.playerState.audio) return;
    
    window.playerState.audio.play().then(() => {
        window.playerState.isPlaying = true;
        updatePlayButtons(true);
        startProgressUpdate();
    }).catch(error => {
        console.error('Ошибка воспроизведения:', error);
        showNotification('Ошибка воспроизведения трека');
    });
}

// Пауза трека
function pauseTrack() {
    if (!window.playerState.audio) return;
    
    window.playerState.audio.pause();
    window.playerState.isPlaying = false;
    updatePlayButtons(false);
    stopProgressUpdate();
}

// Обновление кнопок воспроизведения
function updatePlayButtons(isPlaying) {
    const playBtn = document.getElementById('play-btn');
    const albumPlayBtn = document.getElementById('album-play-btn');
    
    if (playBtn) {
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
    
    if (albumPlayBtn) {
        albumPlayBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
}

// Смена трека
function changeTrack(trackId) {
    if (!window.tracks[trackId]) return;
    
    const track = window.tracks[trackId];
    window.playerState.currentTrackId = trackId;
    
    // Обновление интерфейса
    updateInterfaceForTrack(trackId);
    
    // Останавливаем текущее воспроизведение
    if (window.playerState.audio) {
        window.playerState.audio.pause();
    }
    
    // Создаем новый аудио объект
    window.playerState.audio = new Audio(track.url);
    window.playerState.audio.volume = window.playerState.volume / 100;
    
    // Настройка обработчиков для нового аудио
    window.playerState.audio.addEventListener('ended', handleTrackEnd);
    
    // Если был режим воспроизведения, продолжаем
    if (window.playerState.isPlaying) {
        playCurrentTrack();
    }
    
    // Добавляем трек в список проигранных
    window.playedTracks = window.playedTracks || new Set();
    window.playedTracks.add(trackId);
}

// Продолжение в следующем сообщении...
