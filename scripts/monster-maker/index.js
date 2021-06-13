
function getMonsterLevelFromActor(actor) {
    return getMonsterFeatFromActor(actor, 'Monster Level')
}

function getMonsterRoleFromActor(actor) {
    return getMonsterFeatFromActor(actor, 'Monster Role')
}

function getMonsterRankFromActor(actor) {
    return getMonsterFeatFromActor(actor, 'Monster Rank')
}

function getMonsterFeatFromActor(actor, featName) {
    let mls = actor.data.items.filter((i) => { return i.name.includes(featName)})

    if (mls.length === 0) {
        return false;
    } else {
        return mls[0]
    }
}

function getMonsterFeatNumber(feat, key) {
    let attribute = getMonsterFeatAttribute(feat, key)

    if (!attribute) {
        return null
    }

    let number = parseInt(attribute)

    if (!isNaN(number)) {
        return number
    }

    number = Number(attribute.replace( /^\D+/g, ''))

    if (attribute.includes("x")) {
        return number
    }

    return 0 - number
}

function getMonsterFeatAttribute(feat, key) {
    let parser = new DOMParser()
    let dom = parser.parseFromString(feat.data.description.value, 'text/html')

    return dom.getElementById(key).innerText
}

export function monsterMakerApplyAbilities(actor, change) {

    const changes = [
        "data.abilities.str.value",
        "data.abilities.dex.value",
        "data.abilities.con.value",
        "data.abilities.int.value",
        "data.abilities.wis.value",
        "data.abilities.cha.value",
        "data.abilities.str.save",
        "data.abilities.dex.save",
        "data.abilities.con.save",
        "data.abilities.int.save",
        "data.abilities.wis.save",
        "data.abilities.cha.save",
    ]

    // actor is the actor being processed and change a key/value pair
    if (!changes.includes(change.key)) return;

    const actorData = actor.data.data;

    let ml = getMonsterLevelFromActor(actor)

    if (!ml) return;

    let parts = change.key.split('.')

    if (parts[3] == 'save') {
        let saving_throws = getMonsterFeatAttribute(ml, 'mm-ml-st-val').split(", ")

        let st_value = 2
        if (change.value < 4) {
            st_value = 1
        }
        if (change.value == 1) {
            st_value = 0
        }

        actorData['abilities'][parts[2]][parts[3]] = saving_throws[st_value];

    } else {

        let attribute_mods = getMonsterFeatAttribute(ml, 'mm-ml-am-val').split(", ")

        actorData['abilities'][parts[2]][parts[3]] = (attribute_mods[change.value-1]*2) + 10;
    }

}

export function monsterMakerApplyAC(actor, change) {

    if (change.key !== 'data.attributes.ac.value') return;

    let role = getMonsterRoleFromActor(actor)
    let rank = getMonsterRankFromActor(actor)

    let sum =  Number(change.value)

    if (role) {
        sum += getMonsterFeatNumber(role, 'mm-mrl-ac-val')
    }

    if (rank) {
        sum +=  getMonsterFeatNumber(rank, 'mm-mr-ac-val')
    }

    actor.data.data.attributes.ac.value = sum
}

export function monsterMakerApplyHP(actor, change) {

    if (change.key !== 'data.attributes.hp.max') return;

    let role = getMonsterRoleFromActor(actor)
    let rank = getMonsterRankFromActor(actor)

    let sum =  Number(change.value)

    if (role) {
        sum *= getMonsterFeatNumber(role, 'mm-mrl-hp-val')
    }

    if (rank) {
        sum *=  getMonsterFeatNumber(rank, 'mm-mr-hp-val')
    }

    actor.data.data.attributes.hp.max = sum
}

export function monsterMakerApplyXP(actor, change) {

    if (change.key !== 'data.details.xp.value') return;

    let rank = getMonsterRankFromActor(actor)

    let total =  Number(change.value)

    if (rank) {
        total *=  getMonsterFeatNumber(rank, 'mm-mr-hp-val')
    }

    actor.data.data.details.xp.value = total
}

export function monsterMakerApplySkills(actor, change) {

    const changes = [
        "data.skills.prc.mod",
        "data.attributes.init.bonus",
        "data.skills.ste.mod",
    ]

    // actor is the actor being processed and change a key/value pair
    if (!changes.includes(change.key)) return;

    let parts = change.key.split('.')

    let role = getMonsterRoleFromActor(actor)
    let rank = getMonsterRankFromActor(actor)

    let sum =  Number(change.value)

    if (role) {
        let trained = getMonsterFeatAttribute(role, 'mm-mrl-' + parts[2] + '-val')
        if (trained) {
            let ml = getMonsterLevelFromActor(actor)
            sum += getMonsterFeatNumber(ml, 'mm-ml-prof-val')
        }
    }

    if (rank) {
        sum +=  getMonsterFeatNumber(rank, 'mm-mr-' + parts[2] + '-val')
    }

    actor.data.data[parts[1]][parts[2]][parts[3]] += sum
}