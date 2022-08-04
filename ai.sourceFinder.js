
module.exports = {
    getSource: function(creep,count,population){
        let sources =  population[creep.room.name].sources;
        return sources[count % sources.length].id;
    },
    getDistance: function(oa,ob){
        var a = Math.abs(oa.x - ob.x);
        var b = Math.abs(oa.y - ob.y);
        return Math.floor(Math.sqrt( a*a + b*b ));
    },
    roomDistance: function(roomName1, roomName2, diagonal){
        if( roomName1 == roomName2 ) return 0;
        let posA = roomName1.split(/([N,E,S,W])/);
        let posB = roomName2.split(/([N,E,S,W])/);
        let xDif = posA[1] == posB[1] ? Math.abs(posA[2]-posB[2]) : posA[2]+posB[2]+1;
        let yDif = posA[3] == posB[3] ? Math.abs(posA[4]-posB[4]) : posA[4]+posB[4]+1;
        if( diagonal ) return Math.max(xDif, yDif); // count diagonal as 1 
        return xDif + yDif; // count diagonal as 2 
    },
    harvestClosestSource: function(creep){
        var sources = creep.room.find(FIND_STRUCTURES, {filter: structure => structure.structureType == STRUCTURE_CONTAINER});
        let useCont = false;
        let closest = false;
        let selected = false;
        for (var k in sources){
            if (sources[k].store.getUsedCapacity() > 100) {
                dist = module.exports.getDistance(sources[k].pos,creep.pos);
                if (closest == false || dist < closest) {
                    selected = k;
                    closest = dist;
                }
                useCont = true;
            }
        }
        if (!useCont) {
            creep.say('⚡️');
            module.exports.harvestAnySource(creep,creep.memory.source);
        } else {
            creep.say('🚍');
            let result = creep.withdraw(sources[selected],RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[selected].pos.x, sources[selected].pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    },
    harvestAnySource: function(creep,source){
        let go = true;
        let dropSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount >= 50
        });
        if (dropSource != null){
            if(creep.pickup(dropSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            go = false;
        } else {
            var storePlaces = creep.room.find(FIND_STRUCTURES, { filter: (i) => {return (i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 100)}});
    
            storePlaces.sort((a,b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
            if (storePlaces.length > 0){
                let result = creep.withdraw(storePlaces[0],RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storePlaces[0].pos.x, storePlaces[0].pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                go = false;
            } else if (source != false) {
                // creep.say("?"+source)
                
                go = module.exports.harvestSource(creep,source);
            }
        }
        return go;
    },
    harvestSource: function(creep,source){
        source = Game.getObjectById(source);
        result = creep.harvest(source);
        if(result == ERR_NOT_IN_RANGE) {
            result = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            if (result == -2) {
                console.log("no path");
                return true;
            }
            return false;
        } else if (  result == 0 ){
            return false;

        }
        return true;
    },
    findSourceWithContainer: function(sources,storage,list){
        let bestSource = false,bestStore = false;
        let backupSource = false,backupStore = false;
        for (let source of sources) {
            let used = false;
            for (const harvester of list) {
                if (harvester.memory.source == source.id && harvester.memory.type > 1) {
                    used = true;
                }
            }
            if (!used){
                bestSource = source.id;
                for (let store of storage) {
                    if (module.exports.getDistance(source.pos,store.pos) < 2){
                        bestStore = store.id;
                    }
                }
            } else {
                //source is used, is there a free container?
                for (store of storage) {
                    if (module.exports.getDistance(source.pos,store.pos) < 2){
                        let used2 = false;
                        for (const harvester2 of list) {
                            if (harvester2.memory.type == 2 && harvester2.memory.storage == store.id) {
                                used2 = true;
                            }
                        }
                        if (!used2){
                            backupSource = source.id;
                            backupStore = store.id;
                        }
                    }
                }

            }
        }
        if (bestStore == false && backupStore !== false)  return [backupSource,backupStore];
        return [bestSource,bestStore];
    },
    sortContainers: function(creep){
        let doContinue = true;
        var storePlaces = creep.room.find(FIND_STRUCTURES, { filter: (i) => {return (i.structureType == STRUCTURE_CONTAINER && i.store.getUsedCapacity() < i.store.getFreeCapacity(RESOURCE_ENERGY))}});
        if (storePlaces.length > 0){
            var storage = creep.pos.findClosestByPath(storePlaces);
            let success = creep.transfer(storage, RESOURCE_ENERGY);
            if(success == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
                doContinue = false;
            } else if (success < 0){
                creep.memory.target = false;
                creep.memory.action = false;
                doContinue = true;
            }
        }
        return doContinue;
    },
    repairAnything: function(creep){
        if (creep.memory.target == false){
            var targets = creep.room.find(FIND_STRUCTURES, {filter: object => object.hits < (object.hitsMax/2)});
            targets.sort((a,b) => a.hits - b.hits);
            if(targets.length) {
                target = targets[0];
                creep.memory.target = target.id;
            }  else {
                creep.memory.action = "recharge";
                return module.exports.rechargeAnything(creep);
            }

        } else {
            target = Game.getObjectById(creep.memory.target);
        }
        let success = creep.repair(target);    
        if(success == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            return false;
        } else if(success < 0 || target.hits == target.hitsMax) {
            creep.memory.target = false;
            creep.memory.action = false;
            return true;
        } else if (success == 0){
            return false;
        }
        return true;
    },
    refuelAnything: function(creep){
        let hasTarget = false;
        let doContinue = true;
        if (creep.memory.target == false || typeof creep.memory.target == 'undefined' ){
            
            //find anything that can take fuel
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                targets.sort((a,b) => a.store.getUsedCapacity() - b.store.getUsedCapacity() );

                target = targets[0];
                creep.memory.target = target.id;
                hasTarget = true;
            } else {
                 //find anything that can take fuel
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    targets.sort((a,b) => a.store.getUsedCapacity() - b.store.getUsedCapacity() );

                    target = targets[0];
                    creep.memory.target = target.id;
                    hasTarget = true;
                } else {
                     //find anything that can take fuel
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER) && 
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                    if(targets.length > 0) {
                        targets.sort((a,b) => a.store.getUsedCapacity() - b.store.getUsedCapacity() );
    
                        target = targets[0];
                        creep.memory.target = target.id;
                        hasTarget = true;
                    }
                }
            }
        } else {
            //get our target destination
            target = Game.getObjectById(creep.memory.target);
            if (target !== null)  hasTarget = true;
        }
        if (hasTarget){
            let success = creep.transfer(target, RESOURCE_ENERGY);     
            if(success == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                doContinue =  false;
            } else if(success < 0) {
                creep.memory.target = false;
                creep.memory.action = false;
                doContinue =  true;
                creep.say('🥵');
            } else {
                creep.memory.target = false;
                creep.say('👌🏽');
                doContinue =  false;
            }
        }
        
        return doContinue;
    },
    rechargeAnything: function(creep){
        if (module.exports.refuelAnything(creep)) {
            return module.exports.upgradeController(creep);
        } else {
            return false;
        }
    },
    upgradeController: function(creep){
        let result = creep.upgradeController(creep.room.controller);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            return false;
        } else if (result == 0){
            return false;
        }
        return true;

    }
};