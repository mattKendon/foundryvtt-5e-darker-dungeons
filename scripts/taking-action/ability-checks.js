
const KNOWLEDGE_SKILLS = [
    'arc', 'his', 'ins', 'inv', 'med',
    'nat', 'prc', 'rel'
]

export function openSkills(skl, options, actor) {

    const skill = actor.data.data.skills[skl]

    let parts = ['@prof']

    if (options.parts?.length > 0) {
        parts.push(...options.parts);
    }

    options = mergeObject(mergeObject({
        data: {
            prof: skill.prof,
            abilities: actor.data.data.abilities,
            ability: skill.ability
        },
        template: "modules/5e-darker-dungeons/templates/chat/roll-skill-dialog.html"
    }, options), {parts: parts})

    return options
}

export function secretKnowledge(skl, options) {

    if (KNOWLEDGE_SKILLS.includes(skl)) {
        options = mergeObject({rollMode: "blindroll"}, options)
    }

    return options
}

export function intelligentInitiative(actor) {
    actor.data.data.attributes.init.mod = actor.data.data.abilities.int.mod
}