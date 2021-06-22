
import {openSkills, secretKnowledge} from "./taking-action/ability-checks.js"
import {
    monsterMakerApplyAC,
    monsterMakerApplyHP,
    monsterMakerApplyAbilities,
    monsterMakerApplySkills,
    monsterMakerApplyXP,
    monsterMakerApplyInitiative
} from "./monster-maker/index.js"
import {libWrapper} from "./libWrapperShim.js";

const MODULE_NAME = "5e-darker-dungeons";

Hooks.once('init', async function() {
    console.log("Initializing 5e-darker-dungeons");
    game.settings.register(MODULE_NAME, "open-skills", {
        name: 'Open Skills',
        hint: 'Allow changing the ability modifier to be used for a skill check.',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(MODULE_NAME, "secret-knowledge", {
        name: 'Secret Knowledge',
        hint: 'Make all knowledge rolls secret.',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
});

Hooks.once('ready', async function() {
    console.log("Patching CONFIG.Actor.entityClass.prototype.rollSkill");
    libWrapper.register(MODULE_NAME, 'CONFIG.Actor.entityClass.prototype.rollSkill', function(wrapper, skl, options) {
        if (game.settings.get(MODULE_NAME, "open-skills")) {
            options = openSkills(skl, options, this)
        }

        if (game.settings.get(MODULE_NAME, "secret-knowledge")) {
            options = secretKnowledge(skl, options);
        }

        try {
            return wrapper(skl, options);
        } catch (e) {console.error(e);}

    }, 'WRAPPER');

    console.log("Patching CONFIG.Actor.entityClass.prototype._computeEncumbrance");
    libWrapper.register(MODULE_NAME, 'CONFIG.Actor.entityClass.prototype._computeEncumbrance', function (actorData) {
        // Get the total weight from items
        const physicalItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
        let bulk = actorData.items.reduce((bulk, i) => {
            if ( !physicalItems.includes(i.type) ) return bulk;
            const q = i.data.quantity || 0;
            const w = i.data.slots || 0;
            return bulk + (q * w);
        }, 0);

        // [Optional] add Currency Weight (for non-transformed actors)
        if ( game.settings.get("dnd5e", "currencyWeight") && actorData.data.currency ) {
            const currency = actorData.data.currency;
            const numCoins = Object.values(currency).reduce((val, denom) => val += Math.max(denom, 0), 0);
            bulk += numCoins / CONFIG.DND5E.encumbrance.currencyPerWeight;
        }

        // Determine the encumbrance size class
        let mod = {
            tiny: 0.5,
            sm: 1,
            med: 1,
            lg: 2,
            huge: 4,
            grg: 8
        }[actorData.data.traits.size] || 1;
        if ( this.getFlag("dnd5e", "powerfulBuild") ) mod = Math.min(mod * 2, 8);

        // Compute Encumbrance percentage
        bulk = bulk.toNearest(0.1);
        const max = actorData.data.abilities.str.value * CONFIG.DND5E.encumbrance.strMultiplier * mod;
        const pct = Math.clamped((bulk * 100) / max, 0, 100);
        return { value: bulk.toNearest(0.1), max, pct, encumbered: pct > (2/3) };

    }, 'OVERRIDE');

    Hooks.on("renderItemSheet", function(app, html, data) {
        let weight = html.find(`.item-properties .form-group input[name='data.weight']`)[0].parentElement;

        if (weight) {
            renderItemSlotsField(weight, data)
        }

    });

    //Slots won't get carried over, so this gets the slots value
    //from the preCreateOwnedItem and then added a one off hook
    //to assign the slots value back to the item after it has
    //been stripped out.
    Hooks.on("preCreateOwnedItem", function (entity, data) {
        let slotsValue = data.data.slots

        Hooks.once("createOwnedItem", function (entity, data) {
            data.data.slots = slotsValue
        })

    })

});

async function renderItemSlotsField(weight,  data) {
    let el = await renderTemplate('modules/5e-darker-dungeons/templates/item-slots-field.html', data)
    $(weight).after(el)
}

Hooks.on("applyActiveEffect", monsterMakerApplyAC)
Hooks.on("applyActiveEffect", monsterMakerApplyAbilities)
Hooks.on("applyActiveEffect", monsterMakerApplyHP)
Hooks.on("applyActiveEffect", monsterMakerApplySkills)
Hooks.on("applyActiveEffect", monsterMakerApplyInitiative())
Hooks.on("applyActiveEffect", monsterMakerApplyXP)
