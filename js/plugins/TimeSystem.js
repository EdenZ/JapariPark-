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
//=============================================================================

//色调信息
var GAME_TIME_TINTS = [
    [30, 0, 40, 165], 	// => 0 hour
    [20, 0, 30, 165], 	// => 1 hour
    [20, 0, 30, 155], 	// => 2 hour
    [10, 0, 30, 145], 	// => 3 hour
    [10, 0, 20, 125], 	// => 4 hour
    [0, 0, 20, 125], 	// => 5 hour
    [75, 20, 20, 115], 	// => 6 hour
    [100, 30, 10, 105],  // => 7 hour
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
//室内地图ID
var INDOOR_MAPID = [3, 4, 6];

var WEEKDAY_NAME = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
var MONTH_NAME = ['十二月', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月'];

//=============================================================================
//Core basic
//=============================================================================
var dayTimeSystemParams = PluginManager.parameters('TimeSystem');

function DayTimeSystem () {
    this.day = 1;
    this.hour = 6;
    this.minute = 0;
    this.week = 1;
    this.month = 1;
    this.year = 1;
}
var _dayTimeSystem = new DayTimeSystem();

//=============================================================================
//Timer
//=============================================================================
/**
 * 内部计时器
 * @constructor
 */
function SystemTimer() {
    this._work = false;
    this._count = 0;
}

/**
 * 计时
 */
SystemTimer.prototype.start = function () {
    //计时器在用 and 无对话窗口
    if (_dayTimeSystem._timer._work && !$gameMessage.isBusy()) {
        _dayTimeSystem._timer._count++;
        _dayTimeSystem._timer.onTimeChange();
    }
    setTimeout(_dayTimeSystem._timer.start, 100);
};

/**
 * 毫秒改变事件
 */
SystemTimer.prototype.onTimeChange = function () {
    if (this._count >= 10) {
        _dayTimeSystem.processMinute();
        this._count = 0;
    }
};

_dayTimeSystem._timer = new SystemTimer();
var init_game_start = true;
_dayTimeSystem._timer.start();

//-----------------------------------------------------------------------------
//GameMap, Scene_Menu
//-----------------------------------------------------------------------------
/**
 * 1.start timer when begin
 * 2.set tint at the beginning of map setup
 * @type {*}
 * @private
 */
var _time_system_gameMap_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function (mapId) {
    _time_system_gameMap_setup.call(this, mapId);
    //游戏开始时，计时
    if (init_game_start) {
        _dayTimeSystem._timer._work = true;
        init_game_start = false;
    }
    if (INDOOR_MAPID.indexOf(mapId) === -1) {
        _dayTimeSystem.setTint();
    } else {
        $gameScreen.startTint([0, 0, 0, 0], 0);
    }
};

var _time_system_SceneMenu_Start = Scene_Menu.prototype.start;
Scene_Menu.prototype.start = function() {
    _time_system_SceneMenu_Start.call(this);
    _dayTimeSystem._timer._work = false;
};

var _time_system_SceneMenu_Stop = Scene_Menu.prototype.stop;
Scene_Menu.prototype.stop = function() {
    _time_system_SceneMenu_Stop.call(this);
    _dayTimeSystem._timer._work = true;
};


//=============================================================================
//Year
//=============================================================================

DayTimeSystem.prototype.getYear = function () {
    return this.year;
};

DayTimeSystem.prototype.calculateYear = function () {
    this.year = Math.ceil(this.day / 84);
    this.onYearChange();
};

DayTimeSystem.prototype.onYearChange = function () {
    //Event
};

//=============================================================================
//Month
//=============================================================================

DayTimeSystem.prototype.getMonth = function () {
    return this.month;
};

DayTimeSystem.prototype.calculateMonth = function () {
    this.month = Math.ceil(this.day / 7 ) % 12;
    this.onMonthChange();
};

DayTimeSystem.prototype.onMonthChange = function () {
    //Event
};

//=============================================================================
//Week
//=============================================================================

DayTimeSystem.prototype.getWeek = function () {
    return this.week;
};

DayTimeSystem.prototype.calculateWeek = function () {
    this.week = this.day % 7;
    this.onWeekChange();
};

DayTimeSystem.prototype.onWeekChange = function () {
    //Event
};

//=============================================================================
//Day
//=============================================================================
/**
 * 获取当前日期
 * @returns {number}
 */
DayTimeSystem.prototype.getDay = function () {
    return this.day;
};

/**
 * 日期++
 */
DayTimeSystem.prototype.processDate = function () {
    this.day++;
    this.calculateCalendar();
    this.hour = 0;
    this.onDayChange();
};

/**
 * Calculate week, month and year
 */
DayTimeSystem.prototype.calculateCalendar = function () {
    this.calculateWeek();
    this.calculateMonth();
    this.calculateYear();
};

/**
 * pass day by sleep
 */
DayTimeSystem.prototype.passDayBySleep = function () {
    if (this.hour >= 6) {
        this.day++;
        this.calculateCalendar();
        this.onDayChange();
    }
    this.hour = 6;
    this._timer._count = 0;
};

/**
 * 日期变更事件
 */
DayTimeSystem.prototype.onDayChange = function () {
    // Event
};
//=============================================================================
//Hour
//=============================================================================
/**
 * 获取小时
 * @returns {number}
 */
DayTimeSystem.prototype.getHour = function () {
    return this.hour;
};

/**
 * 小时++
 */
DayTimeSystem.prototype.processHour = function () {
    this.hour++;
    this.minute = 0;
    if (this.hour >= 24) {
        this.processDate();
    }
    this.onHourChange();
};

/**
 * 根据当前时间设置色调
 */
DayTimeSystem.prototype.setTint = function () {
    $gameScreen.startTint(GAME_TIME_TINTS[this.getHour()], 0);
};

/**
 * 小时变更事件
 */
DayTimeSystem.prototype.onHourChange = function () {
    //Tint world
    if (INDOOR_MAPID.indexOf($gameMap._mapId) === -1) {
        this.setTint();
    } else {
        $gameScreen.startTint([0, 0, 0, 0], 0);
    }
};

//=============================================================================
//Minute
//=============================================================================
DayTimeSystem.prototype.getMinute = function () {
    return this.minute;
};

DayTimeSystem.prototype.processMinute = function () {
    this.minute++;
    if (this.minute >= 60) {
        this.processHour();
    }
    this.onMinuteChange();
};

DayTimeSystem.prototype.onMinuteChange = function () {
    //Event
};

//-----------------------------------------------------------------------------
// Scene map
//-----------------------------------------------------------------------------
/**
 * 添加时间窗口到左上角
 * @type {*}
 * @private
 */
var _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);
    this._day_Window = new Day_Window(0, 0);
    _dayTimeSystem._day_Window = this._day_Window;
    this.addWindow(this._day_Window);
};

/**
 * 同步刷新时间窗口
 * @type {*}
 * @private
 */
// When scene map update, refresh my window
var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    this._day_Window.refresh();
};

/**
 * Hide day window when fade out
 * 停止计时
 * @type {*}
 */
var alias_Game_Screen_startFadeOut = Game_Screen.prototype.startFadeOut;
Game_Screen.prototype.startFadeOut = function (duration) {
    alias_Game_Screen_startFadeOut.call(this, duration);
    _dayTimeSystem._day_Window.hide();
    _dayTimeSystem._timer._work = false;
};

/**
 * Show day window when fade out
 * 开始计时
 * @type {*}
 */
var alias_Game_Screen_startFadeIn = Game_Screen.prototype.startFadeIn;
Game_Screen.prototype.startFadeIn = function (duration) {
    alias_Game_Screen_startFadeIn.call(this, duration);
    _dayTimeSystem._day_Window.show();
    _dayTimeSystem._timer._work = true;
};
//=============================================================================
//时间窗口
//=============================================================================
function Day_Window() {
    this.initialize.apply(this, arguments);
}
Day_Window.prototype = Object.create(Window_Base.prototype);
Day_Window.prototype.constructor = Day_Window;

/**
 * 窗口参数
 * @param x
 * @param y
 */
Day_Window.prototype.initialize = function (x, y) {
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    //this.drawIcon(...);
    //this.drawText(...);
    //...
    this._lastMinute = -1;
    this._lastHour = -1;
    this.refresh();
};

Day_Window.prototype.windowWidth = function() {
    //16
    return 200;
};

Day_Window.prototype.windowHeight = function() {
    return this.fittingHeight(2);
};

// My window update function
/**
 * 刷新窗口信息
 */
Day_Window.prototype.refresh = function () {
    if (this._lastHour !== _dayTimeSystem.getHour() || this._lastMinute !== _dayTimeSystem.getMinute()) {
        this._lastMinute = _dayTimeSystem.getMinute();
        this._lastHour = _dayTimeSystem.getHour();
        this.contents.clear();
        //Update
        var calendar_text = String(_dayTimeSystem.year) + '年  ' + MONTH_NAME[_dayTimeSystem.month];
        var weekName_text = WEEKDAY_NAME[_dayTimeSystem.week];
        var hour = (_dayTimeSystem.getHour() < 10 ? '0' : '') + String(_dayTimeSystem.getHour());
        var minute = (_dayTimeSystem.getMinute() < 10 ? '0' : '') + String(_dayTimeSystem.getMinute());
        var clock_text = hour + ':' + minute;
        this.contents.drawText(calendar_text, 10, 0, this.textWidth(calendar_text), this.fittingHeight(0), 'left');
        this.contents.drawText(weekName_text, 10, this.fittingHeight(0), 50,this.fittingHeight(0) , 'left');
        this.contents.drawText(clock_text, 80, this.fittingHeight(0), 120, this.fittingHeight(0), 'left');
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
