// Now Playing Metadata
const nowPlayingArtistEl = document.getElementById("now-playing-artist")
const nowPlayingTitleEl = document.getElementById("now-playing-title")
const nowPlayingDifficultyEl = document.getElementById("now-playing-difficulty")
const nowPlayingMapperNameEl = document.getElementById("now-playing-mapper-name")
const nowPlayingReplayerNameEl = document.getElementById("now-playing-replayer-name")
let mapId, mapMd5

// Now Playing Stats
const nowPlayingStatsLengthEl = document.getElementById("now-playing-stats-length")
const nowPlayingStatsBpmEl = document.getElementById("now-playing-stats-bpm")
const nowPlayingStatsCirclesEl = document.getElementById("now-playing-stats-circles")
const nowPlayingStatsSlidersEl = document.getElementById("now-playing-stats-sliders")
const nowPlayingStatsCsEl = document.getElementById("now-playing-stats-cs")
const nowPlayingStatsArEl = document.getElementById("now-playing-stats-ar")
const nowPlayingStatsOdEl = document.getElementById("now-playing-stats-od")
const nowPlayingStatsSrEl = document.getElementById("now-playing-stats-sr")

// Bottom Section
const bottomSectionCurrentTimeEl = document.getElementById("bottom-section-current-time")
const bottomSectionProgressBarEl = document.getElementById("bottom-section-progress-bar")
const bottomSectionEndTimeEl = document.getElementById("bottom-section-end-time")

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Update metadata and stats
    if (mapId !== data.menu.bm.id || mapMd5 !== data.menu.bm.md5) {
        mapId = data.menu.bm.id
        mapMd5 = data.menu.bm.md5

        nowPlayingArtistEl.innerText = data.menu.bm.metadata.artist
        nowPlayingTitleEl.innerText = data.menu.bm.metadata.title
        nowPlayingDifficultyEl.innerText = `[${data.menu.bm.metadata.difficulty}]`
        nowPlayingMapperNameEl.innerText = data.menu.bm.metadata.mapper
    }

    // Update stats
    if (data.resultsScreen.mods.str.includes('DT') || data.resultsScreen.mods.str.includes('DT')) displayTimeMs(nowPlayingStatsLengthEl, Math.round((data.menu.bm.time.full - data.menu.bm.time.firstObj) / 3 * 2))
    else displayTimeMs(nowPlayingStatsLengthEl, data.menu.bm.time.full - data.menu.bm.time.firstObj)
    nowPlayingStatsCirclesEl.innerText = data.menu.bm.stats.circles
    nowPlayingStatsSlidersEl.innerText = data.menu.bm.stats.sliders
    nowPlayingStatsCsEl.innerText = data.menu.bm.stats.CS
    nowPlayingStatsArEl.innerText = data.menu.bm.stats.AR
    nowPlayingStatsOdEl.innerText = data.menu.bm.stats.OD
    nowPlayingStatsSrEl.innerText = data.menu.bm.stats.fullSR
    if (data.menu.bm.stats.BPM.min !== data.menu.bm.stats.BPM.max) nowPlayingStatsBpmEl.innerText = `${data.menu.bm.stats.BPM.min} - ${data.menu.bm.stats.BPM.max}`
    else nowPlayingStatsBpmEl.innerText = data.menu.bm.stats.BPM.min

    // Replayer Name
    nowPlayingReplayerNameEl.innerText = (data.gameplay.name !== "")? data.gameplay.name : data.resultsScreen.name

    // Bottom Section
    if (data.resultsScreen.mods.str.includes('DT') || data.resultsScreen.mods.str.includes('DT')) {
        displayTimeMs(bottomSectionCurrentTimeEl, Math.round(data.menu.bm.time.current / 3 * 2))
        displayTimeMs(bottomSectionEndTimeEl, Math.round(data.menu.bm.time.mp3 / 3 * 2))
    } else {
        displayTimeMs(bottomSectionCurrentTimeEl, data.menu.bm.time.current)
        displayTimeMs(bottomSectionEndTimeEl, data.menu.bm.time.mp3)
    }
    bottomSectionProgressBarEl.style.width = `${data.menu.bm.time.current / data.menu.bm.time.mp3 * 367}px`
}