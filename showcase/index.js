// Load showcase beatmaps in
const preloadImageEl = document.getElementById("preload-image")
let allBeatamps
async function loadBeatmaps() {
    const response = await fetch("../_data/showcase-beatmaps.json")
    const responseJson = await response.json()
    allBeatamps = responseJson

    for (const key in allBeatamps) {
        // Get section element
        const sectionElementEl = document.getElementById(`left-section-${key.toLowerCase()}`).children[1]

        const beatmaps = allBeatamps[key];
        for (let i = 0; i < beatmaps.length; i++) {
            // Create element
            const leftSectionMap = document.createElement("div")
            leftSectionMap.classList.add("left-section-map")
            leftSectionMap.setAttribute("id", beatmaps[i].beatmap_id)

            const leftSectionMapMod = document.createElement("div")
            leftSectionMapMod.classList.add("left-section-map-mod")
            leftSectionMapMod.innerText = beatmaps[i].mod

            const leftSectionMapContainer = document.createElement("div")
            leftSectionMapContainer.classList.add("left-section-map-container", `left-section-map-container-${key.toLowerCase()}`)
            leftSectionMapContainer.style.backgroundImage = "url('')"

            const leftSectionMapModImage = document.createElement("img")
            leftSectionMapModImage.classList.add("left-section-map-mod-image")
            leftSectionMapModImage.setAttribute("src", `../_shared/assets/mod-icons/${key}-${i + 1}.png`)

            leftSectionMapContainer.append(leftSectionMapModImage)
            leftSectionMap.append(leftSectionMapMod, leftSectionMapContainer)
            sectionElementEl.append(leftSectionMap)

            // Preload image
            preloadImageEl.setAttribute("src", `https://assets.ppy.sh/beatmaps/${beatmaps[i].beatmapset_id}/covers/cover.jpg`)
        }
    }
}
loadBeatmaps()

// Get category by beatmap id
function getObjectByBeatmapId(id) {
    for (const category in allBeatamps) {
        const index = allBeatamps[category].findIndex(obj => obj.beatmap_id === id)
        if (index !== -1) {
            const obj = allBeatamps[category][index]
            return { ...obj, category, index }
        }
    }
    return null
}

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

// Right Section
const rightSectionBackgroundEl = document.getElementById("right-section-background")
const rightSectionModIconEl = document.getElementById("right-section-mod-icon")
const rightSectionModTextEl = document.getElementById("right-section-mod-text")

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

        // Find the right section
        const object = getObjectByBeatmapId(mapId)
        if (object) {
            // opacity 0 for all sections
            const leftSectionEls = document.getElementsByClassName("left-section")
            for (let i = 0; i < leftSectionEls.length; i++) {
                leftSectionEls[i].style.opacity = 0
            }

            // Set background as well
            document.getElementById(`left-section-${object.category.toLowerCase()}`).style.opacity = 1

            // all active elmeents
            const leftSectionMapEls = document.getElementsByClassName("left-section-map")
            for (let i = 0; i < leftSectionMapEls.length; i++) {
                leftSectionMapEls[i].classList.remove("left-section-map-active")
            }

            // Find right beatmap
            const beatmapTile = document.getElementById(`${mapId}`)
            beatmapTile.classList.add("left-section-map-active")
            beatmapTile.children[1].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${object.beatmapset_id}/covers/cover.jpg")`

            // Right Section
            rightSectionBackgroundEl.style.backgroundColor = `var(--background-${object.category.toLowerCase()})`
            rightSectionModIconEl.setAttribute("src", `../_shared/assets/mod-icons/${object.category}-${object.index + 1}.png`)
            rightSectionModTextEl.innerText = `- ${object.mod}`
        }
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