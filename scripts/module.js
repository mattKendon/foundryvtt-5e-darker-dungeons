
import {openSkills, secretKnowledge, intelligentInitiative} from "./taking-action/ability-checks.js"
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
    game.settings.register(MODULE_NAME, "intelligent-initiative", {
        name: 'Intelligent Initiative',
        hint: 'Use Intelligence for initiative.',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
    });
});

Hooks.once('ready', async function() {
    console.log("Patching CONFIG.Actor.entityClass.prototype.rollInitiative");
    libWrapper.register(MODULE_NAME, 'CONFIG.Actor.entityClass.prototype.rollInitiative', function(wrapper, ...args) {

        if (game.settings.get(MODULE_NAME, "intelligent-initiative")) {
            intelligentInitiative(this)
        }

        try {
            wrapper(args);
        } catch (e) {console.error(e);}

    }, 'WRAPPER');

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
});

Hooks.on("applyActiveEffect", monsterMakerApplyAC)
Hooks.on("applyActiveEffect", monsterMakerApplyAbilities)
Hooks.on("applyActiveEffect", monsterMakerApplyHP)
Hooks.on("applyActiveEffect", monsterMakerApplySkills)
Hooks.on("applyActiveEffect", monsterMakerApplyInitiative())
Hooks.on("applyActiveEffect", monsterMakerApplyXP)
