/*:
 * @plugindesc Friend System Core
 * @author Eden
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 */

 function FriendCore() {
     throw new Error('This is a static class');
 }

DataManager.makeSaveContents = function() {
    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
    var contents = {};
    contents.system       = $gameSystem;
    contents.screen       = $gameScreen;
    contents.timer        = $gameTimer;
    contents.switches     = $gameSwitches;
    contents.variables    = $gameVariables;
    contents.selfSwitches = $gameSelfSwitches;
    contents.actors       = $gameActors;
    contents.party        = $gameParty;
    contents.map          = $gameMap;
    contents.player       = $gamePlayer;
    contents.friendFarm   = _friendFarmSystem;
    contents.timeSystem   = _dayTimeSystem;
    return contents;
};


DataManager.extractSaveContents = function(contents) {
    $gameSystem        = contents.system;
    $gameScreen        = contents.screen;
    $gameTimer         = contents.timer;
    $gameSwitches      = contents.switches;
    $gameVariables     = contents.variables;
    $gameSelfSwitches  = contents.selfSwitches;
    $gameActors        = contents.actors;
    $gameParty         = contents.party;
    $gameMap           = contents.map;
    $gamePlayer        = contents.player;
    _friendFarmSystem  = contents.friendFarm;
     _dayTimeSystem     = contents.timeSystem;
};