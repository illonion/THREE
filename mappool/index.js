// Team Info
const redTeamIconEl = document.getElementById("red-team-icon")
const blueTeamIconEl = document.getElementById("blue-team-icon")
const redTeamNameEl = document.getElementById("red-team-name")
const blueTeamNameEl = document.getElementById("blue-team-name")
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")
let redTeamName, blueTeamName

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
}