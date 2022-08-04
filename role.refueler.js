var aiSource = require('ai.sourceFinder');
var ai = require('ai.general');
var roleHarvester = {

    spawn: function(base){
        var newName = 'Refueler' + Game.time;
        if (base.spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: 'refueler',type:1,action:false,home: base.room.name}}) < 0){
            base.spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, {memory: {role: 'refueler',type:0,action:false,home: base.room.name}});
        };
    },
    run: function(creep,population) {
        let success;
        switch (creep.memory.action){
            case "rest":
                creep.say('😴');
                success = ai.rest(creep,population);
                if (success) creep.memory.action = false;
                break;
            case "refuel":
                
                success = aiSource.refuelAnything(creep);
                if (success || creep.store.getFreeCapacity() == creep.store.getCapacity()) creep.memory.action = false;
                break;
            default:
                if(creep.store.getFreeCapacity() > 0) {
                    creep.say('I ❤️ hip');
                    aiSource.harvestAnySource(creep,false);
                } else {
                    creep.say('❤️');
                    creep.memory.action = "refuel";
                    creep.memory.target = false;
                }
        }  
        if (creep.ticksToLive < 250) {
            creep.memory.action = "rest";
        }
	}
};

module.exports = roleHarvester;