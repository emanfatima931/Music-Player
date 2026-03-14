// ============================================
// MUSIC DATA - LOCAL MP3 FILES
// ============================================

const musicData = [
    {
        id: 1,
        title: "Admirin You",
        artist: "Karan Aujla",
        duration: "3:30",
        cover: "images/image1.jpg",
        file: "songs/Admirin you.mp3",
        isFavorite: false
    },
    {
        id: 2,
        title: "Chan Sitare",
        artist: "Ammy Virk",
        duration: "3:18",
        cover: "images/image2.jpg",
        file: "songs/Chann sitare.mp3",
        isFavorite: false
    },
    {
        id: 3,
        title: "Do You Know",
        artist: "Diljit Dosanjh",
        duration: "3:45",
        cover: "images/image3.jpg",
        file: "songs/Do you know.mp3",
        isFavorite: false
    },
    {
        id: 4,
        title: "Fell For You",
        artist: "Shubh",
        duration: "2:54",
        cover: "images/image4.jpg",
        file: "songs/Fell for you.mp3",
        isFavorite: false
    },
    {
        id: 5,
        title: "Her",
        artist: "Shubh",
        duration: "5:00",
        cover: "images/image5.jpg",
        file: "songs/Her.mp3",
        isFavorite: false
    },
    {
        id: 6,
        title: "Pal Pal",
        artist: "Talwinder",
        duration: "3:53",
        cover: "images/image6.jpg",
        file: "songs/Pal pal.mp3",
        isFavorite: false
    },
    {
        id: 7,
        title: "Tere Liye",
        artist: "Atif Aslam",
        duration: "5:56",
        cover: "images/image7.jpg",
        file: "songs/Tere liye.mp3",
        isFavorite: false
    },
    {
        id: 8,
        title: "These Days",
        artist: "Sidhu Moosewala",
        duration: "5:12",
        cover: "images/image8.jpg",
        file: "songs/These days.mp3",
        isFavorite: false
    },
    {
        id: 9,
        title: "Wavy",
        artist: "Karan Aujla",
        duration: "5:12",
        cover: "images/image9.jpg",
        file: "songs/Wavy.mp3",
        isFavorite: false
    }
];

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentPlaylist = 'all';
let audio = new Audio();

// ============================================
// RECENT PLAYLIST 
// ============================================

// Initially empty - no songs in recent
let recentlyPlayed = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSongs();
    setupEventListeners();
    updateSongCount();
});

// ============================================
// LOAD SONGS
// ============================================

function loadSongs() {
    const songsList = document.getElementById('songsList');
    if (!songsList) return;
    
    songsList.innerHTML = '';
    
    let songsToShow = [];
    
    if (currentPlaylist === 'all') {
        songsToShow = musicData;
    } else if (currentPlaylist === 'favorites') {
        songsToShow = musicData.filter(song => song.isFavorite);
    } else if (currentPlaylist === 'recent') {
        songsToShow = recentlyPlayed.map(id => musicData.find(s => s.id === id)).filter(s => s);
    }
    
    if (songsToShow.length === 0) {
        songsList.innerHTML = '<div class="no-songs">No songs in this playlist</div>';
        return;
    }
    
    songsToShow.forEach((song, index) => {
        const originalIndex = musicData.findIndex(s => s.id === song.id);
        const songElement = createSongElement(song, originalIndex);
        songsList.appendChild(songElement);
    });
}

function createSongElement(song, index) {
    const div = document.createElement('div');
    div.className = 'song-item';
    div.innerHTML = `
        <img src="${song.cover}" alt="${song.title}" onerror="this.src='images/default.jpg'">
        <div class="song-info">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>
        <span class="song-duration">${song.duration}</span>
        <i class="fas ${song.isFavorite ? 'fa-heart' : 'fa-heart-o'} favorite-icon" data-id="${song.id}"></i>
        <i class="fas fa-play play-icon" data-index="${index}"></i>
    `;
    
    div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('play-icon') && !e.target.classList.contains('favorite-icon')) {
            playSong(index);
        }
    });
    
    div.querySelector('.play-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        playSong(index);
    });
    
    div.querySelector('.favorite-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(song.id, e.target);
    });
    
    return div;
}

// ============================================
// PLAYER FUNCTIONS
// ============================================

function playSong(index) {
    if (index < 0 || index >= musicData.length) return;
    
    const song = musicData[index];
    currentSongIndex = index;
    
    
    document.getElementById('currentCover').src = song.cover;
    document.getElementById('currentTitle').textContent = song.title;
    document.getElementById('currentArtist').textContent = song.artist;
    
    // Set audio source
    audio.src = song.file;
    audio.play();
    isPlaying = true;
    
    // play button
    document.getElementById('playPauseBtn').className = 'fas fa-pause-circle';
    
    // ============================================
    // ADD TO RECENTLY PLAYED (SESSION ONLY)
    // ============================================
    addToRecentlyPlayed(song.id);
    
    // Show player
    showMusicPlayer();
    
    // Highlight active song
    highlightActiveSong(index);
    
    // Update song count display
    updateSongCount();
    
    showNotification(`Playing: ${song.title}`);
}

function togglePlay() {
    if (!audio.src) {
        playSong(0);
        return;
    }
    
    if (isPlaying) {
        audio.pause();
        document.getElementById('playPauseBtn').className = 'fas fa-play-circle';
    } else {
        audio.play();
        document.getElementById('playPauseBtn').className = 'fas fa-pause-circle';
    }
    isPlaying = !isPlaying;
}

function playNext() {
    let songsInPlaylist = getCurrentPlaylistSongs();
    if (songsInPlaylist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * songsInPlaylist.length);
        nextIndex = musicData.findIndex(s => s.id === songsInPlaylist[randomIndex].id);
    } else {
        const currentSong = musicData[currentSongIndex];
        const currentInPlaylist = songsInPlaylist.findIndex(s => s.id === currentSong.id);
        
        if (currentInPlaylist !== -1) {
            const nextInPlaylist = (currentInPlaylist + 1) % songsInPlaylist.length;
            nextIndex = musicData.findIndex(s => s.id === songsInPlaylist[nextInPlaylist].id);
        } else {
            nextIndex = musicData.findIndex(s => s.id === songsInPlaylist[0].id);
        }
    }
    
    playSong(nextIndex);
}

function playPrevious() {
    let songsInPlaylist = getCurrentPlaylistSongs();
    if (songsInPlaylist.length === 0) return;
    
    const currentSong = musicData[currentSongIndex];
    const currentInPlaylist = songsInPlaylist.findIndex(s => s.id === currentSong.id);
    
    let prevIndex;
    if (currentInPlaylist !== -1) {
        const prevInPlaylist = (currentInPlaylist - 1 + songsInPlaylist.length) % songsInPlaylist.length;
        prevIndex = musicData.findIndex(s => s.id === songsInPlaylist[prevInPlaylist].id);
    } else {
        prevIndex = musicData.findIndex(s => s.id === songsInPlaylist[songsInPlaylist.length - 1].id);
    }
    
    playSong(prevIndex);
}

function getCurrentPlaylistSongs() {
    if (currentPlaylist === 'all') {
        return musicData;
    } else if (currentPlaylist === 'favorites') {
        return musicData.filter(song => song.isFavorite);
    } else if (currentPlaylist === 'recent') {
        return recentlyPlayed.map(id => musicData.find(s => s.id === id)).filter(s => s);
    }
    return musicData;
}

// ============================================
// AUDIO EVENT LISTENERS
// ============================================

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', handleSongEnd);
audio.addEventListener('loadedmetadata', () => {
    document.getElementById('duration').textContent = formatTime(audio.duration);
});

function updateProgress() {
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('currentTime');
    
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTime.textContent = formatTime(audio.currentTime);
    }
}

function handleSongEnd() {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNext();
    }
}

// ============================================
// PLAYLIST FUNCTIONS
// ============================================

function toggleFavorite(songId, iconElement) {
    const song = musicData.find(s => s.id === songId);
    if (song) {
        song.isFavorite = !song.isFavorite;
        
        iconElement.className = song.isFavorite ? 'fas fa-heart favorite-icon active' : 'fa-regular fa-heart favorite-icon';
        
        showNotification(song.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        
        
        if (currentPlaylist === 'favorites') {
            loadSongs();
        }
    }
}

// ============================================
// RECENT PLAYLIST FUNCTIONS
// ============================================

function addToRecentlyPlayed(songId) {
    // Remove if already exists
    recentlyPlayed = recentlyPlayed.filter(id => id !== songId);
    // Add to beginning
    recentlyPlayed.unshift(songId);
    // Keep only last 10 songs
    if (recentlyPlayed.length > 10) recentlyPlayed.pop();
    
    // Agar recent playlist active hai to refresh karo
    if (currentPlaylist === 'recent') {
        loadSongs();
    }
}

// Clear recent playlist
function clearRecentlyPlayed() {
    recentlyPlayed = [];
    showNotification('Recent playlist cleared');
    
    // Agar recent playlist active hai to refresh karo
    if (currentPlaylist === 'recent') {
        loadSongs();
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showMusicPlayer() {
    document.getElementById('musicPlayer').classList.remove('hidden');
}

function highlightActiveSong(index) {
    document.querySelectorAll('.song-item').forEach((item, i) => {
        if (i === index) {
            item.style.background = 'rgba(255, 107, 107, 0.3)';
        } else {
            item.style.background = 'rgba(255, 255, 255, 0.1)';
        }
    });
}

function updateSongCount() {
    const count = musicData.length;
    document.getElementById('songCount').textContent = `${count} songs`;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ============================================
// SEARCH FUNCTION
// ============================================

function searchSongs(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm === '') {
        loadSongs();
        return;
    }
    
    const filteredSongs = musicData.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.artist.toLowerCase().includes(searchTerm)
    );
    
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '';
    
    if (filteredSongs.length === 0) {
        songsList.innerHTML = '<div class="no-songs">No songs found</div>';
        return;
    }
    
    filteredSongs.forEach((song, index) => {
        const originalIndex = musicData.findIndex(s => s.id === song.id);
        const songElement = createSongElement(song, originalIndex);
        songsList.appendChild(songElement);
    });
}

// ============================================
// CONTROLS FUNCTIONS
// ============================================

function toggleShuffle() {
    isShuffle = !isShuffle;
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.style.color = isShuffle ? '#ff6b6b' : 'white';
    showNotification(isShuffle ? 'Shuffle on' : 'Shuffle off');
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    const repeatBtn = document.getElementById('repeatBtn');
    repeatBtn.style.color = isRepeat ? '#ff6b6b' : 'white';
    showNotification(isRepeat ? 'Repeat on' : 'Repeat off');
}

function toggleMute() {
    audio.muted = !audio.muted;
    const volumeIcon = document.getElementById('volumeIcon');
    volumeIcon.className = audio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
}

// ============================================
// NOTIFICATION
// ============================================

function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Player controls
    document.getElementById('playPauseBtn').addEventListener('click', togglePlay);
    document.getElementById('nextBtn').addEventListener('click', playNext);
    document.getElementById('prevBtn').addEventListener('click', playPrevious);
    document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
    document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);
    
    // Volume
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        audio.volume = e.target.value;
        document.getElementById('volumeIcon').className = 
            audio.volume === 0 ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    });
    
    document.getElementById('volumeIcon').addEventListener('click', toggleMute);
    
    // Progress bar seeking
    document.getElementById('progressBar').addEventListener('click', (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const barWidth = progressBar.offsetWidth;
        const seekTime = (clickPosition / barWidth) * audio.duration;
        audio.currentTime = seekTime;
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchSongs(e.target.value);
    });
    
    // Playlist clicks
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const playlist = item.dataset.playlist;
            currentPlaylist = playlist;
            loadSongs();
            
            showNotification(`Showing ${playlist} playlist`);
        });
    });
    
    // ============================================
    // CLEAR RECENT BUTTON
    // ============================================
    document.getElementById('clearRecentBtn').addEventListener('click', (e) => {
        e.stopPropagation(); // Playlist click ko rokne ke liye
        clearRecentlyPlayed();
    });
}