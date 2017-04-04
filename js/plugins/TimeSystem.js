/*:
 * @plugindesc Time system
 * @author Eden
 *
 * @param debug
 * @desc true of false
 * @default false
 */

var dayTimeSystemParams = PluginManager.parameters('TimeSystem');

var DayTimeSystem = function() {
    this.day = 1;
};
var _dayTimeSystem = new DayTimeSystem();

DayTimeSystem.prototype.getDay = function () {
    return this.day;
};

DayTimeSystem.prototype.processDate = function () {
    this.day++;
    this.onDayChange();
    if (dayTimeSystemParams['debug'] === 'true') {
        $gameMessage.add('今天是第' + String(this.day)+'天');
    }
};

DayTimeSystem.prototype.onDayChange = function () {
    // Event
};

//=============================================================================
// Scene map
var _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    this._day_Window = new Day_Window(0, 0);
    _dayTimeSystem._day_Window = this._day_Window;
    this.addWindow(this._day_Window);
};

// When scene map update, refresh my window
var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    this._day_Window.refresh();
};

/**
 * Hide day window when fade out
 * @type {*}
 */
var alias_Game_Screen_startFadeOut = Game_Screen.prototype.startFadeOut;
Game_Screen.prototype.startFadeOut = function(duration) {
    alias_Game_Screen_startFadeOut.call(this, duration);
    _dayTimeSystem._day_Window.hide();
};

/**
 * Show day window when fade out
 * @type {*}
 */
var alias_Game_Screen_startFadeIn = Game_Screen.prototype.startFadeIn;
Game_Screen.prototype.startFadeIn = function(duration) {
    alias_Game_Screen_startFadeIn.call(this, duration);
    _dayTimeSystem._day_Window.show();
};
//=============================================================================
// Add my window to scene map when it start
function Day_Window() {
    this.initialize.apply(this, arguments);
}
Day_Window.prototype = Object.create(Window_Base.prototype);
Day_Window.prototype.constructor = Day_Window;

Day_Window.prototype.initialize = function(x, y) {
    Window_Base.prototype.initialize.call(this, x, y, 140, 80);
    //this.drawIcon(...);
    //this.drawText(...);
    //...
    this._lastDay = 0;
    this.refresh();
};

// My window update function
Day_Window.prototype.refresh = function() {
    if (this._lastDay === _dayTimeSystem.day) {
        return;
    }
    this.contents.clear();
    //Update
    var day_text = '第' + String(_dayTimeSystem.day) + '天';
    this.contents.drawText(day_text, 10, 0, 80, 40, 'left');
};

/**
 * Template
 * @type {*}
 * @private
 */
var _day_window_onDayChange = DayTimeSystem.prototype.onDayChange;
DayTimeSystem.prototype.onDayChange = function () {
    _day_window_onDayChange.call(this);
};

//=============================================================================
