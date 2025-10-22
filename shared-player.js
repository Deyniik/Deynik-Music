// ОБЩИЙ СКРИПТ ПЛЕЕРА ДЛЯ ВСЕХ СТРАНИЦ
class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 70;
        this.currentTime = 0;
        
        // Данные (одинаковые для всех страниц)
        this.tracksData = {
            'taylor-swift': {
                id: 'taylor-swift',
                name: 'The Fate of Ophelia',
                artist: 'Taylor Swift',
                url: 'https://s3.k-connect.ru/static/music/1475/5132/1761060712_Taylor_Swift_-_The_Fate_of_Ophelia.flac',
                cover: 'https://s3.k-connect.ru/static/music/1475/5132/1761060712_cover.jpeg',
                icon: 'fas fa-heart',
                likes: 0,
                category: 'taylor',
                description: 'Уютная акустическая версия с элементами фолк-музыки. Идеально подходит для спокойного вечера.',
                quality: 'FLAC'
            },
            'wood': {
                id: 'wood',
                name: 'Wood',
                artist: 'Taylor Swift',
                url: 'https://s3.k-connect.ru/static/music/1475/5144/1761068612_Taylor_Swift_-_Wood.flac',
                cover: 'https://s3.k-connect.ru/static/music/1475/5132/1761060712_cover.jpeg',
                icon: 'fas fa-tree',
                likes: 0,
                category: 'taylor',
                description: 'Акустическая баллада с теплым звучанием и лирическими текстами.',
                quality: 'FLAC'
            },
            // ... все остальные треки
        };

        this.albumsData = {
            'the-life-of-a-showgirl': {
                id: 'the-life-of-a-showgirl',
                title: 'The Life of a Showgirl',
                artist: 'Taylor Swift',
                cover: 'https://s3.k-connect.ru/static/music/1475/5132/1761060712_cover.jpeg',
                year: '2024',
                tracks: ['taylor-swift', 'wood', 'wish-list', 'the-life-of-a-showgirl', 'ruin-the-friendship', 'opalite', 'honey', 'father-figure', 'elizabeth-taylor', 'eldest-daughter', 'cancelled', 'actually-romantic']
            },
            'the-fame-monster': {
                id: 'the-fame-monster',
                title: 'The Fame Monster',
                artist: 'Lady Gaga',
                cover: 'https://s3.k-connect.ru/static/music/3/4763/1758141423_Lady_Gaga_-_Money_Honey_1758141423477_cover.jpg',
                year: '2009',
                tracks: ['lady-gaga-money']
            },
            'born-this-way': {
                id: 'born-this-way',
                title: 'Born This Way',
                artist: 'Lady Gaga',
                cover: 'https://s3.k-connect.ru/static/music/3/4754/1758141420_Lady_Gaga_-_Scheie_1758141419969_cover.jpg',
                year: '2011',
                tracks: ['lady-gaga-scheie']
            }
        };
    }

    init() {
        this.setupEventListeners();
        this.renderTrackList();
        
        // Восстанавливаем состояние из localStorage
        this.restoreState();
    }

    setupEventListeners() {
        // Основные кнопки плеера
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousTrack());
        document.getElementById('next-btn').addEventListener('click', () => this.nextTrack());
        document.getElementById('like-btn').addEventListener('click', () => this.toggleLike());
        document.getElementById('random-track-btn').addEventListener('click', () => this.playRandomTrack());
        
        // Слайдеры
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
        document.getElementById('progress-slider').addEventListener('input', (e) => {
            this.setProgress(e.target.value);
        });

        // События аудио
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextTrack());
    }

    // ВСЕ МЕТОДЫ ПЛЕЕРА (playTrack, togglePlay, previousTrack, nextTrack, etc.)
    // ... вставь ВСЕ методы из предыдущего кода ...

    // Сохранение состояния в localStorage
    saveState() {
        const state = {
            currentTrackId: this.currentTrack?.id,
            isPlaying: this.isPlaying,
            volume: this.volume,
            currentTime: this.currentTime
        };
        localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }

    // Восстановление состояния из localStorage
    restoreState() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.volume = state.volume || 70;
            this.currentTime = state.currentTime || 0;
            
            document.getElementById('volume-slider').value = this.volume;
            
            if (state.currentTrackId) {
                this.playTrack(state.currentTrackId);
                if (state.isPlaying) {
                    this.audio.currentTime = this.currentTime;
                    this.audio.play().catch(() => {
                        console.log('Autoplay blocked');
                    });
                }
            }
        }
    }
}

// Создаем глобальный экземпляр плеера
window.musicPlayer = new MusicPlayer();
