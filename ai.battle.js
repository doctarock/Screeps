
module.exports = {
    getDistance: function(oa,ob){
        var a = Math.abs(oa.x - ob.x);
        var b = Math.abs(oa.y - ob.y);
        return Math.floor(Math.sqrt( a*a + b*b ));
    },
    checkForEnemies: function(enemies,enemy_base){
        if (enemy_base.length > 0)
            return true;

        if (enemies.length > 0){
            for(var enemy in enemies) {
                if (enemies[enemy].name.indexOf("Keeper") == -1) return true;
            }
        }
        return false;
    },
    rally: function(){

    },
    target: function(creep,enemies,enemy_base,posInRoom){
        if(enemies.length == 0 && enemy_base.length == 0) {
            creep.memory.action = false;
            creep.memory.target = false;
        } else if ((creep.memory.action !== "fighting" || creep.memory.target == false) && enemies.length > 0 ) {
            
            if (enemies.length > 0){
                for(var enemy in enemies) {
                    if (enemies[enemy].name.indexOf("Keeper") == -1) {
                        creep.memory.action = "fighting";
                        creep.say('⚔️'+enemies[enemy].name);
                        console.log(creep.name+" vs "+enemies[enemy].id);
                        creep.moveTo(posInRoom);
                        creep.memory.away = false;
                        creep.memory.target = enemies[enemy].id;
                        
                        return;
                    }
                }
            }
            creep.memory.action = false;
            creep.memory.target = false;
	    } else if ((creep.memory.action !== "fighting" || creep.memory.target == false) && enemy_base.length > 0 ) {
            for(var buildings in enemy_base) {
             if (enemy_base[buildings].owner.username !== "Source Keeper" && enemy_base[buildings].owner.username !== "Power Bank"){
                 console.log(enemy_base[buildings].owner.username )
                creep.memory.action = "fighting";
                creep.say('⚔️'+enemy_base[buildings].name);
                console.log(creep.name+" vs "+enemy_base[buildings].owner.username+" building "+enemy_base[buildings].id);
                creep.moveTo(posInRoom);
                creep.memory.away = false;
                creep.memory.target = enemy_base[buildings].id;
                return;
             }
            }
	    }
    },
    attack: function(creep,enemies,enemy_base){
        if (creep.memory.target.length > 0){
            target = Game.getObjectById(creep.memory.target);
            if (target == null){
                creep.memory.target = false;
            }else {
                let result = creep.attack(target);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle:{
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }, range: 1});
                } else if (result < 0) {
                    creep.memory.action = "rest";
                    creep.memory.target = false;
                }
            }

        }else{
            if (enemies.length > 0){
                let result = creep.attack(enemies[0]);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(enemies[0], {visualizePathStyle:{
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }, range: 1});
                }
            } else {
                let result = creep.attack(enemy_base[0]);
                if(result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(enemy_base[0], {visualizePathStyle:{
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .1
                    }, range: 1});
                } else if (result < 0) {
                    console.log("cant attack",result);
                    creep.memory.action = "rest";
                    creep.memory.target = false;
                }
            }
        }
    },
    rangedAttack: function(creep,enemies,enemy_base){
        if (enemies.length > 0){
            let result = creep.rangedAttack(enemies[0]);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemies[0], {visualizePathStyle:{
                    fill: 'transparent',
                    stroke: '#fff',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1
                }, range: 1});
            }
        } else {
            let result = creep.rangedAttack(enemy_base[0]);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemy_base[0], {visualizePathStyle:{
                    fill: 'transparent',
                    stroke: '#fff',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1
                }, range: 1});
            } else if (result < 0) {
                console.log("cant attack",result);
                creep.memory.action = "rest";
                creep.memory.target = false;
            }
        }
    },
    callReinforcements: function(creep,population){
        if (population.fighters.list.length > 0){
            for(var fighter in population.fighters.list) {
                population.fighters.list[fighter].memory.away = creep.room.name;
            }
        } 
        if (population.scouts.list.length > 0){
            for(var scout in population.scouts.list) {
                population.scouts.list[scout].memory.away = creep.room.name;
            }
        }
    },
};