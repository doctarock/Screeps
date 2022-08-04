var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBulder = require('role.builder');
var roleFighter = require('role.fighter');
var roleLeader = require('role.leader');
var roleScout = require('role.scout');
var roleSettler = require('role.coloniser');
var roleRefueler = require('role.refueler');
var roleRepairer = require('role.repairer');
var bldTowers = require('building.tower');
var functions = require('functions');
var spawn = require('spawner');

module.exports.loop = function () {
    let population
    functions.clearRam();
    //collect objects across all rooms
    if (Game.time % 10 == 0){

    } else {

    }
    population = {
        scouts: {
            list: _.filter(Game.creeps, (creep) => creep.memory.role == 'scout'),
        },
        fighters: {
            list: _.filter(Game.creeps, (creep) => creep.memory.role == 'fighter'),
        },
        settlers: {
            list: _.filter(Game.creeps, (creep) => creep.memory.role == 'settler'),
        },
        harvesters: {
            list: _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.type == 3),
        },
        leaders: {
            list: _.filter(Game.creeps, (creep) => creep.memory.role == 'leader'),
        },
        spawns:Object.entries(Game.spawns).length,
        spawnList:[]
    }
    let count = 0;
    for (var [roomName, roomObject] of Object.entries(Game.rooms)){
       // console.log(`${roomName}: ${roomObject}`);
       count += 1;
        var struct = roomObject.find(FIND_STRUCTURES);
        population[roomName] = {
            roads: _.filter(struct, (structure) => structure.structureType == STRUCTURE_ROAD),
            spawns: _.filter(struct, (structure) => structure.structureType == STRUCTURE_SPAWN),
            extensions: _.filter(struct, (structure) => structure.structureType == STRUCTURE_EXTENSION),
            containers: _.filter(struct, (structure) => structure.structureType == STRUCTURE_CONTAINER),
            sources:roomObject.find(FIND_SOURCES),
            sites:roomObject.find(FIND_CONSTRUCTION_SITES),
            minerals: roomObject.find(FIND_MINERALS),
            harvesters:_.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.type !== 3 && creep.room.name == roomName),
            builders:_.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == roomName),
            upgraders:_.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == roomName),
            leaders:_.filter(Game.creeps, (creep) => creep.memory.role == 'leader' && creep.room.name == roomName),
            refuelers:_.filter(Game.creeps, (creep) => creep.memory.role == 'refueler' && creep.room.name == roomName),
            repairers:_.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == roomName),
            enemies: {
                list: roomObject.find(FIND_HOSTILE_CREEPS),
                buildings:roomObject.find(FIND_HOSTILE_STRUCTURES),
            }
        }
        if (Object.entries(population[roomName].sites).length > 0) console.log("sites",roomName,population[roomName].sites.length);
        population.spawnList.concat(population[roomName].spawns);
    }
    //console.log(count+" rooms scanned");
    for (var [key, value] of Object.entries(Game.spawns)){
         //console.log(`${key}: ${value}`);
         let spawnHome = value;

         bldTowers.run(spawnHome);
     
         var extensions = population[spawnHome.room.name].extensions;
         let quotas = spawn.quota(spawnHome,extensions.length,population);
         var iteration = 0;
         for(var name in population[spawnHome.room.name].harvesters) {
             iteration++;
             var creep = population[spawnHome.room.name].harvesters[name];
             if (functions.fixWallBug(creep)) roleHarvester.run(creep,quotas,population);
         }
         for(var name in population[spawnHome.room.name].upgraders) {
             iteration++;
             var creep = population[spawnHome.room.name].upgraders[name];
             if (functions.fixWallBug(creep)) roleUpgrader.run(creep,iteration);
         }
         for(var name in population[spawnHome.room.name].refuelers) {
             iteration++;
             var creep = population[spawnHome.room.name].refuelers[name];
             if (functions.fixWallBug(creep)) roleRefueler.run(creep,population);
         }
         for(var name in population[spawnHome.room.name].builders) {
             iteration++;
             var creep = population[spawnHome.room.name].builders[name];
             if (functions.fixWallBug(creep)) roleBulder.run(creep,population,iteration);
         }
         for(var name in population[spawnHome.room.name].repairers) {
             iteration++;
             var creep = population[spawnHome.room.name].repairers[name];
             if (functions.fixWallBug(creep)) roleRepairer.run(creep,population,iteration);
         }

         spawn.spawn(population,quotas,spawnHome,extensions.length);
    }

    for(var name in population.leaders.list) {
        iteration++;
        var creep = population.leaders.list[name];
        spawnHome = population[creep.memory.home].spawns[0];
        if (functions.fixWallBug(creep)) roleLeader.run(creep,spawnHome,population);
    }
    for(var name in population.scouts.list) {
        iteration++;
        var creep = population.scouts.list[name];
        spawnHome = population[creep.memory.home].spawns[0];
        var extensions = population[spawnHome.room.name].extensions;
        
        let quotas = spawn.quota(spawnHome,extensions.length,population);
        if (functions.fixWallBug(creep)) roleScout.run(creep,spawnHome,population,quotas);
    }
    for(var name in population.fighters.list) {
        iteration++;
        var creep = population.fighters.list[name];
        spawnHome = population[creep.memory.home].spawns[0];
        var extensions = population[spawnHome.room.name].extensions;
        let quotas = spawn.quota(spawnHome,extensions.length,population);
        if (functions.fixWallBug(creep)) roleFighter.run(creep,population,quotas);
    }
    for(var name in population.settlers.list) {
        iteration++;
        var creep = population.settlers.list[name];
        if (functions.fixWallBug(creep)) roleSettler.run(creep,population);
    }
    for(var name in population.harvesters.list) {
        iteration++;
        var creep = population.harvesters.list[name];
        var extensions = population[spawnHome.room.name].extensions;
        let quotas = spawn.quota(spawnHome,extensions.length,population);
        if (functions.fixWallBug(creep)) {
            roleHarvester.run(creep,quotas,population);
        }
    }
}