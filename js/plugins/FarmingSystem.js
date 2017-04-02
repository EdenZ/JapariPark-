/**
 * Created by edent on 2017/4/2.
 */

var aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    aliasPluginCommand.call(this, command, args);
    if (command === 'farm_system') {
        switch(args[0]) {
            case 'sending':
                $gameMessage.add('种田啊？');
                break;
        }
    }
};