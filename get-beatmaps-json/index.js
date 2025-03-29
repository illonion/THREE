// Load osu! api
let osuApi
async function getApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}

const allBeatmapsJson = []
let fullJson = []

async function getBeatmaps() {
    const response = await fetch("../_data/beatmaps-base.json")
    const responseJson = await response.json()
    const beatmapsByTeam = responseJson.beatmaps
    const roundName = responseJson.round_name
    const structuredBeatmaps = {}

    for (const [categoryName, beatmaps] of Object.entries(beatmapsByTeam)) {
        structuredBeatmaps[categoryName] = []

        for (let i = 0; i < beatmaps.length; i++) {
            const beatmap = beatmaps[i]

            let modNumber = 0
            if (beatmap.mod === "HR") modNumber = 16
            else if (beatmap.mod === "DT") modNumber = 64
            else if (beatmap.mod === "HD") modNumber = 8
            else if (beatmap.mod === "EZ") modNumber = 2

            const apiUrl = `https://api.codetabs.com/v1/proxy?quest=` + encodeURIComponent(
                `https://osu.ppy.sh/api/get_beatmaps?k=${osuApi}&b=${beatmap.beatmap_id}&mods=${modNumber}`
            )

            const apiResponse = await fetch(apiUrl)
            await delay(1000) // throttle
            const apiJson = await apiResponse.json()

            if (!apiJson[0]) {
                console.warn(`No data returned for beatmap ${beatmap.beatmap_id}`)
                continue
            }

            const enrichedBeatmap = {
                ...apiJson[0],
                mod: beatmap.mod,
                order: i
            }

            structuredBeatmaps[categoryName].push(enrichedBeatmap)
        }
        allBeatmapsJson.push(structuredBeatmaps)
    }

    const fullJson = {
        roundName: roundName,
        beatmaps: allBeatmapsJson
    }

    const jsonString = JSON.stringify(fullJson, null, 4)
    const blob = new Blob([jsonString], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "beatmaps.json"
    link.click()
}

async function initialise() {
    await getApi()
    await getBeatmaps()
}
initialise()