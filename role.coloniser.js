var aiSource = require('ai.sourceFinder');
var ai = require('ai.general');
var roleSettler = {
    spawn: function(spawnHome){
        var newName = 'settler' + Game.time;
        console.log('Spawning new settler: ' + newName);
        return(spawnHome.spawnCreep([CLAIM,MOVE,MOVE], newName, 
            {memory: {role: 'settler',home: spawnHome.room.name, away: false}}));
    },
    run: function(creep,population) {
        var enemies = population[creep.room.name].enemies.list;
	    if (creep.memory.away !== creep.room.name){
            creep.say('🧭 expedition');
            ai.goToRoom(creep, creep.memory.away);
        } else if(enemies.length != 0) {
            creep.memory.away = false;
        } else{
            let claim = creep.claimController(creep.room.controller);
            if(claim == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            } else if (claim == -7){
                creep.memory.away = ai.findExit(creep.room.name,false);
            } else {
                console.log("claim "+creep.room.name,claim);
            }
        }
        if (creep.memory.away === false){
            creep.say('🧳 leave '+enemies.length);
            creep.memory.away = ai.findExit(creep.room.name,false);
        } else {
            creep.say('👨🏼‍✈️');
        }
	}
};

module.exports = roleSettler;