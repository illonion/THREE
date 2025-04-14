// Get osu! API
let osuApi
async function getOsuApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}
getOsuApi()

// Round Text
let allBeatmaps
const roundTextEl = document.getElementById("round-text")
async function getBeatmaps() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps
    
    roundName = responseJson.roundName
    roundTextEl.innerText = roundName
    currentBestOf = 13
    switch (roundName) {
        case "RO32": case "RO16":
            currentBestOf = 9
            break
        case "QF": case "SF":
            currentBestOf = 11
            break
    }
    currentFirstTo = Math.ceil(currentBestOf / 2)
}
getBeatmaps()

function findBeatmapById(beatmapId) {
    for (const category in allBeatmaps) {
        const beatmaps = allBeatmaps[category]
        const result = beatmaps.find(beatmap => beatmap.beatmap_id === beatmapId)
        if (result) return result
    }
    return null
}

function getCategoryByBeatmapId(id) {
    for (const category in allBeatmaps) {
        if (allBeatmaps[category].some(obj => obj.beatmap_id === id)) {
            return category
        }
    }
    return null
}

// Final scores
const redFinalScoreEl = document.getElementById("red-final-score")
const blueFinalScoreEl = document.getElementById("blue-final-score")
let currentRedScore, currentBlueScore
let previousRedScore, previousBlueScore

// Team Details
const redTeamIconEl = document.getElementById("red-team-icon")
const blueTeamIconEl = document.getElementById("blue-team-icon")
const redTeamNameEl = document.getElementById("red-team-name")
const blueTeamNameEl = document.getElementById("blue-team-name")
let currentRedTeamName, currentBlueTeamName
let previousRedTeamName, previousBlueTeamName

// Match History
const redMatchHistorySectionEl = document.getElementById("red-match-history-section")
const blueMatchHistorySectionEl = document.getElementById("blue-match-history-section")
let currentMapWinnersStrings
let currentArrowColoursStrings
let currentCategoryIdsStrings
let currentOrderNumbersStrings
let currentPrimaryWinConRedStrings
let currentPrimaryWinConBlueStrings
let currentSecondaryWinConRedStrings
let currentSecondaryWinConBlueStrings
let currentWinConsStrings
let currentWinCons2Strings
let previousMapWinnersStrings
let previousArrowColoursStrings
let previousCategoryIdsStrings
let previousOrderNumbersStrings
let previousPrimaryWinConRedStrings
let previousPrimaryWinConBlueStrings
let previousSecondaryWinConRedStrings
let previousSecondaryWinConBlueStrings
let previousWinConsStrings
let previousWinCons2Strings

setInterval(() => {
    // Set current score
    currentRedScore = Number(getCookie("currentRedScore"))
    currentBlueScore = Number(getCookie("currentBlueScore"))

    if (previousRedScore !== currentRedScore || previousBlueScore !== currentBlueScore) {
        redFinalScoreEl.innerText = currentRedScore
        blueFinalScoreEl.innerText = currentBlueScore
    
        if (currentRedScore > currentBlueScore) {
            redFinalScoreEl.classList.add("lead-final-score")
            blueFinalScoreEl.classList.remove("lead-final-score")
        } else if (currentRedScore === currentBlueScore) {
            redFinalScoreEl.classList.remove("lead-final-score")
            blueFinalScoreEl.classList.remove("lead-final-score")
        } else if (currentRedScore < currentBlueScore) {
            redFinalScoreEl.classList.remove("lead-final-score")
            blueFinalScoreEl.classList.add("lead-final-score")
        }

        previousRedScore = currentRedScore
        previousBlueScore = currentBlueScore
    }

    // Set team name
    currentRedTeamName = getCookie("currentRedTeamName")
    currentBlueTeamName = getCookie("currentBlueTeamName")

    if (currentRedTeamName !== previousRedTeamName || currentBlueTeamName !== previousBlueTeamName) {
        // Red Team
        redTeamNameEl.innerText = currentRedTeamName
        if (currentRedTeamName.trim() === "") redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/transparent.png")`
        else redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${currentRedTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`
        // Blue Team
        blueTeamNameEl.innerText = currentBlueTeamName
        if (currentBlueTeamName.trim() === "") blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/transparent.png")`
        else blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${currentBlueTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`

        previousRedTeamName = currentRedTeamName
        previousBlueTeamName = currentBlueTeamName
    }

    // Match History
    currentMapWinnersStrings = getCookie("mapWinners")
    currentArrowColoursStrings = getCookie("arrowColours")
    currentCategoryIdsStrings = getCookie("categoryIds")
    currentOrderNumbersStrings = getCookie("orderNumbers")
    currentPrimaryWinConRedStrings = getCookie("primaryWinConRed")
    currentPrimaryWinConBlueStrings = getCookie("primaryWinConBlue")
    currentSecondaryWinConRedStrings = getCookie("secondaryWinConRed")
    currentSecondaryWinConBlueStrings = getCookie("secondaryWinConBlue")
    currentWinConsStrings = getCookie("winCons")
    currentWinCons2Strings = getCookie("winCons2")

    if (
        currentMapWinnersStrings !== previousMapWinnersStrings ||
        currentArrowColoursStrings !== previousArrowColoursStrings ||
        currentCategoryIdsStrings !== previousCategoryIdsStrings ||
        currentOrderNumbersStrings !== previousOrderNumbersStrings ||
        currentPrimaryWinConRedStrings !== previousPrimaryWinConRedStrings ||
        currentPrimaryWinConBlueStrings !== previousPrimaryWinConBlueStrings ||
        currentSecondaryWinConRedStrings !== previousSecondaryWinConRedStrings ||
        currentSecondaryWinConBlueStrings !== previousSecondaryWinConBlueStrings ||
        currentWinConsStrings !== previousWinConsStrings ||
        currentWinCons2Strings !== previousWinCons2Strings
    ) {
        redMatchHistorySectionEl.innerHTML = ""
        blueMatchHistorySectionEl.innerHTML = ""

        previousMapWinnersStrings = currentMapWinnersStrings
        previousArrowColoursStrings = currentArrowColoursStrings
        previousCategoryIdsStrings = currentCategoryIdsStrings
        previousOrderNumbersStrings = currentOrderNumbersStrings
        previousPrimaryWinConRedStrings = currentPrimaryWinConRedStrings
        previousPrimaryWinConBlueStrings = currentPrimaryWinConBlueStrings
        previousSecondaryWinConRedStrings = currentSecondaryWinConRedStrings
        previousSecondaryWinConBlueStrings = currentSecondaryWinConBlueStrings
        previousWinConsStrings = currentWinConsStrings
        previousWinCons2Strings = currentWinCons2Strings

        const currentMapWinnersStringsArray = currentMapWinnersStrings.split(",")
        const currentArrowColoursStringsArray = currentArrowColoursStrings.split(",")
        const currentCategoryIdsStringsArray = currentCategoryIdsStrings.split(",")
        const currentOrderNumbersStringsArray = currentOrderNumbersStrings.split(",")
        const currentPrimaryWinConRedStringsArray = currentPrimaryWinConRedStrings.split(",")
        const currentPrimaryWinConBlueStringsArray = currentPrimaryWinConBlueStrings.split(",")
        const currentSecondaryWinConRedStringsArray = currentSecondaryWinConRedStrings.split(",")
        const currentSecondaryWinConBlueStringsArray = currentSecondaryWinConBlueStrings.split(",")
        const currentWinConsStringsArray = currentWinConsStrings.split(",")
        const currentWinCons2StringsArray = currentWinCons2Strings.split(",")

        for (let i = 0; i < currentMapWinnersStringsArray.length; i++) {
            const currentWinner = currentMapWinnersStringsArray[i]

            // Create match history map
            const matchHistoryMap = document.createElement("div")
            matchHistoryMap.classList.add("match-history-map")
            if (currentWinner === "blue") matchHistoryMap.classList.add("blue-match-history-map")

            // Picker Triangle
            const pickerTriangle = document.createElement("div")
            pickerTriangle.classList.add("picker-triangle")
            pickerTriangle.classList.add(`${currentArrowColoursStringsArray[i]}-picker-triangle`)
            if (currentWinner === "red") pickerTriangle.classList.add("left-picker-triangle")
            else pickerTriangle.classList.add("right-picker-triangle")

            // Match history details
            const matchHistoryDetails = document.createElement("div")
            matchHistoryDetails.classList.add("match-history-details")

            // Match history category id
            const currentCategory = currentCategoryIdsStringsArray[i]
            const matchHistoryCategoryId = document.createElement("div")
            matchHistoryCategoryId.classList.add("match-history-category-id", `${currentWinner}-match-history-category-id`, `match-history-category-${currentCategory.toLowerCase()}`)
            matchHistoryCategoryId.innerText = `${currentCategory}${currentOrderNumbersStringsArray[i]}`
        
            // Match history score
            const matchHistoryScore = document.createElement("div")
            matchHistoryScore.classList.add("match-history-score", `${currentWinner}-match-history-score`)
            const matchHistoryScoreRed = document.createElement("span")
            const matchHistoryScoreBlue = document.createElement("span")
            // Check category on how to display score
            const redTeamScore = Number(currentPrimaryWinConRedStringsArray[i])
            const blueTeamScore = Number(currentPrimaryWinConBlueStringsArray[i])
            const redTeamScoreSecondary = Number(currentSecondaryWinConRedStringsArray[i])
            const blueTeamScoreSecondary = Number(currentSecondaryWinConBlueStringsArray[i])
            if (currentWinConsStringsArray[i] === "miss" && currentWinCons2StringsArray[i] === "acc") {
                matchHistoryScoreRed.innerText = `${redTeamScore.toLocaleString()}x (${redTeamScoreSecondary.toFixed(2)}%)`
                matchHistoryScoreBlue.innerText = `${blueTeamScore.toLocaleString()}x (${blueTeamScoreSecondary.toFixed(2)}%)`
            } else if (currentWinConsStringsArray[i] === "miss" && currentWinCons2StringsArray[i] === "scoreV2") {
                matchHistoryScoreRed.innerText = `${redTeamScore.toLocaleString()}x (${redTeamScoreSecondary}%)`
                matchHistoryScoreBlue.innerText = `${blueTeamScore.toLocaleString()}x (${blueTeamScoreSecondary}%)`
            } else if (currentWinConStringsArray[i] === "acc") {
                matchHistoryScoreRed.innerText = `${redTeamScore.toFixed(2)}%`
                matchHistoryScoreBlue.innerText = `${blueTeamScore.toFixed(2)}%`
            } else {
                matchHistoryScoreRed.innerText = redTeamScore.toLocaleString()
                matchHistoryScoreBlue.innerText = blueTeamScore.toLocaleString()
            }
            // Check who won
            if (currentWinner === "red") matchHistoryScoreRed.classList.add("match-history-score-winner")
            else matchHistoryScoreBlue.classList.add("match-history-score-winner")
            
            matchHistoryScore.append(matchHistoryScoreRed, " - ", matchHistoryScoreBlue)
            matchHistoryDetails.append(matchHistoryCategoryId, matchHistoryScore)
            matchHistoryMap.append(pickerTriangle, matchHistoryDetails)

            document.getElementById(`${currentWinner}-match-history-section`).append(matchHistoryMap)
        }
    }
}, 200)

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