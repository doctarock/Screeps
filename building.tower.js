var towers = {
    run: function(base){
        var towers = base.room.find(FIND_STRUCTURES, {
            filter: (structure) => {return structure.structureType == STRUCTURE_TOWER; }
        });
        for(var instance in towers) {
            let tower = towers[instance];
            if(tower) {

                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    tower.attack(closestHostile);
                } else if (tower.store.energy > tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax
                    });
                    if(closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                    }                    
                }
            }
        }
    }
};

module.exports = towers;