/*:
 * @plugindesc Time system
 * @author Eden
 *
 * @param debug
 * @desc true of false
 * @default true
 */

var dayTimeSystemParams = PluginManager.parameters('TimeSystem');

var DayTimeSystem = function() {};
var _DayTimeSystem = new DayTimeSystem();
DayTimeSystem.prototype.day = 1;

DayTimeSystem.prototype.getDay = function () {
    return this.day;
};

DayTimeSystem.prototype.processDate = function () {
    this.day++;
    if (dayTimeSystemParams['debug']) {
        $gameMessage.add('今天是第' + String(this.day)+'天');
    }
};

