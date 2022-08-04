var planner = {

    /** @param {Creep} creep **/
    run: function(creep,population) {
        planner.buildCity(creep,population);
        console.log("end of ai");
	},
    roads: function(creep,population){
        var mainSpawn = population[creep.memory.home].spawns[0];
          
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x-1, mainSpawn.pos.y-1, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x-1, mainSpawn.pos.y, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x-1, mainSpawn.pos.y+1, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x+1, mainSpawn.pos.y-1, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x+1, mainSpawn.pos.y, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x+1, mainSpawn.pos.y+1, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x, mainSpawn.pos.y+1, STRUCTURE_ROAD  ); 
        mainSpawn.room.createConstructionSite( mainSpawn.pos.x, mainSpawn.pos.y-1, STRUCTURE_ROAD  ); 

    },
    buildContainers:function(creep,population){
        var sources = population[creep.room.name].sources;
        for (x=0;x<sources.length;x++){
            let result = creep.room.createConstructionSite( sources[x].pos.x-1, sources[x].pos.y-1, STRUCTURE_CONTAINER  );
            if (result < 0){
                result = creep.room.createConstructionSite( sources[x].pos.x+1, sources[x].pos.y-1, STRUCTURE_CONTAINER  );  
                if (result < 0){
                    result = creep.room.createConstructionSite( sources[x].pos.x+1, sources[x].pos.y+1, STRUCTURE_CONTAINER  );
                    if (result < 0){
                        result = creep.room.createConstructionSite( sources[x].pos.x-1, sources[x].pos.y+1, STRUCTURE_CONTAINER  );
                        if (result < 0){
                            result = creep.room.createConstructionSite( sources[x].pos.x, sources[x].pos.y+1, STRUCTURE_CONTAINER  );
                            return true;
                        }
                    }
                }
            }
        } 
        
        let result = creep.room.createConstructionSite(creep.room.controller.pos.x-2, creep.room.controller.pos.y-2, STRUCTURE_CONTAINER  );
        if (result < 0){
            result = creep.room.createConstructionSite( creep.room.controller.pos.x+2, creep.room.controller.pos.y-2, STRUCTURE_CONTAINER  );  
            if (result < 0){
                result = creep.room.createConstructionSite( creep.room.controller.pos.x+2, creep.room.controller.pos.y+2, STRUCTURE_CONTAINER  );
                if (result < 0){
                    result = creep.room.createConstructionSite( creep.room.controller.pos.x-2, creep.room.controller.pos.y+2, STRUCTURE_CONTAINER  );
                    return true;
                }
            }
        } 
        return false; 
    },
    buildControllerContainers:function(creep){
        let result = creep.room.createConstructionSite(creep.room.controller.pos.x-2, creep.room.controller.pos.y-2, STRUCTURE_CONTAINER  );
        if (result < 0){
            result = creep.room.createConstructionSite( creep.room.controller.pos.x+2, creep.room.controller.pos.y-2, STRUCTURE_CONTAINER  );  
            if (result < 0){
                result = creep.room.createConstructionSite( creep.room.controller.pos.x+2, creep.room.controller.pos.y+2, STRUCTURE_CONTAINER  );
                if (result < 0){
                    result = creep.room.createConstructionSite( creep.room.controller.pos.x-2, creep.room.controller.pos.y+2, STRUCTURE_CONTAINER  );
                    return true;
                }
            }
        } 
        return false; 
    },
    extraContainers:function(creep,population){
        let spawn = population[creep.room.name].spawns[0];
        if (creep.room.controller.pos.x < spawn.pos.x){
            if (creep.room.controller.pos.y < spawn.pos.y){
                creep.room.createConstructionSite( spawn.pos.x, spawn.pos.y-2, STRUCTURE_CONTAINER  );
                creep.room.createConstructionSite( spawn.pos.x-1, spawn.pos.y-2, STRUCTURE_CONTAINER  );
                creep.room.createConstructionSite( spawn.pos.x+1, spawn.pos.y-2, STRUCTURE_CONTAINER  );

            } else {
                creep.room.createConstructionSite( spawn.pos.x-7, spawn.pos.y+7, STRUCTURE_CONTAINER  );
                creep.room.createConstructionSite( spawn.pos.x-8, spawn.pos.y+8, STRUCTURE_CONTAINER  );

            }

        } else {
            if (creep.room.controller.pos.y < spawn.pos.y){
                creep.room.createConstructionSite( spawn.pos.x+7, spawn.pos.y-7, STRUCTURE_CONTAINER  );
                creep.room.createConstructionSite( spawn.pos.x+8, spawn.pos.y-8, STRUCTURE_CONTAINER  );
            } else {
                creep.room.createConstructionSite( spawn.pos.x+7, spawn.pos.y+7, STRUCTURE_CONTAINER  );
                creep.room.createConstructionSite( spawn.pos.x+8, spawn.pos.y+8, STRUCTURE_CONTAINER  );
                
            }

        }
        return true; 
    },
    buildWalls:function(creep,population){
        if (population[creep.room.name].roads.length >= 150){
            
            var mainSpawn = population[creep.room.name].spawns[0];
            
            if(mainSpawn.length === 0) {
                //empty room
                creep.say('🚧 lost');
                
            } else {
                var y = 7;
                for (let x=-7;x<=7;x++){
                    let constructs = creep.room.lookForAt(LOOK_STRUCTURES, mainSpawn.pos.x-x, mainSpawn.pos.y-y);
                    let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, mainSpawn.pos.x-x, mainSpawn.pos.y-y);
                    if (sites.length == 0 && constructs.length == 0){
                        mainSpawn.room.createConstructionSite( mainSpawn.pos.x-x, mainSpawn.pos.y-y, STRUCTURE_WALL  );
                    } else if (sites.length == 0 ) {
                        for (var struct in constructs){
                            if(constructs[struct] instanceof StructureRoad){
                                if (population[creep.room.name].enemies.list.length > 0) mainSpawn.room.createConstructionSite( mainSpawn.pos.x-x, mainSpawn.pos.y-y, STRUCTURE_RAMPART  );
                            }
                        }
                    }
                } 
                for (let x=-7;x<=7;x++){
                    let constructs = creep.room.lookForAt(LOOK_STRUCTURES, mainSpawn.pos.x-x, mainSpawn.pos.y+y);
                    let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, mainSpawn.pos.x-x, mainSpawn.pos.y+y);
                    if (sites.length == 0 && constructs.length == 0){
                        mainSpawn.room.createConstructionSite( mainSpawn.pos.x-x, mainSpawn.pos.y+y, STRUCTURE_WALL  );
                    } else if (sites.length == 0 ) {
                        for (var struct in constructs){
                            if(constructs[struct] instanceof StructureRoad){
                                if (population[creep.room.name].enemies.list.length > 0) mainSpawn.room.createConstructionSite( mainSpawn.pos.x-x, mainSpawn.pos.y+y, STRUCTURE_RAMPART  );
                            }
                        }

                    }
                } 
                for (let x=-7;x<7;x++){
                    let constructs = creep.room.lookForAt(LOOK_STRUCTURES, mainSpawn.pos.x-y, mainSpawn.pos.y-x);
                    let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, mainSpawn.pos.x-y, mainSpawn.pos.y-x);
                    if (sites.length == 0 && constructs.length == 0){
                        mainSpawn.room.createConstructionSite( mainSpawn.pos.x-y, mainSpawn.pos.y-x, STRUCTURE_WALL  );
                    } else if (sites.length == 0 ) {
                        for (var struct in constructs){
                            if(constructs[struct] instanceof StructureRoad){
                                if (population[creep.room.name].enemies.list.length > 0) mainSpawn.room.createConstructionSite( mainSpawn.pos.x-y, mainSpawn.pos.y-x, STRUCTURE_RAMPART  );
                            }
                        }

                    }
                } 
                for (let x=-7;x<7;x++){
                    let constructs = creep.room.lookForAt(LOOK_STRUCTURES, mainSpawn.pos.x+y, mainSpawn.pos.y-x);
                    let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, mainSpawn.pos.x+y, mainSpawn.pos.y-x);
                    if (sites.length == 0 && constructs.length == 0){
                        mainSpawn.room.createConstructionSite( mainSpawn.pos.x+y, mainSpawn.pos.y-x, STRUCTURE_WALL  );
                    } else if (sites.length == 0 ) {
                        for (var struct in constructs){
                            if(constructs[struct] instanceof StructureRoad){
                                if (population[creep.room.name].enemies.list.length > 0) mainSpawn.room.createConstructionSite( mainSpawn.pos.x+y, mainSpawn.pos.y-x, STRUCTURE_RAMPART  );
                            }
                        }

                    }
                } 
            }
        }
        return true;
    },
    buildTowers: function(creep,population){
        var mainSpawn = population[creep.room.name].spawns[0];
        creep.say(creep.room.controller.level);
        creep.room.createConstructionSite( mainSpawn.pos.x-6, mainSpawn.pos.y-6, STRUCTURE_TOWER  ); 
        creep.room.createConstructionSite( mainSpawn.pos.x-6, mainSpawn.pos.y+6, STRUCTURE_TOWER  );
        creep.room.createConstructionSite( mainSpawn.pos.x+6, mainSpawn.pos.y-6, STRUCTURE_TOWER  );
        creep.room.createConstructionSite( mainSpawn.pos.x+6, mainSpawn.pos.y+6, STRUCTURE_TOWER  );
        return true;  
    },
    buildExtensions: function(creep,population){
        if (typeof population[creep.room.name] != 'undefined'){
                
            var mainSpawn = population[creep.room.name].spawns[0];
            
            if(typeof mainSpawn === 'undefined') {
                //empty room
                creep.say('🚧 lost');
            } else {
                
                var extensions = population[creep.room.name].extensions;
                switch(extensions.length) {
                    case 0 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-1, mainSpawn.pos.y-2, STRUCTURE_EXTENSION ) == 0) return false;  
                        break;
                    case 1 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-3, mainSpawn.pos.y-1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 2 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-3, mainSpawn.pos.y-2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 3 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-3, mainSpawn.pos.y+1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 4 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-3, mainSpawn.pos.y+2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 5 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-1, mainSpawn.pos.y+2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 6 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+3, mainSpawn.pos.y+1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 7 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+3, mainSpawn.pos.y+2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 8 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+3, mainSpawn.pos.y-1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 9 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+3, mainSpawn.pos.y-2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 10 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+1, mainSpawn.pos.y-2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 11 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+4, mainSpawn.pos.y-1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 12 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+4, mainSpawn.pos.y+1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 13 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+4, mainSpawn.pos.y+2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 14 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+4, mainSpawn.pos.y-2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 15 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x+1, mainSpawn.pos.y+2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 16 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-4, mainSpawn.pos.y-1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 17 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-4, mainSpawn.pos.y+1, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 18 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-4, mainSpawn.pos.y+2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    case 19 :
                        if(mainSpawn.room.createConstructionSite( mainSpawn.pos.x-4, mainSpawn.pos.y-2, STRUCTURE_EXTENSION ) == 0) return false;
                        break;
                    default:
                        return true;  
                }
                return true;  
            }
        }
    },
	buildCity: function(creep,population){
        if (creep.memory.phase == 0){
            nextBuild = planner.buildContainers(creep,population);
            creep.memory.phase = 1;
        } else {
            nextBuild = true;
        }
        if (nextBuild){
            nextBuild = planner.buildExtensions(creep,population);
        }
        if (nextBuild){
            nextBuild = planner.buildTowers(creep,population); 
        }
        if (nextBuild){
            nextBuild = planner.buildWalls(creep,population);
        }
        if (nextBuild && creep.room.controller.level > 4){
            nextBuild = planner.extraContainers(creep,population);
        }
        if (nextBuild && creep.room.controller.level > 4){
            nextBuild = planner.buildControllerContainers(creep,population);
        }
        
        if (nextBuild){
            nextBuild = false;
            var posInRoom = new RoomPosition(20, 25, creep.room.name);
            creep.moveTo(posInRoom);
        }
	    
	}
};

module.exports = planner;