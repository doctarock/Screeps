var functions = {

    /** @param {Creep} creep **/
    clearRam: function(creep,iteration) {

        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                console.log('Rest in peace', name, Memory.creeps[name].trips);
                delete Memory.creeps[name];
            }
        }
	},
    fixWallBug: function(creep){
        let go = true;
        switch (true){
            case (creep.pos.x === 0):
                creep.moveTo(creep.pos.x+1, creep.pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                go = false;
                creep.say('left wall');
                break;
            case (creep.pos.x === 49):
                creep.moveTo(creep.pos.x-1, creep.pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                go = false;
                creep.say('right wall');
                break;
            case (creep.pos.y === 0):
                creep.moveTo(creep.pos.x, creep.pos.y+1, {visualizePathStyle: {stroke: '#ffaa00'}});
                creep.say('top wall');
                go = false;
                break;
            case (creep.pos.y === 49):
                creep.moveTo(creep.pos.x, creep.pos.y-1, {visualizePathStyle: {stroke: '#ffaa00'}});
                go = false;
                creep.say('bottom wall');
                break;
        }
        return go;
    }
};

module.exports = functions;