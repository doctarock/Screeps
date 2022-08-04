var aiSource = require('ai.sourceFinder');
var aiBattle = require('ai.battle');
var ai = require('ai.general');
var roleFighter = {
    spawn: function(spawnHome){
        var newName = 'fighter' + Game.time;
        if (spawnHome.spawnCreep([ATTACK,ATTACK,ATTACK,TOUGH,TOUGH,MOVE,MOVE,MOVE], newName, {memory: {role: 'fighter',home: spawnHome.room.name, away: false, target: false, action: false}})<0){
            if (spawnHome.spawnCreep([ATTACK,ATTACK,TOUGH,MOVE,MOVE], newName, {memory: {role: 'fighter',home: spawnHome.room.name, away: false, target: false, action: false}})== 0){
                
            console.log('Spawning new mini fighter: ' + newName);
            };
        } else {
            console.log('Spawning new fighter: ' + newName);
        }
    },
    run: function(creep, population,quotas) {
        var enemies = population[creep.room.name].enemies.list;
        var enemy_base = population[creep.room.name].enemies.buildings;
        var posInRoom = new RoomPosition(25, 25, creep.room.name);
        if (creep.memory.action != "fighting"){
                if (creep.memory.away === false){
                    if (population.fighters.list.length > 4){
    
                        creep.say('🚧 leave '+enemies.length);
                        creep.memory.away = ai.findExit(creep.room.name,0);
                    } else {
                        var posInRoom = new RoomPosition(24, 24, creep.room.name);
                        creep.moveTo(posInRoom);
                        creep.say('⚖️');
    
                    }
                } else {
                    if (creep.memory.away !== creep.room.name){
                        creep.say('🧭👣');
                        ai.goToRoom(creep, creep.memory.away);
                    } else {
                        creep.say('📡 look '+enemies.length);
                        var posInRoom = new RoomPosition(25, 25, creep.room.name);
                        creep.moveTo(posInRoom);
                        creep.memory.away = false;
    
                    }
                }
                if (aiBattle.checkForEnemies(enemies,enemy_base)){
                    if (creep.memory.away === creep.memory.home || enemies.length == 0){
                        aiBattle.target(creep,enemies,enemy_base,posInRoom);
                    } else {
                        creep.memory.action = "rally";
                        creep.say('⚔️~');
                        var posInRoom = new RoomPosition(25, 25, creep.room.name);
                        creep.moveTo(posInRoom);
                        creep.memory.away = false;

                    }
                }

        } 
        //if (creep.ticksToLive < 250) creep.memory.action = "rest";
        let targets, target;
        switch (creep.memory.action){
            case "rally":
                if (aiBattle.checkForEnemies(enemies,enemy_base)){
                    creep.memory.action = false;
                } else {
                    targets = creep.room.find(FIND_MY_CREEPS);
                    if(targets.length > 0) {
                        target = creep.pos.findClosestByPath(FIND_MY_CREEPS);
                        if (aiSource.getDistance(target.pos,creep.pos)<2 && targets.length >= 2){
                            aiBattle.target(creep,enemies,enemy_base,posInRoom);
                        } else {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    creep.say('🚧 rally');
                }
                break;
            case "fighting":
                if (!aiBattle.checkForEnemies(enemies,enemy_base)){
                    creep.memory.action = false;
                } else {
                    aiBattle.attack(creep,enemies,enemy_base);
                    aiBattle.callReinforcements(creep,population);
                    if (population[creep.memory.home].spawns[0].room.energyAvailable >= 300){
                        quotas.fighters += 1;
                        //console.log("reinforcements");
                    }
                }
                break;
            case "rest":
                if (ai.rest(creep,population)){
                    creep.memory.action = false;
                };
            break;
        }
	},
};

module.exports = roleFighter;