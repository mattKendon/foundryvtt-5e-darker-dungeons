
const KNOWLEDGE_SKILLS = [
    'arc', 'his', 'ins', 'inv', 'med',
    'nat', 'prc', 'rel'
]

export function openSkills(skl, options, actor) {

    const skill = actor.data.data.skills[skl]

    let parts = ['@prof']

    options = mergeObject(mergeObject({
        chooseModifier: true,
        data: mergeObject(actor.getRollData(), {item: {ability: skill.ability}}),
    }, options), {parts: parts})

    return options
}

export function secretKnowledge(skl, options) {

    if (KNOWLEDGE_SKILLS.includes(skl)) {
        options = mergeObject({rollMode: "blindroll"}, options)
    }

    return options
}