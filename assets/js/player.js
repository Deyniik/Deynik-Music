// Инициализация навигации
function initializeNavigation() {
    setupAlbumNavigation();
    setupThemeSwitcher();
}

// Настройка навигации по альбомам
function setupAlbumNavigation() {
    const albumCards = document.querySelectorAll('.album-card');
    
    albumCards.forEach(card => {
        card.addEventListener('click', function() {
            const album = this.getAttribute('data-album');
            
            // Сохраняем состояние перед переходом
            savePlayerState();
            
            // Переходим на страницу альбома
            if (album === 'the-life-of-a-showgirl') {
                window.location.href = 'The_Life_of_a_Showgirl.html';
            }
            // Можно добавить другие альбомы
        });
    });
}

// Настройка переключения темы
function setupThemeSwitcher() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', function() {
            document.body.classList.toggle('retro-theme');
            if (document.body.classList.contains('retro-theme')) {
                this.innerHTML = '<i class="fas fa-palette"></i> Ретро';
            } else {
                this.innerHTML = '<i class="fas fa-palette"></i> Современная';
            }
        });
    }
}

// Загрузка треков альбома (для страницы альбома)
function loadAlbumTracks() {
    const tracksList = document.getElementById('tracks-list');
    if (!tracksList) return;

    // Очищаем существующий список
    const existingHeader = tracksList.querySelector('.tracks-header');
    if (existingHeader) {
        tracksList.innerHTML = '';
    }

    // Добавляем заголовок
    const header = document.createElement('div');
    header.className = 'tracks-header';
    header.innerHTML = `
        <div>#</div>
        <div>Название</div>
        <div>Длительность</div>
        <div></div>
    `;
    tracksList.appendChild(header);

    // Добавляем треки
    Object.keys(window.tracks).forEach((trackId, index) => {
        const track = window.tracks[trackId];
        const trackItem = document.createElement('div');
        trackItem.className = `track-item ${trackId === window.playerState.currentTrackId ? 'active' : ''}`;
        trackItem.setAttribute('data-track', trackId);
        
        trackItem.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="track-title">${track.name}</div>
                <div class="track-artist">${track.currentArtist}</div>
            </div>
            <div class="track-duration">${track.duration}</div>
            <div class="track-likes">
                <span class="likes-count">${track.likes}</span>
                <i class="far fa-heart"></i>
            </div>
        `;
        
        trackItem.addEventListener('click', function() {
            playTrack(trackId);
        });
        
        // Обработчик для лайков в списке альбома
        const likeElement = trackItem.querySelector('.track-likes');
        likeElement.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleTrackLike(trackId);
        });
        
        tracksList.appendChild(trackItem);
    });
}

// Воспроизведение трека
function playTrack(trackId) {
    window.playerState.isPlaying = true;
    changeTrack(trackId);
    showNotification(`Выбран трек: ${window.tracks[trackId].name}`);
}

// Воспроизведение предыдущего трека
function playPreviousTrack() {
    const trackIds = Object.keys(window.tracks);
    const currentIndex = trackIds.indexOf(window.playerState.currentTrackId);
    const prevIndex = (currentIndex - 1 + trackIds.length) % trackIds.length;
    playTrack(trackIds[prevIndex]);
}

// Воспроизведение следующего трека
function playNextTrack() {
    const trackIds = Object.keys(window.tracks);
    const currentIndex = trackIds.indexOf(window.playerState.currentTrackId);
    const nextIndex = (currentIndex + 1) % trackIds.length;
    playTrack(trackIds[nextIndex]);
}

// Случайный трек
function playRandomTrack() {
    const trackIds = Object.keys(window.tracks);
    const randomIndex = Math.floor(Math.random() * trackIds.length);
    playTrack(trackIds[randomIndex]);
}

// Переключение лайка
function toggleLike() {
    const track = window.tracks[window.playerState.currentTrackId];
    if (!track) return;
    
    const isLiked = track.likes === 0;
    track.likes = isLiked ? 1 : 0;
    
    const likeButton = document.getElementById('like-btn');
    if (likeButton) {
        if (isLiked) {
            likeButton.innerHTML = '<i class="fas fa-heart"></i>';
            likeButton.classList.add('active');
            showNotification('Трек добавлен в избранное');
        } else {
            likeButton.innerHTML = '<i class="far fa-heart"></i>';
            likeButton.classList.remove('active');
            showNotification('Трек удален из избранного');
        }
    }
    
    updateLikesCount();
}

// Переключение лайка для конкретного трека
function toggleTrackLike(trackId) {
    const track = window.tracks[trackId];
    if (!track) return;
    
    track.likes = track.likes === 0 ? 1 : 0;
    
    // Обновляем интерфейс если это текущий трек
    if (trackId === window.playerState.currentTrackId) {
        const likeButton = document.getElementById('like-btn');
        if (likeButton) {
            if (track.likes === 1) {
                likeButton.innerHTML = '<i class="fas fa-heart"></i>';
                likeButton.classList.add('active');
            } else {
                likeButton.innerHTML = '<i class="far fa-heart"></i>';
                likeButton.classList.remove('active');
            }
        }
    }
    
    updateLikesCount();
    
    if (track.likes === 1) {
        showNotification('Трек добавлен в избранное');
    }
}

// Обновление счетчика лайков
function updateLikesCount() {
    const track = window.tracks[window.playerState.currentTrackId];
    if (!track) return;
    
    // Обновляем во всех местах
    document.querySelectorAll(`[data-track="${window.playerState.currentTrackId}"] .likes-count`).forEach(element => {
        element.textContent = track.likes;
    });
    
    const likesCountBottom = document.getElementById('likes-count-bottom');
    if (likesCountBottom) {
        likesCountBottom.textContent = track.likes;
    }
}

// Обновление интерфейса для трека
function updateInterfaceForTrack(trackId) {
    const track = window.tracks[trackId];
    if (!track) return;
    
    // Обновляем текстовую информацию
    const elementsToUpdate = {
        'player-station': track.name,
        'player-description': track.description,
        'current-station': track.name,
        'current-artist-info': track.currentArtist,
        'quality': track.quality,
        'track-description': track.descriptionText
    };
    
    Object.entries(elementsToUpdate).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Обновляем обложки
    const albumCover = document.getElementById('album-cover');
    const playerIcon = document.getElementById('player-icon');
    
    if (albumCover) albumCover.src = track.cover;
    if (playerIcon) playerIcon.innerHTML = `<img src="${track.cover}" alt="Обложка трека">`;
    
    // Обновляем активные элементы
    document.querySelectorAll('[data-track]').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-track') === trackId) {
            item.classList.add('active');
        }
    });
    
    updateLikesCount();
}

// Обработчики для громкости и прогресса
function handleVolumeChange(e) {
    if (window.playerState.audio) {
        window.playerState.audio.volume = e.target.value / 100;
        window.playerState.volume = e.target.value;
    }
}

function handleProgressChange(e) {
    stopProgressUpdate();
    
    if (window.playerState.audio && window.playerState.audio.duration) {
        const newTime = (e.target.value / 100) * window.playerState.audio.duration;
        window.playerState.audio.currentTime = newTime;
        
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(newTime);
        }
        
        window.playerState.currentTime = newTime;
    }
}

function handleProgressChangeEnd() {
    if (window.playerState.isPlaying) {
        startProgressUpdate();
    }
}

// Управление прогресс-баром
let progressInterval = null;

function startProgressUpdate() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(updateProgressDisplay, 100);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgressDisplay() {
    if (!window.playerState.audio || !window.playerState.audio.duration) return;
    
    const progress = (window.playerState.audio.currentTime / window.playerState.audio.duration) * 100;
    const progressSlider = document.getElementById('progress-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    if (progressSlider) progressSlider.value = progress;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(window.playerState.audio.currentTime);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(window.playerState.audio.duration);
    
    window.playerState.currentTime = window.playerState.audio.currentTime;
}

// Обработчик завершения трека
function handleTrackEnd() {
    playNextTrack();
}
