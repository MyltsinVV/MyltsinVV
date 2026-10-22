const BASE_URL = 'https://www.codingame.com/services/'

export function call(method, ...args) {
    return fetch(`${BASE_URL}${method}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(args)
    }).then(res => {
        if (res.ok) return res.json()

        throw new Error(`Request failed: ${method} ${res.status}`)
    })
}

export async function fetchProfile(handle) {
    const stats = await call('CodinGamer/findCodingamePointsStatsByHandle', handle)

    if (!stats) throw new Error('Codingamer not found')

    const userId = stats.codingamer.userId

    const [language, certifications, points, achievements] = await Promise.all([
        call('Puzzle/countSolvedPuzzlesByProgrammingLanguage', userId),
        call('QuestCertification/findTopQuestCertifications', userId),
        call('CodinGamer/findRankingPoints', userId),
        call('Achievement/findByCodingamerId', userId)
    ])

    return {
        stats,
        language,
        certifications,
        points,
        achievements
    }
}

