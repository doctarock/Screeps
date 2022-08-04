
var roleFighter = require('role.fighter');
var roleLeader = require('role.leader');
var roleScout = require('role.scout');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleSettler = require('role.coloniser');
var roleRefueler = require('role.refueler');
module.exports = {
    createSpawn: function(population,room,x,y){
        Game.rooms[room].createConstructionSite(x, y, STRUCTURE_SPAWN, 'Hippy'+population.spawns);
    },
    spawn: function(population,quotas,base,extCount){
        if(population[base.room.name].harvesters.length < quotas.harvesters) {
            console.log(base.room.name,"Harvester")
            roleHarvester.spawn(base,population,extCount);
        } else {
            if(population[base.room.name].refuelers.length < quotas.refuelers) {
                roleRefueler.spawn(base,population,extCount);
            } else {   
                if(population[base.room.name].upgraders.length < quotas.upgraders) {
                    roleUpgrader.spawn(base,population,extCount);
                } else {           
                    if(population[base.room.name].builders.length < quotas.builders) {
                        roleBuilder.spawn(base,population,extCount);
                    } else { 
                        
                        if(population.settlers.list.length < quotas.settlers) {
                            roleSettler.spawn(base,population,extCount);
                        } else {
                            if(population.fighters.list.length < quotas.fighters && extCount > 2) {
                                roleFighter.spawn(base,extCount);
                            } else {    
                                if(population.leaders.list.length < Object.entries(Game.spawns).length) {
                                    console.log('sp leader');
                                    roleLeader.spawn(base,extCount,false);
                                    console.log(population.leaders.list.length, Object.entries(Game.spawns).length);
                                } else {   
                                    console.log(population.leaders.list.length, Object.entries(Game.spawns).length);
                                    if(population.scouts.list.length < quotas.scouts) {
                                        roleScout.spawn(base,extCount);
                                    } 

                                }
                            }
                        }
                        
                    }
                }
            }
            
        }
        if(base.spawning) { 
            var spawningCreep = Game.creeps[base.spawning.name];
            base.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                base.pos.x + 1, 
                base.pos.y, 
                {align: 'left', opacity: 0.8});
        }
    },
    quota: function(base,extCnt,population){
        var quota;
        switch (Object.keys(Game.creeps).length){
            case 0: case 1:
                quota = {
                    scouts: 0,
                    harvesters: 1, 
                    upgraders: 0, 
                    builders: 0, 
                    fighters: 0, 
                    refuelers: 1, 
                    settlers: 0, 
                }
                break;
            case 2:
                quota = {
                    scouts: 0,
                    harvesters: 2, 
                    upgraders: 0, 
                    builders: 0, 
                    fighters: 0, 
                    refuelers: 1, 
                    settlers: 0, 
                }
                break;
            default:
                quota = {
                    scouts: 0,
                    harvesters: 2, 
                    upgraders: 2, 
                    builders: 2, 
                    fighters: 1, 
                    refuelers: 1, 
                    settlers: 0, 
                }
                var targets = population[base.room.name].sites;
                if(targets.length) {
                    quota.builders += 1;
                }
                if(extCnt >= 3){
                    quota.scouts += 2;
                }
                if (population.spawns < Game.gcl.level){
                    quota.settlers += 1;
                }
                if (Game.gcl.level > 1){
                    quota.scouts += Game.gcl.level*2;

                }
                if (base.room.controller.level >= 6){
                    quota.scouts += 2;
                    quota.fighters += 2;
                    quota.upgraders += 2;
                    quota.refuelers += 1;
                } else if (base.room.controller.level >= 4){
                    quota.fighters += 1;
                    quota.upgraders += 3;
                    quota.builders += 1;
                    quota.refuelers += 1;
                } else if (base.room.controller.level >= 3){
                    quota.fighters += 1;
                    quota.upgraders += 4;
                    quota.builders += 1;
                    quota.refuelers += 1;
                } else if (base.room.controller.level > 2){
                    quota.upgraders += 5;
                    quota.fighters += 1;
                } else {
                    quota.upgraders += 6;
                }
        }
        return quota;
    }
        
};