export default function patchActor5eRollSkill(wrapper, ...args) {

    const skl = this.data.data.skills[args[0]]

    let options = args[1]
    let parts = ['@prof']

    if (options.parts?.length > 0) {
        parts.push(...options.parts);
    }

    args[1] = mergeObject(mergeObject({
        data: {
            prof: skl.prof,
            abilities: this.data.data.abilities,
            ability: skl.ability
        },
        template: "modules/5e-darker-dungeons/templates/chat/roll-skill-dialog.html"
    }, options), {parts: parts})

    try {
        return wrapper(...args);
    } catch (e) {console.error(e);}


}