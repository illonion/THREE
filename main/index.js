// Get osu! API
let osuApi
async function getOsuApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}
getOsuApi()

// Get default maps
let defaultMaps
async function getDefaultBeatmaps() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()
    defaultMaps = responseJson
}
getDefaultBeatmaps()

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

    createStarDisplay()
}
getBeatmaps()

// Find beatmaps by ID
function findBeatmapById(beatmapId) {
    for (const category in allBeatmaps) {
        const beatmaps = allBeatmaps[category]
        const result = beatmaps.find(beatmap => beatmap.beatmap_id === beatmapId)
        if (result) return result
    }
    return null
}

// Get category by beatmap id
function getCategoryByBeatmapId(id) {
    id = id.toString()
    for (const category in allBeatmaps) {
        if (allBeatmaps[category].some(beatmap => beatmap.beatmap_id === id)) {
            return category
        }
    }
    return null
}

// Team Info
const redTeamIconEl = document.getElementById("red-team-icon")
const blueTeamIconEl = document.getElementById("blue-team-icon")
const redTeamNameEl = document.getElementById("red-team-name")
const blueTeamNameEl = document.getElementById("blue-team-name")
let redTeamName, blueTeamName

// Current scores
const leftScoreBarEl = document.getElementById("left-score-bar")
const rightScoreBarEl = document.getElementById("right-score-bar")
const leftScoreNumberEl = document.getElementById("left-score-number")
const rightScoreNumberEl = document.getElementById("right-score-number")
const leftScoreNumberComboAccuracyEl = document.getElementById("left-score-number-combo-accuracy")
const rightScoreNumberComboAccuracyEl = document.getElementById("right-score-number-combo-accuracy")
const leftScoreNumberComboEl = document.getElementById("left-score-number-combo")
const rightScoreNumberComboEl = document.getElementById("right-score-number-combo")
const leftScoreNumberComboContainerEl = document.getElementById("left-score-number-combo-container")
const rightScoreNumberComboContainerEl = document.getElementById("right-score-number-combo-container")
let scoreVisible
let redTeamScore = 0, blueTeamScore = 0
let redTeamScoreSecondary = 0, blueTeamScoreSecondary = 0

const scoreAnimation = {
    "leftScoreNumber": new CountUp(leftScoreNumberEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "rightScoreNumber": new CountUp(rightScoreNumberEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "leftScoreNumberComboAccuracy": new CountUp(leftScoreNumberComboAccuracyEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , prefix: "(", suffix: "%)"}),
    "rightScoreNumberComboAccuracy": new CountUp(rightScoreNumberComboAccuracyEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , prefix: "(", suffix: "%)"}),
    "leftScoreNumberCombo": new CountUp(leftScoreNumberComboEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , suffix: "x"}),
    "rightScoreNumberCombo": new CountUp(rightScoreNumberComboEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , suffix: "x"}),
}

// Map information
const nowPlayingBackgroundImageEl = document.getElementById("now-playing-background-image")
const nowPlayingArtistEl = document.getElementById("now-playing-artist")
const nowPlayingTitleEl = document.getElementById("now-playing-title")
const nowPlayingBottomRowPlusEl = document.getElementById("now-playing-bottom-row-plus")
const nowPlayingBottomRowModEl = document.getElementById("now-playing-bottom-row-mod")
const nowPlayingBottomRowMapperSeparatorEl = document.getElementById("now-playing-bottom-row-mapper-separator")
const nowPlayingBottomRowMapperTextEl = document.getElementById("now-playing-bottom-row-mapper-text")
const nowPlayingBottomRowMapperNameEl = document.getElementById("now-playing-bottom-row-mapper-name")
// Map Stats
const nowPlayingStatsCsNumberEl = document.getElementById("now-playing-stats-cs-number")
const nowPlayingStatsArNumberEl = document.getElementById("now-playing-stats-ar-number")
const nowPlayingStatsOdNumberEl = document.getElementById("now-playing-stats-od-number")
const nowPlayingStatsSrNumberEl = document.getElementById("now-playing-stats-sr-number")
// Map Timer
const nowPlayingCurrentTimeEl = document.getElementById("now-playing-current-time")
const nowPlayingTimeProgressEl = document.getElementById("now-playing-time-progress")
const nowPlayingTimeEndEl = document.getElementById("now-playing-end-time")
// Map Category ID
const nowPlayingCategoryIdEl = document.getElementById("now-playing-category-id")
// Map Variables
let mapId, mapMd5, mappoolMap

// Score visibility
const scoreSectionEl = document.getElementById("score-section")
const nowPlayingSectionEl = document.getElementById("now-playing-section")
const chatDisplayEl = document.getElementById("chat-display")

// Chat Display
const chatDisplayWrapperEl = document.getElementById("chat-display-wrapper")
let chatLen

// IPC State
let ipcState

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // Team Details 
    if (redTeamName !== data.tourney.manager.teamName.left) {
        redTeamName = data.tourney.manager.teamName.left
        redTeamNameEl.innerText = redTeamName
        if (redTeamName.trim() === "") redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/transparent.png")`
        else redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${redTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`
    }
    if (blueTeamName !== data.tourney.manager.teamName.right) {
        blueTeamName = data.tourney.manager.teamName.right
        blueTeamNameEl.innerText = blueTeamName
        if (blueTeamName.trim() === "") blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/transparent.png")`
        else blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${blueTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`
    }

    // Detect mappool map
    if (mapId !== data.menu.bm.id && mapMd5 !== data.menu.bm.md5 && allBeatmaps) {
        mapId = data.menu.bm.id
        mapMd5 = data.menu.bm.md5

        // Check mappool map
        mappoolMap = findBeatmapById(mapId.toString())

        // Now Playing Information
        nowPlayingBackgroundImageEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg")`
        nowPlayingArtistEl.innerText = data.menu.bm.metadata.artist
        nowPlayingTitleEl.innerText = data.menu.bm.metadata.title
        nowPlayingBottomRowMapperNameEl.innerText = data.menu.bm.metadata.mapper

        if (mappoolMap) {
            nowPlayingBottomRowPlusEl.style.display = "block"
            nowPlayingBottomRowModEl.style.display = "block"
            nowPlayingBottomRowModEl.innerHTML = ""
            nowPlayingBottomRowMapperSeparatorEl.style.display = "block"
            nowPlayingBottomRowMapperTextEl.style.marginLeft = "10px"

            // Check for DTFM
            if (mappoolMap.mod === "DTFM") {
                const span1 = document.createElement("span")
                span1.classList.add("now-playing-bottom-row-dt")
                span1.innerText = "DT"
                const span2 = document.createElement("span")
                span2.classList.add("now-playing-bottom-row-fm")
                span2.innerText = "FM"
                nowPlayingBottomRowModEl.append(span1, span2)
            } else {
                const modSpan = document.createElement("span")
                modSpan.classList.add(`now-playing-bottom-row-${mappoolMap.mod.toLowerCase()}`)
                modSpan.innerText = mappoolMap.mod
                nowPlayingBottomRowModEl.append(modSpan)
            }

            let currentSr = Math.round(Number(mappoolMap.difficultyrating) * 100) / 100
            let currentCs = Math.round(Number(mappoolMap.diff_size) * 10) / 10
            let currentAr = Math.round(Number(mappoolMap.diff_approach) * 10) / 10
            let currentOd = Math.round(Number(mappoolMap.diff_overall) * 10) / 10
            nowPlayingStatsSrNumberEl.innerText = currentSr
            switch (mappoolMap.mod) {
                case "HR":
                    currentCs = Math.min(Math.round(Number(mappoolMap.diff_size) * 1.3 * 10) / 10, 10)
                    currentAr = Math.min(Math.round(Number(mappoolMap.diff_approach) * 1.4 * 10) / 10, 10)
                    currentOd = Math.min(Math.round(Number(mappoolMap.diff_overall) * 1.4 * 10) / 10, 10)
                    break
                case "DT":
                    if (currentAr > 5) currentAr = Math.round((((1200 - (( 1200 - (currentAr - 5) * 150) * 2 / 3)) / 150) + 5) * 10) / 10
                    else currentAr = Math.round((1800 - ((1800 - currentAr * 120) * 2 / 3)) / 120 * 10) / 10
                    currentOd = Math.round((79.5 - (( 79.5 - 6 * currentOd) * 2 / 3)) / 6 * 10) / 10
                    break
            }
            nowPlayingStatsCsNumberEl.innerText = currentCs
            nowPlayingStatsArNumberEl.innerText = currentAr
            nowPlayingStatsOdNumberEl.innerText = currentOd

            // Category ID
            nowPlayingCategoryIdEl.style.display = "block"
            nowPlayingCategoryIdEl.setAttribute("src", `../_shared/assets/mod-icons/${getCategoryByBeatmapId(mapId)}-${mappoolMap.order + 1}.png`)

        } else {
            nowPlayingBottomRowPlusEl.style.display = "none"
            nowPlayingBottomRowModEl.style.display = "none"
            nowPlayingBottomRowMapperSeparatorEl.style.display = "none"
            nowPlayingBottomRowMapperTextEl.style.marginLeft = "0px"
            nowPlayingCategoryIdEl.style.display = "none"
        }   
    }

    if (!mappoolMap) {
        nowPlayingStatsSrNumberEl.innerText = data.menu.bm.stats.fullSR
        nowPlayingStatsCsNumberEl.innerText = data.menu.bm.stats.CS
        nowPlayingStatsArNumberEl.innerText = data.menu.bm.stats.AR
        nowPlayingStatsOdNumberEl.innerText = data.menu.bm.stats.OD
    }

    // Check for DT, then show timer
    if (mappoolMap && mappoolMap.mod.includes("DT")) {
        displayTimeMs(nowPlayingCurrentTimeEl, Math.round(data.menu.bm.time.current / 3 * 2))
        displayTimeMs(nowPlayingTimeEndEl, Math.round(data.menu.bm.time.mp3 / 3 * 2))
    } else {
        displayTimeMs(nowPlayingCurrentTimeEl, data.menu.bm.time.current)
        displayTimeMs(nowPlayingTimeEndEl, data.menu.bm.time.mp3)
    }
    nowPlayingTimeProgressEl.style.width = `${data.menu.bm.time.current / data.menu.bm.time.mp3 * 367}px`

    // Change score visibility
    if (scoreVisible !== data.tourney.manager.bools.scoreVisible) {
        scoreVisible = data.tourney.manager.bools.scoreVisible
        if (scoreVisible) {
            scoreSectionEl.style.opacity = 1
            nowPlayingSectionEl.style.opacity = 1
            nowPlayingPickerTriangleEl.style.opacity = 1
            chatDisplayEl.style.opacity = 0
        } else {
            scoreSectionEl.style.opacity = 0
            nowPlayingSectionEl.style.opacity = 1
            nowPlayingPickerTriangleEl.style.opacity = 1
            chatDisplayEl.style.opacity = 1
        }
    }

    // Get scores
    if (scoreVisible) {
        redTeamScore = 0
        blueTeamScore = 0
        redTeamScoreSecondary = 0
        blueTeamScoreSecondary = 0
        let noOfRedPlayers = 0
        let noOfBluePlayers = 0

        for (let i = 0; i < data.tourney.ipcClients.length; i++) {
            let currentScore = 0
            let currentScoreSecondary = 0
            // Check if map is RX
            if (mappoolMap && mappoolMap.mod.includes("RX")) {
                currentScore = data.tourney.ipcClients[i].gameplay.hits["0"]
                currentScoreSecondary = data.tourney.ipcClients[i].gameplay.accuracy
            } else {
                currentScore = data.tourney.ipcClients[i].gameplay.score
            }
            
            if (data.tourney.ipcClients[i].team === "left") {
                redTeamScore += currentScore
                redTeamScoreSecondary += currentScoreSecondary
                noOfRedPlayers++
            } else {
                blueTeamScore += currentScore
                blueTeamScoreSecondary += currentScoreSecondary
                noOfBluePlayers++
            }
        }

        redTeamScoreSecondary /= noOfRedPlayers
        blueTeamScoreSecondary /= noOfBluePlayers

        // Display scores
        if (mappoolMap && mappoolMap.mod.includes("RX")) {
            // Select elements to show
            leftScoreNumberEl.style.opacity = 0
            rightScoreNumberEl.style.opacity = 0
            leftScoreNumberComboAccuracyEl.style.opacity = 0.62
            rightScoreNumberComboAccuracyEl.style.opacity = 0.62
            leftScoreNumberComboEl.style.opacity = 0.62
            rightScoreNumberComboEl.style.opacity = 0.62

            // Update scores
            scoreAnimation.leftScoreNumberCombo.update(redTeamScore)
            scoreAnimation.rightScoreNumberCombo.update(blueTeamScore)
            scoreAnimation.leftScoreNumberComboAccuracy.update(redTeamScoreSecondary)
            scoreAnimation.rightScoreNumberComboAccuracy.update(blueTeamScoreSecondary)

            // Update leader element
            if (redTeamScore < blueTeamScore) {
                leftScoreNumberComboContainerEl.style.opacity = 1
                rightScoreNumberComboContainerEl.style.opacity = 0.62
            } else if (redTeamScore > blueTeamScore) {
                leftScoreNumberComboContainerEl.style.opacity = 0.62
                rightScoreNumberComboContainerEl.style.opacity = 1
            } else if (redTeamScoreSecondary > blueTeamScoreSecondary) {
                leftScoreNumberComboContainerEl.style.opacity = 1
                rightScoreNumberComboContainerEl.style.opacity = 0.62
            } else if (redTeamScoreSecondary < blueTeamScoreSecondary) {
                leftScoreNumberComboContainerEl.style.opacity = 0.62
                rightScoreNumberComboContainerEl.style.opacity = 1
            } else {
                leftScoreNumberComboContainerEl.style.opacity = 0.62
                rightScoreNumberComboContainerEl.style.opacity = 0.62
            }

            // Scorebar
            // 20 misses will be the difference
            const missDifference = Math.min(Math.abs(redTeamScore - blueTeamScore), 20)
            if (redTeamScore < blueTeamScore) {
                leftScoreBarEl.style.width = `${missDifference / 20 * 960}px`
                rightScoreBarEl.style.width = "0px"
            } else if (redTeamScore > blueTeamScore) {
                leftScoreBarEl.style.width = "0px"
                rightScoreBarEl.style.width = `${missDifference / 20 * 960}px`
            } else {
                leftScoreBarEl.style.width = "0px"
                rightScoreBarEl.style.width = "0px"
            }
        } else {
            // Select elements to show
            leftScoreNumberEl.style.opacity = 0.62
            rightScoreNumberEl.style.opacity = 0.62
            leftScoreNumberComboAccuracyEl.style.opacity = 0
            rightScoreNumberComboAccuracyEl.style.opacity = 0
            leftScoreNumberComboEl.style.opacity = 0
            rightScoreNumberComboEl.style.opacity = 0

            // Update scores
            scoreAnimation.leftScoreNumber.update(redTeamScore)
            scoreAnimation.rightScoreNumber.update(blueTeamScore)

            // Update leader element
            if (redTeamScore > blueTeamScore) {
                leftScoreNumberEl.style.opacity = 1
                rightScoreNumberEl.style.opacity = 0.62
            } else if (redTeamScore < blueTeamScore) {
                leftScoreNumberEl.style.opacity = 0.62
                rightScoreNumberEl.style.opacity = 1
            } else {
                leftScoreNumberEl.style.opacity = 0.62
                rightScoreNumberEl.style.opacity = 0.62
            }

            // Scorebar
            // 20 misses will be the difference
            const scoreDelta = Math.abs(redTeamScore - blueTeamScore)
            if (redTeamScore > blueTeamScore) {
                leftScoreBarEl.style.width = `${Math.min(Math.pow(scoreDelta / 600000, 0.5) * 600, 960)}px`
                rightScoreBarEl.style.width = "0px"
            } else if (redTeamScore < blueTeamScore) {
                leftScoreBarEl.style.width = "0px"
                rightScoreBarEl.style.width = `${Math.min(Math.pow(scoreDelta / 600000, 0.5) * 600, 960)}px`
            } else {
                leftScoreBarEl.style.width = "0px"
                rightScoreBarEl.style.width = "0px"
            }
        }
    }

    if (chatLen !== data.tourney.manager.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.manager.chat.length) ? (chatDisplayWrapperEl.innerHTML = "", chatLen = 0) : null
        const fragment = document.createDocumentFragment()

        for (let i = chatLen; i < data.tourney.manager.chat.length; i++) {
            const chatColour = data.tourney.manager.chat[i].team

            // Chat message container
            const chatMessageContainer = document.createElement("div")
            chatMessageContainer.classList.add("chat-message-container")

            // Name
            const chatDisplayName = document.createElement("span")
            chatDisplayName.classList.add("chat-name")
            chatDisplayName.classList.add(chatColour)
            chatDisplayName.innerText = data.tourney.manager.chat[i].name + ": ";

            // Message
            const chatDisplayMessage = document.createElement("span")
            chatDisplayMessage.classList.add("chat-message")
            chatDisplayMessage.innerText = data.tourney.manager.chat[i].messageBody

            chatMessageContainer.append(chatDisplayName, chatDisplayMessage)
            fragment.append(chatMessageContainer)
        }

        chatDisplayWrapperEl.append(fragment)
        chatLen = data.tourney.manager.chat.length
        chatDisplayWrapperEl.scrollTop = chatDisplayWrapperEl.scrollHeight
    }

    // IPC State
    if (ipcState !== data.tourney.manager.ipcState) {
        ipcState = data.tourney.manager.ipcState
        if (ipcState === 1 && matchIdEl.value.trim() !== "") getMatches()
    }
}

// Set star count
let isStarOn
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")
let currentBestOf = 0, currentFirstTo = 0, currentRedScore = 0, currentBlueScore = 0
let previousRedScore = 0, previousBlueScore = 0
setInterval(() => {
    // Is Star On?
    isStarOn = getCookie("toggleStars")
    if (isStarOn === "false") {
        redTeamStarContainerEl.style.display = "none"
        blueTeamStarContainerEl.style.display = "none"
    } else {
        redTeamStarContainerEl.style.display = "flex"
        blueTeamStarContainerEl.style.display = "flex"
    }

    // Change star count
    currentRedScore = Number(getCookie("currentRedScore"))
    currentBlueScore = Number(getCookie("currentBlueScore"))
    if (currentRedScore !== previousRedScore ||
        currentBlueScore !== previousBlueScore
    ) {
        previousRedScore = currentRedScore
        previousBlueScore = currentBlueScore
        createStarDisplay()
    }

    // Set current picker
    setCurrentPicker(getCookie("currentPicker"))
}, 200)

// Create star display
function createStarDisplay() {
    redTeamStarContainerEl.innerHTML = ""
    blueTeamStarContainerEl.innerHTML = ""

    let i = 0
    for (i; i < currentRedScore; i++) redTeamStarContainerEl.append(createStar("fill"))
    for (i; i < currentFirstTo; i++) redTeamStarContainerEl.append(createStar("empty"))

    i = 0
    for (i; i < currentBlueScore; i++) blueTeamStarContainerEl.append(createStar("fill"))
    for (i; i < currentFirstTo; i++) blueTeamStarContainerEl.append(createStar("empty"))

    // Create Star
    function createStar(status) {
        const newStar = document.createElement("div")
        newStar.classList.add("team-star", `team-star-${status}`)
        return newStar
    }
}

// Set Current Picker
const nowPlayingPickerTriangleEl = document.getElementById("now-playing-picker-triangle")
const sidebarCurrentPickerEl = document.getElementById("sidebar-current-picker")
function setCurrentPicker(team) {
    sidebarCurrentPickerEl.innerText = `${team.slice(0, 1).toUpperCase()}${team.slice(1)}`
    document.cookie = `currentPicker=${team}; path=/`

    if (team === "red") {
        nowPlayingPickerTriangleEl.style.display = "block"
        nowPlayingPickerTriangleEl.classList.add("red-picker-triangle")
        nowPlayingPickerTriangleEl.classList.remove("blue-picker-triangle")
        nowPlayingPickerTriangleEl.classList.remove("default-picker-triangle")
    } else if (team === "blue") {
        nowPlayingPickerTriangleEl.style.display = "block"
        nowPlayingPickerTriangleEl.classList.remove("red-picker-triangle")
        nowPlayingPickerTriangleEl.classList.add("blue-picker-triangle")
        nowPlayingPickerTriangleEl.classList.remove("default-picker-triangle")
    } else if (team === "wheel") {
        nowPlayingPickerTriangleEl.style.display = "block"
        nowPlayingPickerTriangleEl.classList.remove("red-picker-triangle")
        nowPlayingPickerTriangleEl.classList.remove("blue-picker-triangle")
        nowPlayingPickerTriangleEl.classList.add("default-picker-triangle")
    } else if (team === "none") {
        nowPlayingPickerTriangleEl.style.display = "none"
    }
}

// MP Links and number of maps counted
let previousMPLink
let currentMPLink
let numberOfMapsCounted = 0

let mapWinners = []
let arrowColours = []
let categoryIds = []
let orderNumbers = []
let primaryWinConRed = []
let primaryWinConBlue = []
let secondaryWinConRed = []
let secondaryWinConBlue = []
let winCons = []

// Get Matches
const matchIdEl = document.getElementById("match-id")
function getMatches() {
    currentMPLink = parseInt(matchIdEl.value)
    getAndAppendMatchHistory()
}

// Get and append match history
async function getAndAppendMatchHistory() {
    // Get MP Link
    if (previousMPLink !== currentMPLink) resetMatchHistory()
        
    const response = await fetch(`https://osu.ppy.sh/api/get_match?k=${osuApi}&mp=${currentMPLink}`)
    const responseJson = await response.json()

    for (numberOfMapsCounted; numberOfMapsCounted < responseJson.games.length; numberOfMapsCounted++) {
        const currentGame = responseJson.games[numberOfMapsCounted]
        const currentMap = findBeatmapById(currentGame.beatmap_id)
        const currentCategory = getCategoryByBeatmapId(currentGame.beatmap_id)

        console.log(currentGame)

        if (currentMap && currentCategory !== "TB") {
            let redTeamScore = 0
            let blueTeamScore = 0
            let redTeamScoreSecondary = 0
            let blueTeamScoreSecondary = 0
            let noOfRedPlayers = 0
            let noOfBluePlayers = 0

            for (let i = 0; i < currentGame.scores.length; i++) {
                // Relax
                if (currentMap.mod.includes("RX")) {
                    let currentTeamScore = Number(currentGame.scores[i].countmiss)

                    let totalNotes = Number(currentGame.scores[i].countmiss) + Number(currentGame.scores[i].count50) + 
                                    Number(currentGame.scores[i].count100) + Number(currentGame.scores[i].count300) +
                                    Number(currentGame.scores[i].countgeki) + Number(currentGame.scores[i].countkatu)

                    let accuracy = (Number(currentGame.scores[i].countmiss) * 0 + Number(currentGame.scores[i].count50) * 1 / 6 +
                                    Number(currentGame.scores[i].count100) * 1 / 3 + Number(currentGame.scores[i].count300) +
                                    Number(currentGame.scores[i].countgeki) + Number(currentGame.scores[i].countkatu) * 1 / 3) / totalNotes

                    if (totalNotes === 0) accuracy = 0

                    if (currentGame.scores[i].team === "2") {
                        redTeamScore += currentTeamScore
                        redTeamScoreSecondary += accuracy
                        noOfRedPlayers++
                    } else {
                        blueTeamScore += currentTeamScore
                        blueTeamScoreSecondary += accuracy
                        noOfBluePlayers++
                    }
                // No Relax
                } else {
                    let currentTeamScore = Number(currentGame.scores[i].score)
                    if (currentGame.scores[i].team === "2") {
                        redTeamScore += currentTeamScore
                    } else {
                        blueTeamScore += currentTeamScore
                    }
                }
            }

            if (currentMap.mod.includes("RX")) {
                redTeamScoreSecondary /= noOfRedPlayers
                blueTeamScoreSecondary /= noOfBluePlayers
                redTeamScoreSecondary *= 100
                blueTeamScoreSecondary *= 100
            }

            primaryWinConRed.push(redTeamScore)
            primaryWinConBlue.push(blueTeamScore)
            secondaryWinConRed.push(redTeamScoreSecondary)
            secondaryWinConBlue.push(blueTeamScoreSecondary)

            // Set winner
            let winner
            if (currentMap.mod.includes("RX")) {
                winCons.push("RX")
                if (redTeamScore < blueTeamScore) winner = "red"
                else if (redTeamScore > blueTeamScore) winner = "blue"
                else if (redTeamScoreSecondary > blueTeamScoreSecondary) winner = "red"
                else if (redTeamScoreSecondary < blueTeamScoreSecondary) winner = "blue"
            } else {
                winCons.push("none")
                if (redTeamScore > blueTeamScore) winner = "red"
                else if (redTeamScore < blueTeamScore) winner = "blue"
            }
            if (!winner) return
            mapWinners.push(winner)

            // Create match history map
            const matchHistoryMap = document.createElement("div")
            matchHistoryMap.classList.add("match-history-map")
            if (winner === "blue") matchHistoryMap.classList.add("blue-match-history-map")

            // Picker Triangle
            const pickerTriangle = document.createElement("div")
            pickerTriangle.classList.add("picker-triangle")
            const currentPicker = getCookie("currentPicker")
            if (numberOfMapsCounted === responseJson.games.length - 1 && (currentPicker === "red" || currentPicker === "blue")) {
                pickerTriangle.classList.add(`${currentPicker}-picker-triangle`)
                arrowColours.push(currentPicker)
            } else {
                pickerTriangle.classList.add("default-picker-triangle")
                arrowColours.push("default")
            }
            if (winner === "red") pickerTriangle.classList.add("left-picker-triangle")
            else pickerTriangle.classList.add("right-picker-triangle")

            // Match history details
            const matchHistoryDetails = document.createElement("div")
            matchHistoryDetails.classList.add("match-history-details")

            // Match history category id
            const matchHistoryCategoryId = document.createElement("div")
            matchHistoryCategoryId.classList.add("match-history-category-id", `${winner}-match-history-category-id`, `match-history-category-${currentCategory.toLowerCase()}`)
            matchHistoryCategoryId.innerText = `${currentCategory}${currentMap.order + 1}`
            categoryIds.push(currentCategory)
            orderNumbers.push(currentMap.order + 1)

            // Match history score
            const matchHistoryScore = document.createElement("div")
            matchHistoryScore.classList.add("match-history-score", `${winner}-match-history-score`)
            let matchHistoryScoreRed = document.createElement("span")
            let matchHistoryScoreBlue = document.createElement("span")
            // Check category on how to display score
            if (currentMap.mod.includes("RX")) {
                matchHistoryScoreRed.innerText = `${redTeamScore.toLocaleString()}x (${redTeamScoreSecondary.toFixed(2)}%)`
                matchHistoryScoreBlue.innerText = `${blueTeamScore.toLocaleString()}x (${blueTeamScoreSecondary.toFixed(2)}%)`
            } else {
                matchHistoryScoreRed.innerText = redTeamScore.toLocaleString()
                matchHistoryScoreBlue.innerText = blueTeamScore.toLocaleString()
            }
            // Check who won
            if (winner === "red") matchHistoryScoreRed.classList.add("match-history-score-winner")
            else matchHistoryScoreBlue.classList.add("match-history-score-winner")

            matchHistoryScore.append(matchHistoryScoreRed, " - ", matchHistoryScoreBlue)
            matchHistoryDetails.append(matchHistoryCategoryId, matchHistoryScore)
            matchHistoryMap.append(pickerTriangle, matchHistoryDetails)

            document.getElementById(`${winner}-match-history-section`).append(matchHistoryMap)

            document.cookie = `mapWinners=${mapWinners.join(",")} ;path=/`
            document.cookie = `arrowColours=${arrowColours.join(",")} ;path=/`
            document.cookie = `categoryIds=${categoryIds.join(",")} ;path=/`
            document.cookie = `orderNumbers=${orderNumbers.join(",")}; path=/`
            document.cookie = `primaryWinConRed=${primaryWinConRed.join(",")} ;path=/`
            document.cookie = `primaryWinConBlue=${primaryWinConBlue.join(",")} ;path=/`
            document.cookie = `secondaryWinConRed=${secondaryWinConRed.join(",")} ;path=/`
            document.cookie = `secondaryWinConBlue=${secondaryWinConBlue.join(",")} ;path=/`
            document.cookie = `winCons=${winCons.join(",")} ;path=/`
        }
    }
}

// Reset match history
const redMatchHistorySectionEl = document.getElementById("red-match-history-section")
const blueMatchHistorySectionEl = document.getElementById("blue-match-history-section")
function resetMatchHistory() {
    // Reset the history
    redMatchHistorySectionEl.innerHTML = ""
    blueMatchHistorySectionEl.innerHTML = ""
    numberOfMapsCounted = 0

    mapWinners = []
    arrowColours = []
    categoryIds = []
    orderNumbers = []
    primaryWinConRed = []
    primaryWinConBlue = []
    secondaryWinConRed = []
    secondaryWinConBlue = []
    winCons = []

    unsetAllCookies()
}

function unsetAllCookies() {
    unsetCookie("mapWinners")
    unsetCookie("arrowColours")
    unsetCookie("categoryIds")
    unsetCookie("orderNumbers")
    unsetCookie("primaryWinConRed")
    unsetCookie("primaryWinConRed")
    unsetCookie("primaryWinConBlue")
    unsetCookie("secondaryWinConRed")
    unsetCookie("secondaryWinConBlue")
    unsetCookie("winCons")

    function unsetCookie(cookieName) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
}
unsetAllCookies()