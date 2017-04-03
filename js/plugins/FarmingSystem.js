/**
 * @param 成熟时间
 * @desc 种子成熟的时间（秒）
 * @default 60
 */

var aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    aliasPluginCommand.call(this, command, args);
    if (command === 'farm_system') {
        switch(args[0]) {
            case 'seeding':
                
                break;
        }
    }
};

