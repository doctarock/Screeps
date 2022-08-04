var aiSource = require('ai.sourceFinder');
var roleUpgrader = {
    spawn: function(base,population){
        var newName = 'upgrader' + Game.time;
        if (base.spawnCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], newName, {memory: {role: 'upgrader',source: aiSource.getSource(base,population[base.room.name].upgraders.length,population)}}) < 0){
            if (base.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName, {memory: {role: 'upgrader',source: aiSource.getSource(base,population[base.room.name].upgraders.length,population)}}) < 0){
                if(base.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: 'upgrader',source: aiSource.getSource(base,population[base.room.name].upgraders.length,population)}}) == 0){
                    console.log('Spawning new mini upgrader: ' + newName);
                }
            } else {
                console.log('Spawning new upgrader: ' + newName);
            }
        } else {
            console.log('Spawning new maxi upgrader: ' + newName);
        }
    },
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            aiSource.harvestClosestSource(creep);
        }
	}
};

module.exports = roleUpgrader;