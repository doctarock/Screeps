var planner = require('ai.planner');
var ai = require('ai.general');
var roleSettler = require('role.coloniser');
var roleBuilder = require('role.builder');
var roleLeader = {
    spawn: function(spawnHome,away){
        var newName = 'leader' + Game.time;
        console.log('Spawning new leader: ' + newName);
        if (away != false){
            spawnHome.spawnCreep([MOVE,MOVE], newName, 
                {memory: {role: 'leader',home: spawnHome.room.name, away: away, policy: false, action: false, target: false, phase: 0}});

        } else {
            spawnHome.spawnCreep([MOVE,MOVE], newName, 
                {memory: {role: 'leader',home: spawnHome.room.name, away: false, policy: false, action: false, target: false, phase: 0}});

        }
    },
    reset: function(creep){
        console.log("reset");
        creep.memory.action = false;
        creep.memory.target = false;
        creep.memory.policy = false;
    },
    run: function(creep,spawnHome,population) {
        let workLoc = creep.memory.away;
        if (workLoc == false || typeof workLoc == "undefined"){
            workLoc = creep.memory.home;
        }
        switch (creep.memory.action){
            case "startRoad":
                if (typeof creep.memory.target == 'undefined'){
                    roleLeader.reset(creep);
                } else {
                    if (creep.memory.target[1] == null){
                        roleLeader.reset(creep);
                    }else{
                        creep.moveTo(new RoomPosition(creep.memory.target[0].x, creep.memory.target[0].y, creep.memory.home));
                        var a = Math.abs(creep.pos.x - creep.memory.target[0].x);
                        var b = Math.abs(creep.pos.y - creep.memory.target[0].y);
                        var distance = Math.floor(Math.sqrt( a*a + b*b ));
                        creep.say('🦁'+distance);
                        if (distance < 2){
                            creep.memory.action = "endRoad";
                        }
                    }
                }
                break;
            case "endRoad":
                creep.room.createConstructionSite( creep.pos.x, creep.pos.y, STRUCTURE_ROAD  ); 
                if (Object.entries(population[creep.room.name].sites).length > 1 || creep.memory.target[1] == null || typeof creep.memory.target[1].x == "undefined"){
                    roleLeader.reset(creep);
                }else{
                    creep.moveTo(new RoomPosition(creep.memory.target[1].x, creep.memory.target[1].y, workLoc));
                    var a = Math.abs(creep.pos.x - creep.memory.target[1].x);
                    var b = Math.abs(creep.pos.y - creep.memory.target[1].y);
                    var distance = Math.floor(Math.sqrt( a*a + b*b ));
                    creep.say('🦁⚒️'+distance);
                    if (distance < 4 || isNaN(distance)){
                        creep.memory.action = "nextRoad";
                    }
                }
                break;
            case "nextRoad":
                    creep.memory.policy = creep.memory.policy+1;
                    creep.memory.target = roleLeader.getSource(creep,population,workLoc);
                    creep.memory.action = "startRoad";
                break;
            case "rest":
                if (ai.rest(creep,population)) roleLeader.reset(creep);
                break;
            default:
                if (module.exports.lookForTask(creep)) ai.waitAtCenter(creep);

        }
        if (creep.ticksToLive < 250) {
            creep.memory.action = "rest";
            creep.memory.policy = false;
        }
        switch (creep.memory.policy){
            case false:
                creep.memory.policy = "roads";
                break;
            case "highways":
                planner.run(creep,population);
                if (population[creep.room.name].roads.length < 130){
                    creep.memory.action = "startRoad";
                    creep.memory.policy = 0;
                    creep.memory.target = roleLeader.getSource(creep,population,workLoc);
                } else {
                    
                    roleLeader.reset(creep);
                    creep.memory.away = ai.findExit(creep.room.name,false);
                    creep.memory.action = "startRoad";
                    creep.memory.policy = 0;
                    creep.memory.target = roleLeader.getSource(creep,population,workLoc);
                    //roleBuilder.spawnAway(population[creep.memory.home].spawns[0], population, creep.memory.away);
                    creep.say(creep.memory.away);
                    if (Game.gcl.level < Game.spawns.count) console.log("settler",roleSettler.spawn(spawnHome));
                }
                break;
            case "roads":
                planner.roads(creep,population);
                var targets = population[creep.room.name].sites;
                if(targets.length < 3) {
                    creep.memory.policy = "highways";
                }
                break;
        }
	},
    lookForTask: function(creep){

        return true;
    },
    getSource: function(creep,population,workLoc){
        console.log("worklot:",workLoc)
        if (typeof Game.rooms[workLoc] != 'undefined'){
            var sources = Game.rooms[workLoc].find(FIND_SOURCES);
            let minerals = Game.rooms[workLoc].find(FIND_MINERALS);
            if (creep.memory.policy < sources.length){
                return [population[creep.memory.home].spawns[0].pos,sources[creep.memory.policy].pos];
            } else {
                let nextSource = creep.memory.policy - sources.length;
                if (nextSource < minerals.length){
                    return [population[creep.memory.home].spawns[0].pos,minerals[nextSource].pos];
                } else {
                    if (nextSource == minerals.length){
                        nextSource = creep.memory.policy - minerals.length - sources.length;
                        
                        if (nextSource < 1){
                            let exit = ai.findExit(creep.memory.home,false);
                            return [population[creep.memory.home].spawns[0].pos,exit];
                        } else {
                            return [population[creep.memory.home].spawns[0].pos,creep.room.controller.pos];
                        }
                    } else {
                        roleLeader.reset(creep);
                        return [population[creep.memory.home].spawns[0].pos,false];
                    }
                }
            }
        } else {
            
            console.log(workLoc+" out of scope",Game.rooms[workLoc]);
        }
    }
};

module.exports = roleLeader;