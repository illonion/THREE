// Now Playing Details
const nowPlayingArtistEl = document.getElementById("now-playing-artist")
const nowPlayingSongNameEl = document.getElementById("now-playing-song-name")
const nowPlayingCurrentTimeEl = document.getElementById("now-playing-current-time")
const nowPlayingTimeProgressEl = document.getElementById("now-playing-time-progress")
const nowPlayingEndTimeEl = document.getElementById("now-playing-end-time")
const nowPlayingMapBackgroundEl = document.getElementById("now-playing-map-background")
let mapId, mapMd5

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)
    
    // Map metadata
    if (mapId !== data.menu.bm.id || mapMd5 !== data.menu.bm.md5) {
        mapId = data.menu.bm.id
        mapMd5 = data.menu.bm.md5

        nowPlayingArtistEl.innerText = data.menu.bm.metadata.artist
        nowPlayingSongNameEl.innerText = data.menu.bm.metadata.title
        nowPlayingMapBackgroundEl.style.backgroundImage = `url('http://127.0.0.1:24050/Songs/${data.menu.bm.path.folder}/${data.menu.bm.path.bg}')`
    }

    // Constantly changing time
    displayTimeMs(nowPlayingCurrentTimeEl, data.menu.bm.time.current)
    nowPlayingTimeProgressEl.style.width = `${data.menu.bm.time.current / data.menu.bm.time.mp3 * 367}px`
    displayTimeMs(nowPlayingEndTimeEl, data.menu.bm.time.mp3)
}