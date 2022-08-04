var aiSource = require('ai.sourceFinder');
var roleRefueler = require('role.refueler');
var planner = require('ai.planner');
var ai = require('ai.general');
var roleHarvester = {
    spawn: function(base,population,extCount){
        var newName = 'Harvester' + Game.time;
        var storage = population[base.room.name].containers;
        var sources = population[base.room.name].sources;
        var bestSource = aiSource.findSourceWithContainer(sources,storage,population[base.room.name].harvesters);
        if (bestSource[0] && bestSource[1]){
            if (population[base.room.name].refuelers.length == 0){
                roleRefueler.spawn(base,population,extCount);
            } else {
                if (storage.length > 4 && population[base.room.name].harvesters.length > 1){
                    roleHarvester.spawnDedicated(base,bestSource,true, newName, population);
                } else {
                    roleHarvester.spawnDedicated(base,bestSource,false, newName, population);
                }
            } 
        } else {
            roleHarvester.spawnTransport(base, bestSource, newName, population);
            planner.buildContainers(base, population);
        }
    },
    spawnTransport: function(base, bestSource, newName, population){
        if (population[base.room.name].refuelers.length == 0){
            if(base.spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, {memory: {role: 'harvester',source: aiSource.getSource(base,population[base.room.name].harvesters.length,population),type:1}}) < 0){
                if (population[base.room.name].harvesters.length == 0) base.spawnCreep([WORK,WORK,CARRY,MOVE], newName, {memory: {role: 'harvester',source: aiSource.getSource(base,population[base.room.name].harvesters.length,population),type:0}});
            };
        } else {
            base.spawnCreep([WORK,WORK,MOVE], newName, {memory: {role: 'harvester',source: aiSource.getSource(base,population[base.room.name].harvesters.length,population),type:5}});              
        }
    },
    spawnDedicated: function(base,bestSource,wait,newName, population){
        if (wait && population[base.room.name].harvesters.length > 0){
            base.spawnCreep([WORK,WORK,WORK,WORK,WORK,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:4}});
        } else {
            if(base.spawnCreep([WORK,WORK,WORK,WORK,WORK,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:4}}) < 0){
                if(base.spawnCreep([WORK,WORK,MOVE,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:2}})<0){
                    if(base.spawnCreep([WORK,WORK,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:5}})<0){
                        if (population[base.room.name].harvesters.length == 0) base.spawnCreep([WORK,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:5}})
                    };
                };
            };
        }
    },
    spawnType: function(creep,type,population){
        
        var newName = 'Harvester' + Game.time;
        let home = Game.rooms[creep.memory.home];
        let targetSpawn = population[home.name].spawns[0];
        var sources = population[creep.room.name].sources;
        if (sources.length)
            switch (type){
                case 3:
                    newName = 'RHarvester' + Game.time;
                    let type3 = targetSpawn.spawnCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: 'harvester', home: home.name, away:creep.room.name, source: sources[0].id,type:3,trips:0, upgrading: false}});
                    if(type3 < 0){
                        type3 = targetSpawn.spawnCreep([WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], newName, {memory: {role: 'harvester', home: home.name, away:creep.room.name, source: sources[0].id,type:3,trips:0,  upgrading: false}});
                        if(type3 < 0){
                            type3 = targetSpawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: 'harvester', home: home.name, away:creep.room.name, source: sources[0].id,type:3,trips:0,  upgrading: false}});
                        };  
                    };
                    return type3;
                case 1:
                    newName = 'THarvester' + Game.time;
                    let type1 = targetSpawn.spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, {memory: {role: 'harvester',source: sources[0],type:1}});
                    if(type1 < 0){
                        type1 = targetSpawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: 'harvester',source: sources[0].id,type:0}});
                    };
                    return type1;
                case 2:
                    newName = 'DHarvester' + Game.time;
                    var storage = population[creep.room.name].containers;
                    var bestSource = aiSource.findSourceWithContainer(sources,storage,1);
                    if (bestSource[0] && bestSource[1]){
                        let type2 = targetSpawn.spawnCreep([WORK,WORK,WORK,WORK,WORK,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:4,action:false}});
                        if(type2 < 0){
                            type2 = targetSpawn.spawnCreep([WORK,WORK,MOVE], newName, {memory: {role: 'harvester',source: bestSource[0],storage: bestSource[1],type:2,action:false}});
                        };
                        return type2;
                    }
                    return -69;
                case 0:
                default:
                    return targetSpawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: 'harvester',source: aiSource.getSource(base,population[base.room.name].harvesters.length,population),type:0}});
            }
    },
    run: function(creep,quotas,population) {
        switch (creep.memory.type){
            case 5:
                roleHarvester.dropHarvester(creep);
                break;
            case 3:
                quotas.harvesters +=1;
                roleHarvester.remoteHarvester(creep,population);
                break;
            case 4:
            case 2:
                roleHarvester.dedicatedHarvester(creep,population);
                break;
            case 1:
            case 0:
            default:
                roleHarvester.transportHarvester(creep);
        }
	},
    makeRemote: function(creep, roomId, type){
        creep.memory.away = roomId;
        creep.memory.type = type;
        creep.memory.home = creep.room.id;
    },
    dropHarvester: function(creep){
        let src = Game.getObjectById(creep.memory.source);
        if (creep.harvest(src)){
            creep.moveTo(src, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 50});
        }
    },
    remoteHarvester: function(creep,population){
        switch (creep.memory.action){
            case "upgrading":
                if (creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.action = false;
                    creep.say('🔄 harvest');
                } else {
                    if (population[creep.room.name].spawns.length > 0){
                        creep.say('✨');
                        if(aiSource.rechargeAnything(creep) ) creep.memory.action = "home";
                    } else {
                        creep.memory.action = "home";
                    }
                }
                break;
            case "building":
                if (creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.action = false;
                    creep.say('🔄');
                } else {
                    var targets = population[creep.room.name].sites;
                    if(targets.length) {
                        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 50});
                        }
                        creep.say('🚧');
                    } else {
                        creep.memory.action = "upgrading";
                        creep.say('🤑');
                    }
                }
                break;
            case "home":
                if(creep.memory.home !== creep.room.name){
                    creep.say('🚜');
                    ai.goToRoom(creep, creep.memory.home);
                } else {
                    creep.memory.action = false;
                    creep.say('💫');
                }
                break;
            case "rest":
                if (ai.rest(creep,population)) creep.memory.action = false;
                break;
            default:
                if(creep.store.getFreeCapacity() == 0) {
                    creep.memory.trips +=1;
                    creep.memory.action = "building";
                    creep.say('⚡ power');
                } else {
                    if (creep.memory.away !== creep.room.name){
                        if (creep.room.name !== creep.memory.home){
                            var sources = population[creep.room.name].sources;
                            if (sources.length){
                                creep.memory.away = creep.room.name;
                                creep.memory.source = sources[Math.floor(Math.random()*sources.length)].id;
                            }
                        } else {
                            creep.say(creep.memory.home+'--'+creep.memory.away);
                            ai.layRoads(creep,population,150,15);
                            ai.goToRoom(creep, creep.memory.away);
                            creep.memory.source = false;
                        }
                    } else {
                        if (population[creep.room.name].spawns.length > 0){
                            creep.memory.home = creep.room.name;
                            creep.memory.source = false;
                            creep.memory.away = ai.findExit(creep.room.name, false);
                        } else {
                            if (creep.memory.source == false){
                                var sources = population[creep.room.name].sources;
                                if (sources.length){
                                    creep.memory.away = creep.room.name;
                                    creep.memory.source = sources[Math.floor(Math.random()*sources.length)].id;
                                }
                            }
                            result=aiSource.harvestSource(creep,creep.memory.source);
                            if(result){
                                console.log("exit1",ai.findExit(creep.room.name,false));
                                creep.memory.away = ai.findExit(creep.room.name,false);
                                creep.memory.action = false;
                                creep.memory.home = creep.room.name;
                                creep.say(creep.memory.away);
                                creep.say('!')
                            } else {
                                creep.say('⛏');
                            };  
                        }
                    }
                }
        }
    },
    dedicatedHarvester: function(creep,population){
        switch (creep.memory.action){
            case "rest":
                if (ai.rest(creep,population)) creep.memory.action = false;
                break;
            default:
                let cnt = Game.getObjectById(creep.memory.storage);
                if (cnt != null && aiSource.getDistance(creep.pos,cnt.pos) > 0){
                    let res = creep.moveTo(cnt.pos, {visualizePathStyle: {stroke: '#ffaa00'}, reusePath: 50});
                    if (res == -2){
                        console.log('stuck');
                        var storage = population[creep.room.name].containers;
                        var sources = population[creep.room.name].sources;
                        var bestSource = aiSource.findSourceWithContainer(sources,storage,population[creep.room.name].harvesters);
                        creep.memory.source = bestSource[0];
                        creep.memory.storage = bestSource[1];
                    }else{
                        console.log('?'+res);
                        let src = Game.getObjectById(creep.memory.source);
                        if(creep.harvest(src) == ERR_NOT_ENOUGH_RESOURCES){
                            var storage = population[creep.room.name].containers;
                            var sources = population[creep.room.name].sources;
                            var bestSource = aiSource.findSourceWithContainer(sources,storage,population[creep.room.name].harvesters);
                            creep.memory.source = bestSource[0];
                            creep.memory.storage = bestSource[1];
                            
                        };  

                    }
                } else {
                    let src = Game.getObjectById(creep.memory.source);
                    creep.harvest(src);  
                } 

        }  
        if (creep.memory.type == 4 && creep.ticksToLive < 250) {
            creep.memory.action = "rest";
        }
    },
    transportHarvester: function(creep){
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ power');
	    }
	    if(creep.memory.upgrading) {
            creep.say('🚐');
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 50});
                }
            } else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 50});
                }
            }
        }  else {
            creep.say('⛏');
            aiSource.harvestSource(creep,creep.memory.source);      
        }
    }
};

module.exports = roleHarvester;