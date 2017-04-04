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
//Constant
var GAME_TIME_TINTS = [
    [30, 0, 40, 165], 	// => 0 hour
    [20, 0, 30, 165], 	// => 1 hour
    [20, 0, 30, 155], 	// => 2 hour
    [10, 0, 30, 145], 	// => 3 hour
    [10, 0, 20, 125], 	// => 4 hour
    [0, 0, 20, 125], 	// => 5 hour
    [75, 20, 20, 115], 	// => 6 hour
    [100, 30, 10,105],  // => 7 hour
    [75, 20, 10, 85], 	// => 8 hour
    [0, 0, 0, 55], 		// => 9 hour
    [0, 0, 0, 30], 		// => 10 hour
    [0, 0, 0, 10], 		// => 11 hour
    [0, 0, 0, 0], 		// => 12 hour
    [0, 0, 0, 0], 		// => 13 hour
    [0, 0, 0, 0], 		// => 14 hour
    [0, 0, 0, 5], 		// => 15 hour
    [0, 0, 0, 15], 		// => 16 hour
    [0, 0, 10, 45], 	// => 17 hour
    [75, 20, 20, 85], 	// => 18 hour
    [100, 40, 30, 105], // => 19 hour
    [75, 20, 40, 125], 	// => 20 hour
    [10, 0, 45, 140], 	// => 21 hour
    [20, 0, 45, 145], 	// => 22 hour
    [20, 0, 50, 160]	// => 23 hour
];
var INDOOR_MAPID = [3, 4, 6];

//=============================================================================
//Core basic
var dayTimeSystemParams = PluginManager.parameters('TimeSystem');

var DayTimeSystem = function() {
    this.day = 1;
    this.hour = 6;
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
        _dayTimeSystem._timer._work = true;
        init_game_start = false;
        if (INDOOR_MAPID.indexOf(this._mapId) === -1) {
            this.setTint();
        } else {
            $gameScreen.startTint([0, 0, 0, 0], 0);
        }
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
    this.hour = 6;
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
    if (this.hour >= 23) {
        this.processDate();
    } else {
        this.hour++;
    }
    this.onHourChange();
};

DayTimeSystem.prototype.setTint = function () {
    $gameScreen.startTint(GAME_TIME_TINTS[this.getHour()], 0);
};

DayTimeSystem.prototype.onHourChange = function () {
    //Tint world
    if (INDOOR_MAPID.indexOf($gameMap._mapId) === -1) {
        this.setTint();
    } else {
        $gameScreen.startTint([0, 0, 0, 0], 0);
    }
};

//=============================================================================
var _timeSystem_GamePlayer_reserveTransfer = Game_Player.prototype.reserveTransfer;
Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
    _timeSystem_GamePlayer_reserveTransfer.call(this, mapId, x, y, d, fadeType);
    if (INDOOR_MAPID.indexOf(mapId) === -1) {
        _dayTimeSystem.setTint();
    } else {
        $gameScreen.startTint([0, 0, 0, 0], 0);
    }
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
