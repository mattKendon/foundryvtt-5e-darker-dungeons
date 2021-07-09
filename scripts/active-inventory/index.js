
import configuration from "../configuration.js"

const BASE_BY_SIZE = {
    'tiny': {'base': 6, 'mod': 1, 'min': 5},
    'sm': {'base': 14, 'mod': 1, 'min': 10},
    'med': {'base': 18, 'mod': 1, 'min': 20},
    'lg': {'base': 22, 'mod': 2, 'min': 40},
    'huge': {'base': 30, 'mod': 4, 'min': 80},
    'grg': {'base': 46, 'mod': 8, 'min': 160}
}


function calculateMaxInventorySlots(size, str, powerfulBuild) {

    let index = Object.keys(BASE_BY_SIZE).indexOf(size)

    if (powerfulBuild) {
        index += 1
    }

    const base = BASE_BY_SIZE[Object.keys(BASE_BY_SIZE)[index]]

    return base.base + (str * base.mod)
}

export function computeEncumbrance(actorData) {

    const powerfulBuild = this.getFlag("dnd5e", "powerfulBuild")

    // Get the total weight from items
    const physicalItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
    const attireItems = ['clothing', 'bonus', 'natural', 'trinket']
    let bulk = actorData.items.reduce((bulk, i) => {
        if ( !physicalItems.includes(i.type) ) return bulk;
        if (i.getFlag(configuration.MODULE_NAME, 'attire') && i.data.data.equipped) return bulk;
        const q = i.data.data.quantity || 0;
        let w;
        try {
            w = i.getFlag(configuration.MODULE_NAME, 'slots') || 0;
        } catch {
            w = 0
        }
        return bulk + (q * w);
    }, 0);

    // [Optional] add Currency Weight (4for non-transformed actors)
    if ( game.settings.get("dnd5e", "currencyWeight") && actorData.data.currency ) {
        const currency = actorData.data.currency;
        const numCoins = Object.values(currency).reduce((val, denom) => val += Math.max(denom, 0), 0);

        bulk += Math.max((numCoins / 100) - 1, 0);
    }

    let str = actorData.data.abilities.str.mod

    if (game.settings.get(configuration.MODULE_NAME, "pack-endurance")) {
        str = Math.max(str, actorData.data.abilities.con.mod)
    }

    // Compute Encumbrance percentage
    bulk = bulk.toNearest(0.1);
    const unencumbered = calculateMaxInventorySlots(actorData.data.traits.size, str, powerfulBuild);
    const max = unencumbered * 1.5;
    const pct = Math.clamped((bulk * 100) / max, 0, 100);
    const value = bulk.toNearest(0.1)

    return { value: value, max, pct, encumbered: value > unencumbered };
}