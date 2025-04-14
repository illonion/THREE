// Round Text
const roundTextEl = document.getElementById("round-text")

// Get default maps
let defaultMaps
async function getDefaultBeatmaps() {
    const response = await fetch("../_data/default-beatmap.json")
    const responseJson = await response.json()
    defaultMaps = responseJson
}
getDefaultBeatmaps()

// Get beatmaps
const mappoolSectionEl = document.getElementById("mappool-section")
let currentBestOf = 0, currentFirstTo = 0, currentRedScore = 0, currentBlueScore = 0
let allBeatmaps, roundName
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

    for (const key in allBeatmaps) {
        const beatmaps = allBeatmaps[key];

        // Create category section
        const categorySection = document.createElement("section")
        categorySection.classList.add("category-section")
        categorySection.style.backgroundColor = `var(--background-${key.toLowerCase()})`

        // Create category icon
        const categoryIcon = document.createElement("img")
        categoryIcon.classList.add("category-icon")
        categoryIcon.setAttribute("src", `../_shared/assets/mod-icons/${key}.png`)

        // Create category map container
        const categoryMapContainer = document.createElement("div")
        categoryMapContainer.classList.add("category-map-container")

        for (let i = 0; i < beatmaps.length; i++) {
            // Create category map
            const categoryMap = document.createElement("div")
            categoryMap.classList.add("category-map")
            categoryMap.dataset.id = beatmaps[i].beatmap_id
            categoryMap.dataset.pickerTeam = "false"
            categoryMap.dataset.bannedByRed = "false"
            categoryMap.dataset.bannedByBlue = "false"
            categoryMap.addEventListener("mousedown", mapClickEvent)
            categoryMap.addEventListener("contextmenu", function(event) {event.preventDefault()})
            categoryMap.setAttribute("id", beatmaps[i].beatmap_id)

            // Create category detail container
            const categoryMapDetailContainer = document.createElement("div")
            categoryMapDetailContainer.classList.add("category-map-detail-container")
            // Create category map background image
            const categoryMapBackgroundImage = document.createElement("div")
            categoryMapBackgroundImage.classList.add("category-map-background-image")
            categoryMapBackgroundImage.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${beatmaps[i].beatmapset_id}/covers/cover.jpg")`
            // Create category map artist
            const categoryMapArtist = document.createElement("div")
            categoryMapArtist.classList.add("category-map-metadata", "category-map-artist")
            categoryMapArtist.innerText = beatmaps[i].artist
            // Create category map title
            const categoryMapTitle = document.createElement("div")
            categoryMapTitle.classList.add("category-map-metadata", "category-map-title")
            categoryMapTitle.innerText = beatmaps[i].title

            // Create category map mod
            const categoryMapMod = document.createElement("div")
            categoryMapMod.classList.add("category-map-metadata", "category-map-mod")
            // Category map mod text
            if (beatmaps[i].mod === "DTFM") {
                const categoryMapModTextDT = document.createElement("span")
                categoryMapModTextDT.classList.add(`category-map-mod-dt`)
                categoryMapModTextDT.innerText = "DT"
                const categoryMapModTextFM = document.createElement("span")
                categoryMapModTextFM.classList.add(`category-map-mod-fm`)
                categoryMapModTextFM.innerText = "FM"
                categoryMapMod.append("+ ", categoryMapModTextDT, categoryMapModTextFM)
            } else {
                const categoryMapModText = document.createElement("span")
                categoryMapModText.classList.add(`category-map-mod-${beatmaps[i].mod.toLowerCase()}`)
                categoryMapModText.innerText = beatmaps[i].mod
                categoryMapMod.append("+ ", categoryMapModText)
            }

            categoryMapDetailContainer.append(categoryMapBackgroundImage, categoryMapArtist, categoryMapTitle, categoryMapMod)

            // Create categry map picke by
            const categoryMapPickedBy = document.createElement("div")
            categoryMapPickedBy.classList.add("category-map-picked-by")
            const categoryMapPickBanAction = document.createElement("span")
            categoryMapPickBanAction.classList.add("category-map-pick-ban-action")
            const categoryMapPickedByTeam = document.createElement("span")
            categoryMapPickedByTeam.classList.add("category-map-pick-ban-team")
            categoryMapPickedBy.append(categoryMapPickBanAction, " by ", categoryMapPickedByTeam)

            // Create category map winner
            const categoryMapWinner = document.createElement("img")
            categoryMapWinner.classList.add("category-map-winner")

            categoryMap.append(categoryMapDetailContainer, categoryMapPickedBy, categoryMapWinner)
            categoryMapContainer.append(categoryMap)
        }

        categorySection.append(categoryIcon, categoryMapContainer)
        mappoolSectionEl.append(categorySection)
    }
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

// Star container
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")

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

    document.cookie = `currentRedScore=${currentRedScore}; path=/`
    document.cookie = `currentBlueScore=${currentBlueScore}; path=/`
}

// Animation elements
const animationCardWrapperEl = document.getElementById("animation-card-wrapper")
const animationCardBackgroundEl = document.getElementById("animation-card-background")
const animationCardCategoryIdEl = document.getElementById("animation-card-category-id")
const animationCardArtistEl = document.getElementById("animation-card-artist")
const animationCardTitleEl = document.getElementById("animation-card-title")
const animationCardDifficultyEl = document.getElementById("animation-card-difficulty")
const animationCardMapperEl = document.getElementById("animation-card-mapper")
const animationMapCsEl = document.getElementById("animation-map-cs")
const animationMapArEl = document.getElementById("animation-map-ar")
const animationMapOdEl = document.getElementById("animation-map-od")
const animationMapSrEl = document.getElementById("animation-map-sr")
const animationMapLengthEl = document.getElementById("animation-map-length")
const animationMapBpmEl = document.getElementById("animation-map-bpm")
const animationMapCirclesEl = document.getElementById("animation-map-circles")
const animationMapSlidersEl = document.getElementById("animation-map-sliders")
const animationCardPickBanTeamEl = document.getElementById("animation-card-pick-ban-team")
const animationCardPickBanActionEl = document.getElementById("animation-card-pick-ban-action")

// Map Click Event
let currentSelectedElement
async function mapClickEvent(event) {
    // Find map
    const currentMapId = this.dataset.id
    const currentMap = findBeatmapById(currentMapId)
    if (!currentMap) return

    // Team
    let team
    if (event.button === 0) team = "red"
    else if (event.button === 2) team = "blue"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"
    if (event.shiftKey) action = "reset"

    // Check if it is the default pick
    if ((currentMapId === defaultMaps.RO32DefaultBeatmap && roundName === "RO32") ||
        (currentMapId === defaultMaps.RO16DefaultBeatmap && roundName === "RO16") ||
        (currentMapId === defaultMaps.QFDefaultBeatmap && roundName === "QF") ||
        (currentMapId === defaultMaps.SFDefaultBeatmap && roundName === "SF") ||
        (currentMapId === defaultMaps.FDefaultBeatmap && roundName === "F") ||
        (currentMapId === defaultMaps.GFDefaultBeatmap && roundName === "GF")) {
        team = "wheel"
        action = "pick"
    }

    if (action === "ban") {
        this.children[0].classList.add("category-map-detail-container-actioned")

        this.dataset.pickerTeam = "false"
        if (team === "red") this.dataset.bannedByRed = "true"
        if (team === "blue") this.dataset.bannedByBlue = "true"

        this.children[1].style.display = "block"
        this.children[1].children[0].innerText = "banned"

        if (this.dataset.bannedByRed === "true" && this.dataset.bannedByBlue === "true") this.children[1].children[1].innerText = "red / blue"
        else if (this.dataset.bannedByRed === "true" || this.dataset.bannedByBlue === "true") this.children[1].children[1].innerText = team
    }
    if (action === "pick") {
        this.children[0].classList.add("category-map-detail-container-actioned")

        this.dataset.pickerTeam = team
        this.dataset.bannedByRed = "false"
        this.dataset.bannedByBlue = "false"

        this.children[1].style.display = "block"
        this.children[1].children[0].innerText = "picked"
        this.children[1].children[1].innerText = team

        currentSelectedElement = this

        document.cookie = `currentPicker=${team}; path=/`
    }

    if (action === "reset") {
        this.dataset.pickerTeam = "false"
        this.dataset.bannedByRed = "false"
        this.dataset.bannedByBlue = "false"
        this.children[0].classList.remove("category-map-detail-container-actioned")
        this.children[1].style.display = "none"
        this.children[2].style.display = "none"
        return
    }
    
    if (!isAnimationOn) return

    // Animation card details
    // Map Metadata
    animationCardBackgroundEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    animationCardCategoryIdEl.setAttribute("src", `../_shared/assets/mod-icons/${getCategoryByBeatmapId(currentMap.beatmap_id)}-${currentMap.order + 1}.png`)
    animationCardArtistEl.innerText = currentMap.artist
    animationCardTitleEl.innerText = currentMap.title
    animationCardDifficultyEl.innerText = `[${currentMap.version}]`
    animationCardMapperEl.innerText = currentMap.creator
    animationCardPickBanTeamEl.innerText = team
    animationCardPickBanActionEl.innerText = action

    // Map Stats
    animationMapSrEl.innerText = Math.round(Number(currentMap.difficultyrating) * 100) / 100
    if (currentMap.mod.includes("DT")) {
        if (Number(currentMap.diff_approach) > 5) animationMapArEl.innerText = Math.round((((1200 - (( 1200 - (Number(currentMap.diff_approach) - 5) * 150) * 2 / 3)) / 150) + 5) * 10) / 10
        else Math.round((1800 - ((1800 - (Number(currentMap.diff_approach) * 120) * 2 / 3)) / 120 * 10) / 10)
        animationMapOdEl.innerText = Math.round((79.5 - (( 79.5 - 6 * Number(currentMap.diff_overall)) * 2 / 3)) / 6 * 10) / 10
        animationMapCsEl.innerText = Number(currentMap.diff_size)
    } else if (currentMap.mod.includes("HR")) {
        animationMapCsEl.innerText = Math.min(Math.round(Number(currentMap.diff_size) * 1.3 * 10) / 10, 10)
        animationMapArEl.innerText = Math.min(Math.round(Number(currentMap.diff_approach) * 1.4 * 10) / 10, 10)
        animationMapOdEl.innerText = Math.min(Math.round(Number(currentMap.diff_overall) * 1.4 * 10) / 10, 10)
    } else {
        animationMapCsEl.innerText = currentMap.diff_size
        animationMapArEl.innerText = currentMap.diff_approach
        animationMapOdEl.innerText = currentMap.diff_overall
    }

    // Right hand side stats
    if (currentMap.mod.includes("DT")) {
        animationMapLengthEl.innerText = displayLength(Math.round(Number(currentMap.hit_length) / 3 * 2))
        animationMapBpmEl.innerText = Math.round(Number(currentMap.bpm) * 3 / 2)
    } else {
        animationMapLengthEl.innerText = displayLength(Number(currentMap.hit_length))
        animationMapBpmEl.innerText = currentMap.bpm
    }
    animationMapCirclesEl.innerText = currentMap.count_normal
    animationMapSlidersEl.innerText = currentMap.count_slider

    // Actual animation
    animationCardWrapperEl.style.display = "block"
    await delay(100)
    animationCardWrapperEl.style.opacity = 1
    await delay(5000)
    animationCardWrapperEl.style.opacity = 0
    await delay(300)
    animationCardWrapperEl.style.display = "none"

    if (enableAutoAdvance) {
        scheduleSceneTransition(gameplay_scene_name, pick_to_transition_delay_ms);
    }
}

// Display length
function displayLength(second) {
    const minutes = Math.floor(second / 60)
    const seconds = second % 60
    const pad = num => num.toString().padStart(2, "0")
    return `${minutes}:${pad(seconds)}`
}

// Team Info
const redTeamIconEl = document.getElementById("red-team-icon")
const blueTeamIconEl = document.getElementById("blue-team-icon")
const redTeamNameEl = document.getElementById("red-team-name")
const blueTeamNameEl = document.getElementById("blue-team-name")
let redTeamName, blueTeamName

// Chat Display
const chatDisplayEl = document.getElementById("chat-display-wrapper")
let chatLen

// Beatmap variables
let mappoolMap, mapId, mapMd5

// Current scores
let scoreVisible
let redTeamScore = 0, blueTeamScore = 0
let redTeamScoreSecondary = 0, blueTeamScoreSecondary = 0

// IPC State
let previousIpcState, ipcState, checkedWinner = false

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team Details 
    if (redTeamName !== data.tourney.manager.teamName.left) {
        redTeamName = data.tourney.manager.teamName.left
        redTeamNameEl.innerText = redTeamName
        if (redTeamName.trim() === "") redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/transparent.png")`
        else redTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${redTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`

        document.cookie = `currentRedTeamName=${redTeamName}; path=/`
    }
    if (blueTeamName !== data.tourney.manager.teamName.right) {
        blueTeamName = data.tourney.manager.teamName.right
        blueTeamNameEl.innerText = blueTeamName
        if (blueTeamName.trim() === "") blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/transparent.png")`
        else blueTeamIconEl.style.backgroundImage = `url("../_shared/assets/team-icons/${blueTeamName.replace(/[<>:"/\\|?*]/g, '_')}.png")`

        document.cookie = `currentBlueTeamName=${blueTeamName}; path=/`
    }

    if (chatLen !== data.tourney.manager.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.manager.chat.length) ? (chatDisplayEl.innerHTML = "", chatLen = 0) : null
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

        chatDisplayEl.append(fragment)
        chatLen = data.tourney.manager.chat.length
        chatDisplayEl.scrollTop = chatDisplayEl.scrollHeight
    }

    // Autopicking
    if (mapId !== data.menu.bm.id && mapMd5 !== data.menu.bm.md5) {
        mapId = data.menu.bm.id
        mapMd5 = data.menu.bm.md5

        // Find element to click on
        const currentMap = document.getElementById(mapId)
        mappoolMap = findBeatmapById(mapId.toString())
        // Check if it can be clicked on
        if (currentMap && currentMap.dataset.pickerTeam === "false" && currentMap.dataset.bannedByRed === "false" && currentMap.dataset.bannedByBlue === "false" && isAutopickOn) {
            // Dispatch auto click
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: (nextPicker === "red")? 0 : 2
            })
            currentMap.dispatchEvent(event)

            // Check if it is the default map
            let setNextPicker = true
            if ((mapId === defaultMaps.RO32DefaultBeatmap && roundName === "RO32") ||
                (mapId === defaultMaps.RO16DefaultBeatmap && roundName === "RO16") ||
                (mapId === defaultMaps.QFDefaultBeatmap && roundName === "QF") ||
                (mapId === defaultMaps.SFDefaultBeatmap && roundName === "SF") ||
                (mapId === defaultMaps.FDefaultBeatmap && roundName === "F") ||
                (mapId === defaultMaps.GFDefaultBeatmap && roundName === "GF")) {
                setNextPicker = false
            }

            if (setNextPicker) {
                if (nextPicker === "red") updateNextAutoPicker("blue")
                else if (nextPicker === "blue") updateNextAutoPicker("red")
            }
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
    }

    // Get current state and assign winner based on state
    if (ipcState !== data.tourney.manager.ipcState) {
        previousIpcState = ipcState
        ipcState = data.tourney.manager.ipcState

        // Set winner stuff
        if (ipcState !== 4) checkedWinner = false
        if (ipcState === 4 && isStarOn) {
            checkedWinner = true

            // If map is RX map, and then apply winner
            let currentWinner = ""
            if (mappoolMap && mappoolMap.mod.includes("RX")) {
                if (redTeamScore < blueTeamScore) currentWinner = "red"
                else if (redTeamScore > blueTeamScore) currentWinner = "blue"
                else if (redTeamScoreSecondary > blueTeamScoreSecondary) currentWinner = "red"
                else if (redTeamScoreSecondary < blueTeamScoreSecondary) currentWinner = "blue"
            } else {
                if (redTeamScore > blueTeamScore) currentWinner = "red"
                else if (redTeamScore < blueTeamScore) currentWinner = "blue"
            }

            // Update star count
            updateStarCount(currentWinner, "plus")

            if ((mapId === defaultMaps.RO32DefaultBeatmap && roundName === "RO32") ||
                (mapId === defaultMaps.RO16DefaultBeatmap && roundName === "RO16") ||
                (mapId === defaultMaps.QFDefaultBeatmap && roundName === "QF") ||
                (mapId === defaultMaps.SFDefaultBeatmap && roundName === "SF") ||
                (mapId === defaultMaps.FDefaultBeatmap && roundName === "F") ||
                (mapId === defaultMaps.GFDefaultBeatmap && roundName === "GF")) {
                if (currentWinner === "red") updateNextAutoPicker("blue")
                else if (currentWinner === "blue") updateNextAutoPicker("red")
            }
        }

        // Check which scene to go to after a map is over
        if (previousIpcState === 4 && 
            ipcState !== previousIpcState && 
            enableAutoAdvance && 
            currentBlueScore !== currentFirstTo && 
            currentRedScore !== currentFirstTo &&
            isStarOn) {
            obsGetCurrentScene((scene) => {
                if (scene.name === mappool_scene_name) return
                obsSetCurrentScene(mappool_scene_name)
            })
        } else if (previousIpcState === 4 &&
            ipcState !== previousIpcState &&
            enableAutoAdvance
        ) {
            // obsGetCurrentScene((scene) => {
            //     if (scene.name === winner_scene_name) return
            //     obsSetCurrentScene(winner_scene_name)
            // })
        }
    }
}

// Update star count
function updateStarCount(side, action) {
    if (!isStarOn) return

    if (side === "red" && action === "plus") currentRedScore++
    else if (side === "blue" && action === "plus") currentBlueScore++
    else if (side === "red" && action === "minus") currentRedScore--
    else if (side === "blue" && action === "minus") currentBlueScore--

    if (currentRedScore > currentFirstTo) currentRedScore = currentFirstTo
    else if (currentRedScore < 0) currentRedScore = 0
    if (currentBlueScore > currentFirstTo) currentBlueScore = currentFirstTo
    else if (currentBlueScore < 0) currentBlueScore = 0

    createStarDisplay()
}

// Toggle Stars
const toggleStarsEl = document.getElementById("toggle-stars")
let isStarOn = true
function toggleStars() {
    isStarOn = !isStarOn
    if (isStarOn) {
        redTeamStarContainerEl.style.display = "flex"
        blueTeamStarContainerEl.style.display = "flex"
        toggleStarsEl.innerText = "Toggle Stars: ON"
    } else {
        redTeamStarContainerEl.style.display = "none"
        blueTeamStarContainerEl.style.display = "none"
        toggleStarsEl.innerText = "Toggle Stars: OFF"
    }
    document.cookie = `toggleStars=${isStarOn}; path=/`
}
document.cookie = `toggleStars=${isStarOn}; path=/`

// Toggle animations
const toggleAnimationsEl = document.getElementById("toggle-animations")
let isAnimationOn = true
function toggleAnimations() {
    isAnimationOn = !isAnimationOn
    toggleAnimationsEl.innerText = `Toggle Animations: ${isAnimationOn? "ON" : "OFF"}`
}

// Next Autopicker
const nextAutopickerEl = document.getElementById("next-auto-picker-team")
let nextPicker
function updateNextAutoPicker(team) {
    nextAutopickerEl.innerText = team.slice(0, 1).toUpperCase() + team.slice(1)
    nextPicker = team
}

// Toggle autopick
const toggleAutopickEl = document.getElementById("toggle-autopick")
let isAutopickOn = true
function toggleAutopick() {
    isAutopickOn = !isAutopickOn
    toggleAutopickEl.innerText = `Toggle Autopick: ${isAutopickOn? "ON" : "OFF"}`
}

// Select Action
const pickBanManagementEl = document.getElementById("pick-ban-management")
const pickBanManagementSelctOptionEl = document.getElementById("pick-ban-management-select-action")
const pickBanManagementAllActions = ["setBan","removeBan","setPick","removePick","setWinner","removeWinner"]
let pickBanManagementCurrentAction
function pickBanManagementSelectAction() {
    pickBanManagementCurrentAction = pickBanManagementSelctOptionEl.value
    if (!pickBanManagementAllActions.includes(pickBanManagementCurrentAction)) return
    pickBanManagementCurrentTeam = undefined
    pickBanManagementCurrentMap = undefined

    // Remove unwanted elements
    while (pickBanManagementEl.childElementCount > 3) pickBanManagementEl.lastElementChild.remove()

    // Which Map Title
    const whichMap = pickBanManagementCreateTitle("Which Map?")
    // Select Map
    const pickbanManagementButtonContainer = document.createElement("div")
    pickbanManagementButtonContainer.classList.add("pick-ban-management-button-container")

    if (pickBanManagementCurrentAction === "setWinner" || pickBanManagementCurrentAction === "removeWinner") 
        pickBanManagementGetMaps(pickbanManagementButtonContainer, true)
    else pickBanManagementGetMaps(pickbanManagementButtonContainer, false)
    
    pickBanManagementEl.append(whichMap, pickbanManagementButtonContainer)
    if (pickBanManagementCurrentAction !== "removePick" && pickBanManagementCurrentAction !== "removeWinner") {
        // Which Team Title
        const whichTeam = pickBanManagementCreateTitle("Which Team?")
        let teamSelect
        if (pickBanManagementCurrentAction === "setPick" || pickBanManagementCurrentAction === "setWinner") teamSelect = pickBanManagementCreateTeamSelect(2)
        else teamSelect = pickBanManagementCreateTeamSelect(3)
        pickBanManagementEl.append(whichTeam, teamSelect)
    }

    // Apply Changes Button Container
    const applyChangesButtonContainer = document.createElement("div")
    applyChangesButtonContainer.classList.add("sidebar-button-container")

    // Apply Changes Button
    const applyChangesButton = document.createElement("button")
    applyChangesButton.classList.add("full-length-button", "extra-height-button")
    applyChangesButton.innerText = "Apply Changes"

    let onclick
    switch (pickBanManagementCurrentAction) {
        case "setBan": onclick = "pickBanManagementSetBan()"; break;
        case "removeBan": onclick = "pickBanManagementRemoveBan()"; break;
        case "setPick": onclick = "pickBanManagementSetPick()"; break;
        case "removePick": onclick = "pickBanManagementRemovePick()"; break;
        case "setWinner": onclick = "pickBanManagementSetWinner()"; break;
        case "removeWinner": onclick = "pickBanManagementRemoveWinner()"
    }
    applyChangesButton.setAttribute("onclick", onclick)

    applyChangesButtonContainer.append(applyChangesButton)
    pickBanManagementEl.append(applyChangesButtonContainer)
}

// Title
function pickBanManagementCreateTitle(text) {
    const whichMap = document.createElement("div")
    whichMap.innerText = text
    whichMap.classList.add("pick-ban-management-title")
    return whichMap
}

// Pick Ban Management Get All Maps
function pickBanManagementGetMaps(elementToAppendTo, pickRequirement) {
    for (const key in allBeatmaps) {
        const beatmaps = allBeatmaps[key]
        for (let i = 0; i < beatmaps.length; i++) {
            if (pickRequirement && document.getElementById(beatmaps[i].beatmap_id).dataset.pickerTeam === "false") continue
            const mapButton = document.createElement("div")
            mapButton.classList.add("pick-ban-management-map-button")
            mapButton.innerText = `${key}${beatmaps[i].order + 1}`
            mapButton.addEventListener("click", pickBanManagementSetMap)
            mapButton.dataset.id = beatmaps[i].beatmap_id
            elementToAppendTo.append(mapButton)
        }
    }
}

// Pick Ban Management Create Team Select
function pickBanManagementCreateTeamSelect(numberOfElements) {
    // Create select for all teams
    const teamSelect = document.createElement("select")
    teamSelect.setAttribute("size", numberOfElements)
    teamSelect.setAttribute("id", "pick-ban-management-select-team")
    teamSelect.setAttribute("onchange", "pickBanManagementSelectTeam()")
    // Get all teams
    const redTeam = document.createElement("option")
    redTeam.setAttribute("value", "red")
    redTeam.innerText = "Red"
    const blueTeam = document.createElement("option")
    blueTeam.setAttribute("value", "blue")
    blueTeam.innerText = "Blue"

    teamSelect.append(redTeam, blueTeam)

    if (numberOfElements === 3) {
        const allTeams = document.createElement("option")
        allTeams.setAttribute("value", "all")
        allTeams.innerText = "All Teams"
        teamSelect.append(allTeams)
    }

    return teamSelect
}

// Pick Ban Management Set Map
let pickBanManagementCurrentMap
function pickBanManagementSetMap() {
    pickBanManagementCurrentMap = this.dataset.id
    const pickBanManagementMapButtonEls = document.getElementsByClassName("pick-ban-management-map-button")
    for (let i = 0; i < pickBanManagementMapButtonEls.length; i++) {
        pickBanManagementMapButtonEls[i].style.backgroundColor = "transparent"
        pickBanManagementMapButtonEls[i].style.color = "white"
    }

    this.style.backgroundColor = "#CECECE"
    this.style.color = "black"
}

// Pick Ban Management Select Team
let pickBanManagementCurrentTeam
const pickBanManagementSelectTeam = () => {
    const pickBanManagementSelectTeamEl = document.getElementById("pick-ban-management-select-team")
    pickBanManagementCurrentTeam = pickBanManagementSelectTeamEl.value
}

// Pick Ban Management Check
function pickBanManagementCheck(teamRequirement) {
    if (!pickBanManagementCurrentMap) return false
    if (teamRequirement && !pickBanManagementCurrentTeam) return false
    const currentMapElement = document.getElementById(pickBanManagementCurrentMap)
    if (!currentMapElement) return false
    return currentMapElement
}

// Pick Ban Management Set Ban
function pickBanManagementSetBan() {
    const currentMapElement = pickBanManagementCheck(true)
    if (!currentMapElement) return

    // Set actioned
    if (!currentMapElement.children[0].classList.contains("category-map-detail-container-actioned")) {
        currentMapElement.children[0].classList.add("category-map-detail-container-actioned")
    }

    currentMapElement.dataset.pickerTeam = "false"
    currentMapElement.dataset.bannedByRed = "false"
    currentMapElement.dataset.bannedByBlue = "false"

    // Set ban
    currentMapElement.children[1].children[0].innerText = "banned"
    currentMapElement.children[1].style.display = "block"
    if (pickBanManagementCurrentTeam === "red") {
        currentMapElement.children[1].children[1].innerText = "red"
        currentMapElement.dataset.bannedByRed = "true"
    } else if (pickBanManagementCurrentTeam === "blue") {
        currentMapElement.children[1].children[1].innerText = "blue"
        currentMapElement.dataset.bannedByBlue = "true"
    } else if (pickBanManagementCurrentTeam === "all") {
        currentMapElement.children[1].children[1].innerText = "red / blue"
        currentMapElement.dataset.bannedByRed = "true"
        currentMapElement.dataset.bannedByBlue = "true"
    }

    // Remove winner
    currentMapElement.children[2].style.display = "none"
}

// Pick Ban Management Remove Ban
function pickBanManagementRemoveBan() {
    const currentMapElement = pickBanManagementCheck(true)
    if (!currentMapElement) return

    // Check if the map is picked before removing the actioned
    if (currentMapElement.dataset.pickerTeam === "false") {

        // Check who banned it
        if (pickBanManagementCurrentTeam === "all") {
            currentMapElement.dataset.bannedByRed = "false"
            currentMapElement.dataset.bannedByBlue = "false"
        } else if (pickBanManagementCurrentTeam === "red") {
            currentMapElement.dataset.bannedByRed = "false"
        } else if (pickBanManagementCurrentTeam === "blue") {
            currentMapElement.dataset.bannedByBlue = "false"
        }

        // If no more bans
        if (currentMapElement.dataset.bannedByBlue === "false" && currentMapElement.dataset.bannedByRed === "false") {
            currentMapElement.children[1].style.display = "none"
            currentMapElement.children[0].classList.remove("category-map-detail-container-actioned")
        } else if (currentMapElement.dataset.bannedByRed === "true") {
            currentMapElement.children[1].style.display = "block"
            currentMapElement.children[1].children[1].innerText = "red"
        } else if (currentMapElement.dataset.bannedByBlue === "true") {
            currentMapElement.children[1].style.display = "block"
            currentMapElement.children[1].children[1].innerText = "blue"
        }
    }
}

// Pick Ban Management Set Pick
function pickBanManagementSetPick() {
    const currentMapElement = pickBanManagementCheck(true)
    if (!currentMapElement) return

    // Set actioned
    if (!currentMapElement.children[0].classList.contains("category-map-detail-container-actioned")) {
        currentMapElement.children[0].classList.add("category-map-detail-container-actioned")
    }

    currentMapElement.dataset.pickerTeam = "false"
    currentMapElement.dataset.bannedByRed = "false"
    currentMapElement.dataset.bannedByBlue = "false"

    // Set pick
    currentMapElement.children[1].children[0].innerText = "picked"
    currentMapElement.children[1].style.display = "block"
    if (pickBanManagementCurrentTeam === "red") {
        currentMapElement.children[1].children[1].innerText = "red"
        currentMapElement.dataset.pickerTeam = "red"
    } else if (pickBanManagementCurrentTeam === "blue") {
        currentMapElement.children[1].children[1].innerText = "blue"
        currentMapElement.dataset.pickerTeam = "blue"
    }

    // Remove winner
    currentMapElement.children[2].style.display = "none"
}

// Pick Ban Management Remove Pick
function pickBanManagementRemovePick() {
    const currentMapElement = pickBanManagementCheck(false)
    if (!currentMapElement) return

    currentMapElement.dataset.pickerTeam = "false"
    currentMapElement.children[2].style.display = "none"

    // Check if map is banned before removing the actioned
    if (currentMapElement.dataset.bannedByRed === "false" || currentMapElement.dataset.bannedByBlue === "false") {
        currentMapElement.children[1].style.display = "none"
        currentMapElement.children[0].classList.remove("category-map-detail-container-actioned")
    }
}

// Pick Ban Management Add Winner
function pickBanManagementSetWinner() {
    const currentMapElement = pickBanManagementCheck(true)
    if (!currentMapElement) return

    currentMapElement.children[2].style.display = "block"
    currentMapElement.children[2].setAttribute("src", `static/${pickBanManagementCurrentTeam}-won.png`)
}

// Pick Ban Management Remove Winner
function pickBanManagementRemoveWinner() {
    const currentMapElement = pickBanManagementCheck(false)
    if (!currentMapElement) return
    currentMapElement.children[2].style.display = "none"
}

// OBS Information
const sceneCollection = document.getElementById("sceneCollection")
let autoadvance_button = document.getElementById('auto-advance-button')
let autoadvance_timer_container = document.getElementById('autoAdvanceTimer')
let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel')
const pick_to_transition_delay_ms = 10000;
let enableAutoAdvance = false
const gameplay_scene_name = "Gameplay"
const mappool_scene_name = "Mappool"
const winner_scene_name = "Winner"

let sceneTransitionTimeoutID;

autoadvance_timer_container.style.opacity = '0';

function switchAutoAdvance() {
    enableAutoAdvance = !enableAutoAdvance
    if (enableAutoAdvance) {
        autoadvance_button.innerText = 'AUTO ADVANCE: ON'
        autoadvance_button.style.backgroundColor = 'var(--green)'
    } else {
        autoadvance_button.innerText = 'AUTO ADVANCE: OFF'
        autoadvance_button.style.backgroundColor = 'transparent'
    }
}

const obsGetCurrentScene = window.obsstudio?.getCurrentScene ?? (() => {})
const obsGetScenes = window.obsstudio?.getScenes ?? (() => {})
const obsSetCurrentScene = window.obsstudio?.setCurrentScene ?? (() => {})

obsGetScenes(scenes => {
    for (const scene of scenes) {
        let clone = document.getElementById("sceneButtonTemplate").content.cloneNode(true)
        let buttonNode = clone.querySelector('div')
        buttonNode.id = `scene__${scene}`
        buttonNode.textContent = `GO TO: ${scene}`
        buttonNode.onclick = function() { obsSetCurrentScene(scene); }
        sceneCollection.appendChild(clone)
    }

    obsGetCurrentScene((scene) => { document.getElementById(`scene__${scene.name}`).classList.add("active-scene") })
})

function scheduleSceneTransition(targetSceneName, delay) {
    const createTransitionTask = (duration) => setTimeout(() => {
        obsGetCurrentScene((currentScene) => {
            if (currentScene.name === targetSceneName) {
                autoadvance_timer_label.textContent = `Already on ${targetSceneName}\n`;
                return;
            }
            obsSetCurrentScene(targetSceneName);
            autoadvance_timer_container.style.opacity = '0';
        });
    }, duration)

    // use global timeout for this overlay, the pick/ban style doesn't lend to repeated pick events so
    // no point in idempotence
    clearTimeout(sceneTransitionTimeoutID);
    sceneTransitionTimeoutID = createTransitionTask(delay);

    let autoadvance_timer_time = new CountUp('autoAdvanceTimerTime',
        delay / 1000,
        0,
        1,
        delay / 1000,
        {useEasing: false, suffix: 's'}
    );
    autoadvance_timer_time.start();
    autoadvance_timer_container.style.opacity = '1';
    autoadvance_timer_label.textContent = `Switching to ${targetSceneName} in`;
}