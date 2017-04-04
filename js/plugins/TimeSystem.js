/*:
 * @plugindesc Time system
 * @author Eden
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 */

//=============================================================================
//Core basic
var dayTimeSystemParams = PluginManager.parameters('TimeSystem');

var DayTimeSystem = function() {
    this.day = 1;
    this.hour = 0;
};
var _dayTimeSystem = new DayTimeSystem();

//=============================================================================
//Timer
function SystemTimer() {
    this._work = false;
    this._count = 0;
    this.start = function () {
        if (_dayTimeSystem._timer._work) {
            _dayTimeSystem._timer._count ++;
            _dayTimeSystem._timer.onTimeChange();
        }
        setTimeout(_dayTimeSystem._timer.start, 100);
    };
    this.onTimeChange = function () {
        if (this._count >= 60) {
            _dayTimeSystem.processHour();
            this._count = 0;
        }
    };
}
_dayTimeSystem._timer = new SystemTimer();
var init_game_start = true;
_dayTimeSystem._timer.start();

//=============================================================================

var _time_system_gameMap_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    _time_system_gameMap_setup.call(this, mapId);
    if (init_game_start) {
        console.log('good');
        _dayTimeSystem._timer._work = true;
        init_game_start = false;
    }
};

//=============================================================================
//Day
/**
 * 获取当前日期
 * @returns {number}
 */
DayTimeSystem.prototype.getDay = function () {
    return this.day;
};

DayTimeSystem.prototype.processDate = function () {
    this.day++;
    this.hour = 0;
    this.onDayChange();
};

DayTimeSystem.prototype.onDayChange = function () {
    // Event
};
//=============================================================================
//Hour

DayTimeSystem.prototype.getHour = function () {
    return this.hour;
};

DayTimeSystem.prototype.processHour = function () {
    if (this.hour >= 24) {
        this.processDate();
    } else {
        this.hour++;
    }
    this.onHourChange();
};

DayTimeSystem.prototype.onHourChange = function () {
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
    Window_Base.prototype.initialize.call(this, x, y, 240, 80);
    //this.drawIcon(...);
    //this.drawText(...);
    //...
    this._lastDay = 0;
    this._lastHour = -1;
    this.refresh();
};

// My window update function
Day_Window.prototype.refresh = function() {
    if (this._lastDay !== _dayTimeSystem.day || this._lastHour !== _dayTimeSystem.getHour()) {
        this._lastDay = _dayTimeSystem.getDay();
        this._lastHour = _dayTimeSystem.getHour();
        this.contents.clear();
        //Update
        var day_text = '第' + String(_dayTimeSystem.day) + '天';
        var hour_text = String(_dayTimeSystem.getHour()) + ' 点';
        this.contents.drawText(day_text, 0, 0, 70, 40, 'left');
        this.contents.drawText(hour_text, 120, 0, 70, 40, 'left');
    }

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
