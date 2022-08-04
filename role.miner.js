var aiSource = require('ai.sourceFinder');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep,iteration,population) {
	    if(creep.store.getFreeCapacity() > 0) {
	        var sources = creep.room.find(FIND_MINERALS);
	        var mySource = aiSource.getSource(creep,iteration,population);
            if(creep.harvest(sources[mySource]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[mySource], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            // var targets = creep.room.find(FIND_STRUCTURES, {
            //         filter: (structure) => {
            //             return (structure.structureType == STRUCTURE_EXTENSION ||
            //                     structure.structureType == STRUCTURE_SPAWN ||
            //                     structure.structureType == STRUCTURE_TOWER) && 
            //                     structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            //         }
            // });
            // if(targets.length > 0) {
            //     if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            //     }
            // } else {
            //     if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            //     }
            // }
        }
	}
};

module.exports = roleHarvester;