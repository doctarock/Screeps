var aiSource = require('ai.sourceFinder');
var aiBattle = require('ai.battle');
var ai = require('ai.general');
var roleHarvester = require('role.harvester');
var roleScout = {
    spawn: function(spawnHome){
        var newName = 'scout' + Game.time;
        if(spawnHome.spawnCreep([RANGED_ATTACK,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'scout',home: spawnHome.room.name, away: false, action: false, current: spawnHome.room.name, target: false, type: 0}}) == 0){
                console.log('Spawning new scout: ' + newName);
            };
    },
    run: function(creep,spawnHome,population,quotas) {
        var enemies = population[creep.room.name].enemies.list;
        var enemy_base = population[creep.room.name].enemies.buildings;
        var posInRoom = new RoomPosition(25, 25, creep.room.name);
        
        if (creep.ticksToLive < 500 && population[spawnHome.room.name].harvesters.length > 1) creep.memory.action = "rest";
	    if(creep.memory.action == "fighting") {
            if (creep.memory.target == false) aiBattle.target(creep,enemies,enemy_base,posInRoom);
            aiBattle.rangedAttack(creep,enemies,enemy_base);
            aiBattle.callReinforcements(creep,population);
            if (spawnHome.room.energyAvailable >= 300){
                quotas.scouts += 1;
            }
            creep.say('🏹');
        }else if (creep.memory.action == "rest"){
            creep.moveTo(spawnHome);
            spawnHome.renewCreep(creep);
            creep.say('🚧'+creep.ticksToLive);
            if (creep.ticksToLive > 1400) {
                creep.say('done');
                creep.memory.action =false;
            }
	    } else {
            if (creep.memory.target == false) aiBattle.target(creep,enemies,enemy_base,posInRoom);
            if (creep.memory.away === false && creep.memory.target == false){
                creep.say('🚧 leave ');
                creep.memory.away = ai.findExit(creep.room.name,false);
                if (aiSource.roomDistance(creep.room.name,creep.memory.away,false) < 2 && spawnHome.room.energyAvailable >= 550 && population[spawnHome.room.name].harvesters.length > 1){
                    var friends = creep.room.find(FIND_MY_CREEPS,{
                        filter:(creep) => creep.memory.role == 'harvester'
                    });
                    if (friends.length < 2) {
                        roleHarvester.spawnType(creep,3,population);
                    }

                }
            } else {

                if (creep.room.name !== creep.memory.current){
                    creep.moveTo(posInRoom);
                    creep.memory.current = creep.room.name;
                    creep.memory.away = false;
                } else {
                    if (creep.memory.away !== false && creep.memory.away !== creep.room.name && typeof creep.memory.away != 'undefined'){
                        creep.say('🧭'+creep.memory.away);
                        ai.goToRoom(creep, creep.memory.away);
                    } else {
                        creep.say('📡 '+creep.memory.away);
                        creep.memory.away = false;
                        creep.memory.target = false;

                    }

                }
            }
        }
	},
	flee: function(creep){
        var enemies= creep.room.find(FIND_HOSTILE_CREEPS);
	    let path = PathFinder.search(creep.pos, enemies.map(c=>{return{pos:c.pos,range:3}},{flee:true}).path);
        creep.moveByPath(path);
	}
};

module.exports = roleScout;