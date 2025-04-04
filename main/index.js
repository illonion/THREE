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
let mapId, mapMd5

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team Details 
    if (redTeamName !== data.tourney.manager.teamName.left) {
        redTeamName = data.tourney.manager.teamName.left
        redTeamNameEl.innerText = redTeamName
        redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${redTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`
    }
    if (blueTeamName !== data.tourney.manager.teamName.right) {
        blueTeamName = data.tourney.manager.teamName.right
        blueTeamNameEl.innerText = blueTeamName
        blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${blueTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`
    }

    // Detect mappool map
    if (mapId !== data.menu.bm.id && mapMd5 !== data.menu.bm.md5) {
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
        } else {
            nowPlayingBottomRowPlusEl.style.display = "none"
            nowPlayingBottomRowModEl.style.display = "none"
            nowPlayingBottomRowMapperSeparatorEl.style.display = "none"
            nowPlayingBottomRowMapperTextEl.style.marginLeft = "0px"
        }
    }

    // Get scores
    if (scoreVisible !== data.tourney.manager.bools.scoreVisible) scoreVisible = data.tourney.manager.bools.scoreVisible
    if (scoreVisible) {
        redTeamScore = 0
        blueTeamScore = 0
        redTeamScoreSecondary = 0
        blueTeamScoreSecondary = 0

        for (let i = 0; i < data.tourney.ipcClients.length; i++) {
            let currentScore = 0
            let currentScoreSecondary = 0
            // Check if map is RX
            if (mappoolMap && mappoolMap.mod.includes("RX")) {
                currentScore = data.tourney.ipcClients[i].gameplay.hits["0"]
                currentScoreSecondary = data.tourney.ipcClients[i].accuracy
            } else {
                currentScore = data.tourney.ipcClients[i].gameplay.score
            }
            
            if (data.tourney.ipcClients[i].team === "left") {
                redTeamScore += currentScore
                redTeamScoreSecondary += currentScoreSecondary
            } else {
                blueTeamScore += currentScore
                blueTeamScoreSecondary += currentScoreSecondary
            }
        }

        // Display scores
        if (mappoolMap && mappoolMap.mod.includes("RX")) {
            // Select elements to show
            leftScoreNumberEl.style.display = "none"
            rightScoreNumberEl.style.display = "none"
            leftScoreNumberComboAccuracyEl.style.display = "block"
            rightScoreNumberComboAccuracyEl.style.display = "block"
            leftScoreNumberComboEl.style.display = "block"
            rightScoreNumberComboEl.style.display = "block"

            // Update scores
            scoreAnimation.leftScoreNumberCombo.update(redTeamScore)
            scoreAnimation.rightScoreNumberCombo.update(blueTeamScore)
            scoreAnimation.leftScoreNumberComboAccuracy.update(redTeamScoreSecondary)
            scoreAnimation.rightScoreNumberComboAccuracy.update(blueTeamScoreSecondary)

            // Update leader element
            if (redTeamScore > blueTeamScore) {
                leftScoreNumberComboContainerEl.style.opacity = 1
                rightScoreNumberComboContainerEl.style.opacity = 0.62
            } else if (redTeamScore < blueTeamScore) {
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
            if (redTeamScore > blueTeamScore) {
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
            leftScoreNumberEl.style.display = "block"
            rightScoreNumberEl.style.display = "block"
            leftScoreNumberComboAccuracyEl.style.display = "none"
            rightScoreNumberComboAccuracyEl.style.display = "none"
            leftScoreNumberComboEl.style.display = "none"
            rightScoreNumberComboEl.style.display = "none"

            // Update scores
            scoreAnimation.leftScoreNumber.update(redTeamScore)
            scoreAnimation.rightScoreNumber.update(blueTeamScore)

            // Update leader element
            if (redTeamScore > blueTeamScore) {
                leftScoreNumberComboContainerEl.style.opacity = 1
                rightScoreNumberComboContainerEl.style.opacity = 0.62
            } else if (redTeamScore < blueTeamScore) {
                leftScoreNumberComboContainerEl.style.opacity = 0.62
                rightScoreNumberComboContainerEl.style.opacity = 1
            } else {
                leftScoreNumberComboContainerEl.style.opacity = 0.62
                rightScoreNumberComboContainerEl.style.opacity = 0.62
            }

            // Scorebar
            // 20 misses will be the difference
            const scoreDelta = Math.min(Math.abs(redTeamScore - blueTeamScore), 960)
            if (redTeamScore > blueTeamScore) {
                leftScoreBarEl.style.width = `${Math.min(Math.pow(scoreDelta / 600000, 0.5) * 600, 600)}px`
                rightScoreBarEl.style.width = "0px"
            } else if (redTeamScore < blueTeamScore) {
                leftScoreBarEl.style.width = "0px"
                rightScoreBarEl.style.width = `${Math.min(Math.pow(scoreDelta / 600000, 0.5) * 600, 600)}px`
            } else {
                leftScoreBarEl.style.width = "0px"
                rightScoreBarEl.style.width = "0px"
            }
        }
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
    isStarOn = getCookie("isStarOn")
    if (isStarOn === "true") {
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