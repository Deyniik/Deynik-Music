// Глобальное состояние
class AppState {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.volume = 70;
        this.currentPage = 'home';
        this.currentAlbum = null;
    }
}

// Глобальный плеер
class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.state = new AppState();
        this.init();
    }
    
    init() {
        // Плеер живет отдельно от страниц
        this.renderPlayer();
        this.setupEventListeners();
    }
    
    playTrack(track) {
        this.state.currentTrack = track;
        this.audio.src = track.url;
        this.audio.play();
        this.updateUI();
    }
    
    renderPlayer() {
        const playerHTML = `
            <div class="player-container">
                <div class="now-playing">
                    <img src="${this.state.currentTrack?.cover}" alt="Cover">
                    <div class="track-info">
                        <div class="title">${this.state.currentTrack?.name}</div>
                        <div class="artist">${this.state.currentTrack?.artist}</div>
                    </div>
                </div>
                <div class="controls">
                    <button class="play-btn">${this.state.isPlaying ? '❚❚' : '▶'}</button>
                </div>
                <div class="volume">
                    <input type="range" class="volume-slider" value="${this.state.volume}">
                </div>
            </div>
        `;
        document.getElementById('player-root').innerHTML = playerHTML;
    }
}

// Роутер для навигации
class Router {
    constructor() {
        this.routes = {
            '/': 'Home',
            '/album/:id': 'AlbumPage',
            '/search': 'SearchPage'
        };
        this.init();
    }
    
    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.href);
            }
        });
    }
    
    navigate(url) {
        window.history.pushState(null, null, url);
        this.handleRoute();
    }
    
    handleRoute() {
        const path = window.location.pathname;
        
        // Очищаем основной контейнер
        const app = document.getElementById('app');
        app.innerHTML = '';
        
        // Рендерим новую страницу
        if (path === '/') {
            this.renderHomePage();
        } else if (path.startsWith('/album/')) {
            const albumId = path.split('/album/')[1];
            this.renderAlbumPage(albumId);
        }
    }
    
    renderHomePage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="home-page">
                <h1>Главная</h1>
                <div class="albums-grid">
                    ${this.renderAlbumCards()}
                </div>
            </div>
        `;
    }
    
    renderAlbumPage(albumId) {
        const album = this.getAlbumData(albumId);
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="album-page">
                <div class="album-header">
                    <img src="${album.cover}" alt="${album.title}">
                    <h1>${album.title}</h1>
                    <p>${album.artist}</p>
                </div>
                <div class="tracks-list">
                    ${album.tracks.map(track => `
                        <div class="track-item" data-track-id="${track.id}">
                            <span class="track-number">${track.number}</span>
                            <span class="track-title">${track.title}</span>
                            <span class="track-duration">${track.duration}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Инициализация приложения
class App {
    constructor() {
        this.player = new MusicPlayer();
        this.router = new Router();
        this.init();
    }
    
    init() {
        // Приложение запускается здесь
        this.router.handleRoute(); // Рендерим начальную страницу
    }
}

// Запуск приложения
new App();
