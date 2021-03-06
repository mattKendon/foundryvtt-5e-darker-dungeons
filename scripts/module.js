import {openSkills, secretKnowledge} from "./taking-action/ability-checks.js"
import ActorSheet5eCharacter from "../../../systems/dnd5e/module/actor/sheets/character.js"
import configuration from "./configuration.js"
import {computeEncumbrance} from "./active-inventory/index.js"
import {
    monsterMakerApplyAC,
    monsterMakerApplyHP,
    monsterMakerApplyAbilities,
    monsterMakerApplySkills,
    monsterMakerApplyXP,
    monsterMakerApplyInitiative
} from "./monster-maker/index.js"
import {libWrapper} from "./libWrapperShim.js";


Hooks.once('init', async function() {
    console.log("Initializing 5e-darker-dungeons");
    game.settings.register(configuration.MODULE_NAME, "open-skills", {
        name: 'Open Skills',
        hint: 'Allow changing the ability modifier to be used for a skill check.',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(configuration.MODULE_NAME, "secret-knowledge", {
        name: 'Secret Knowledge',
        hint: 'Make all knowledge rolls secret.',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(configuration.MODULE_NAME, "active-inventory", {
        name: 'Active Inventory',
        hint: 'Use slots to calculate inventory capacity and encumberance',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(configuration.MODULE_NAME, "pack-endurance", {
        name: 'Active Inventory: Pack Endurance',
        hint: 'Use strength or constitution when calculating maximum number of slots',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
});

Hooks.once('ready', async function() {
    console.log("Patching CONFIG.Actor.entityClass.prototype.rollSkill");
    libWrapper.register(configuration.MODULE_NAME, 'CONFIG.Actor.entityClass.prototype.rollSkill', function(wrapper, skl, options) {
        if (game.settings.get(configuration.MODULE_NAME, "open-skills")) {
            options = openSkills(skl, options, this)
        }

        if (game.settings.get(configuration.MODULE_NAME, "secret-knowledge")) {
            options = secretKnowledge(skl, options);
        }

        try {
            return wrapper(skl, options);
        } catch (e) {console.error(e);}

    }, 'WRAPPER');

    if (game.settings.get(configuration.MODULE_NAME, "active-inventory")) {

        console.log("Patching CONFIG.Actor.entityClass.prototype._computeEncumbrance");
        libWrapper.register(configuration.MODULE_NAME, 'CONFIG.Actor.entityClass.prototype._computeEncumbrance', computeEncumbrance, 'OVERRIDE');

        Hooks.on("renderActorSheet5eCharacter", function(app, html) {
            html.find(`.item-detail.item-weight .item-detail`).each(function () {
                this.innerText = this.innerText.replace("lbs.", "")
            })
            html.find(`.items-header .item-detail.item-weight`).each(function () {
                this.innerText = "Slots"
            })
        });

        Hooks.on("renderItemSheet", function(app, html, data) {
            data.data.attire = app.object.getFlag(configuration.MODULE_NAME, 'attire')
            let weight = html.find(`.item-properties .form-group input[name='data.weight']`)[0].parentElement;

            if (weight) {
                renderItemAttireField(weight, data)
            }

        });

        Hooks.on("updateItem", function (entity, data) {
            if (data.hasOwnProperty('data') && data.data.hasOwnProperty('attire')) {
                entity.setFlag(configuration.MODULE_NAME, 'attire', data.data.attire)
            }
        })
        Hooks.on("updateOwnedItem", function (entity, data) {
            if (data.hasOwnProperty('data') && data.data.hasOwnProperty('attire')) {
                entity.items.filter((i)=> i.data._id == data._id)[0].setFlag(configuration.MODULE_NAME, 'attire', data.data.attire)
            }
        })

    }

});

async function renderItemAttireField(weight,  data) {
    let el = await renderTemplate('modules/5e-darker-dungeons/templates/item-attire-field.html', data)
    $(weight).after(el)
}

Hooks.on("applyActiveEffect", monsterMakerApplyAC)
Hooks.on("applyActiveEffect", monsterMakerApplyAbilities)
Hooks.on("applyActiveEffect", monsterMakerApplyHP)
Hooks.on("applyActiveEffect", monsterMakerApplySkills)
Hooks.on("applyActiveEffect", monsterMakerApplyInitiative)
Hooks.on("applyActiveEffect", monsterMakerApplyXP)
