
import patchActor5eRollSkill from "./taking-action/ability-checks.js"
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
});

Hooks.once('ready', async function() {
    if (game.settings.get(MODULE_NAME, "open-skills")) {
        console.log("Patching CONFIG.Actor.entityClass.prototype.rollSkill");
        libWrapper.register(MODULE_NAME, 'CONFIG.Actor.documentClass.prototype.rollSkill', patchActor5eRollSkill, 'WRAPPER');
    }
});

Hooks.on("applyActiveEffect", monsterMakerApplyAC)
Hooks.on("applyActiveEffect", monsterMakerApplyAbilities)
Hooks.on("applyActiveEffect", monsterMakerApplyHP)
Hooks.on("applyActiveEffect", monsterMakerApplySkills)
Hooks.on("applyActiveEffect", monsterMakerApplyInitiative())
Hooks.on("applyActiveEffect", monsterMakerApplyXP)
