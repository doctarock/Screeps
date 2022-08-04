
ai = {
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
    mapRoom: function(creep){
        var terrain = creep.room.lookForAtArea('terrain', 0, 0, 49, 49);
        terrain[5][10] == 'plain'; // tile at y=5 x=10 is plain land
        terrain[25][40] == 'swamp'; // tile at y=25 x=40 is a swamp
    },
    rest: function(creep,population){
        let spawnHome;
        if (typeof creep.memory.home == 'undefined'){
            spawnHome = population[creep.room.name].spawns[0];
        } else {
            spawnHome = population[creep.memory.home].spawns[0];
        }
        creep.moveTo(spawnHome);
        creep.transfer(spawnHome, RESOURCE_ENERGY);
        spawnHome.renewCreep(creep);
        creep.say('🚧'+creep.ticksToLive);
        if (creep.ticksToLive > 1400) {
            return true;
        }
        return false;
    },
    goToRoom: function(creep, newroom){
        if (creep.room.name != newroom) {
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(newroom)));
        }
    },
    findExit: function(roomName,number){
        var exits = Game.map.describeExits(roomName);
        if (number != false){
            return exits[Object.keys(exits)[number]];
        }else{
            return exits[Object.keys(exits)[Math.floor(Math.random()*Object.keys(exits).length)]];
        }
    },
    waitAtCenter: function(creep){
        var posInRoom = new RoomPosition(25, 25, creep.room.name);
        creep.moveTo(posInRoom);
        creep.say('🚬');
    },
    layRoads: function(creep,population,maxRoads,maxSites){ 
        if (population[creep.room.name].roads < maxRoads && population[creep.room.name].sites.length < maxSites){
            creep.room.createConstructionSite( creep.pos.x, creep.pos.y, STRUCTURE_ROAD  ); 
        }
        ai.goToRoom(creep, creep.memory.away);
    },
    findOpenSpace: function(x,y,size){
        map = creep.room.lookAtArea(y,x,y+size,x+size);
        //loop row
		for (r = y; r < size+y; r++) {		
            //loop col	
			for (c = x; c < x+size; c++) {
                //loop objects
                cell = map[r][c];
			    for (o = 0; o < cell.length; o++) {
                    console.log(cell[o]);
                }
            }
        }
    }
};
module.exports = ai;