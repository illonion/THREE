// Load osu! api
let osuApi
async function getApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}

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

            let modNumber = 0;
            if (beatmap.mod.includes("HR")) modNumber += 16
            if (beatmap.mod.includes("DT")) modNumber += 64
            if (beatmap.mod.includes("HD")) modNumber += 8
            if (beatmap.mod.includes("EZ")) modNumber += 2
            if (beatmap.mod.includes("HT")) modNumber += 256

            const apiUrl = `https://api.codetabs.com/v1/proxy?quest=` + encodeURIComponent(
                `https://osu.ppy.sh/api/get_beatmaps?k=${osuApi}&b=${beatmap.beatmap_id}&mods=${modNumber}`
            )

            const apiResponse = await fetch(apiUrl)
            await delay(1000)
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

            if (beatmap.score_method) enrichedBeatmap["score_method"] = beatmap.score_method
            if (beatmap.score_method_2) enrichedBeatmap["score_method_2"] = beatmap.score_method_2

            structuredBeatmaps[categoryName].push(enrichedBeatmap)
        }
    }

    // Create the final JSON object directly from structuredBeatmaps
    const fullJson = {
        roundName: roundName,
        beatmaps: structuredBeatmaps
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