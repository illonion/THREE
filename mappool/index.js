// Round Text
const roundTextEl = document.getElementById("round-text")

// Get beatmaps
const mappoolSectionEl = document.getElementById("mappool-section")
let currentBestOf = 0, currentFirstTo = 0, currentRedScore = 0, currentBlueScore = 0
let allBeatmaps
async function getBeatmaps() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps
    
    const roundName = responseJson.roundName
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
            categoryMapPickedByTeam.classList.add("cateogry-map-pick-ban-team")
            categoryMapPickedBy.append(categoryMapPickBanAction, " by ", categoryMapPickedByTeam)

            // Create category map winner
            const categoryMapWinner = document.createElement("img")
            categoryMapWinner.classList.add("cateogry-map-winner")

            categoryMap.append(categoryMapDetailContainer, categoryMapPickedBy, categoryMapWinner)
            categoryMapContainer.append(categoryMap)
        }

        categorySection.append(categoryIcon, categoryMapContainer)
        mappoolSectionEl.append(categorySection)
    }
}
getBeatmaps()

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
}