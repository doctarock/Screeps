var aiSource = require('ai.sourceFinder');
var roleBuilder = {
    spawn: function(base,population,extCount) {
        var newName = 'Builder' + Game.time;
        
        if (base.spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName, {memory: {role: 'builder', action: "recharge", home: base.room.name, away: false, target: aiSource.getSource(base,population[base.room.name].builders.length,population)}}) < 0){
            if (base.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: 'builder', action: "recharge", home: base.room.name, away: false, target: aiSource.getSource(base,population[base.room.name].builders.length,population)}}) == 0){

                console.log('Spawning new mini builder: ' + newName);
            };
            
        }else {
            
            console.log('Spawning new builder: ' + newName);
        }
    },
    spawnAway: function(base,population,away) {
        var newName = 'Builder' + Game.time;
        if (base.spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName, {memory: {role: 'builder', action: "recharge", home: base.room.name, away: away, target: aiSource.getSource(base,population[base.room.name].builders.length,population)}}) == 0){  
            console.log('Spawning remote builder: ' + newName);
        }
    },
    run: function(creep,population,iteration) {
        
        let workLoc = creep.memory.away;
        if (workLoc == false){
            workLoc = creep.room.name;
        }
	    if(creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.action = false;
            creep.memory.target = false;
            creep.say('⛽️');
	    }
	    if(creep.store.getFreeCapacity() == 0 && (creep.memory.action == false || creep.memory.action == "recharge")) {
	        creep.memory.action = "building";
            creep.memory.target = false;
	        creep.say('🔋');
	    }
        switch (creep.memory.action){
            case "building":
                if(creep.memory.target == false && typeof population[workLoc].sites[0] != "undefined") {
                    creep.memory.target = population[workLoc].sites[0].id;
                }
                
                target = Game.getObjectById(creep.memory.target);
                let result = creep.build(target);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.say('🚧🛺');
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                } else if (result < 0) {
                    creep.memory.action = "repairing";
                    creep.memory.target = false;
                    creep.say('🧱 '+result);
                } else {
                    creep.say('👷🏻‍♂️');
                }
                break;
            case "repairing":
                creep.say('🚧');
                let result2 = aiSource.repairAnything(creep);
                if (result2){
                    creep.memory.action = false;
                    creep.memory.target = false;
                };
                break;
            case "recharge":
            default:
                let roomSpawns =  _.filter(population[creep.room.name].spawns, (structure) => (structure.energy > structure.store.getFreeCapacity(RESOURCE_ENERGY)));

                if (roomSpawns.length && population[creep.room.name].harvesters.length > 1){
                    let result = creep.withdraw(roomSpawns[0], RESOURCE_ENERGY);
                    if(creep.withdraw(roomSpawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(roomSpawns[0]);
                    }
                    creep.say('🔌🔋');
                } else if (aiSource.harvestAnySource(creep,false) && creep.memory.home !== creep.room.name) {
                    creep.say(creep.room.name+'🧭 '+creep.memory.home);
                    ai.goToRoom(creep, creep.memory.home);
                } else {
                    aiSource.harvestSource(creep,aiSource.getSource(creep,iteration,population))
                }
        }
	}
};

module.exports = roleBuilder;