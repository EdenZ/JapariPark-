/*:
 * @plugindesc Friend State Controller
 * @author Eden
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 *
 * @param 掉血率
 * @desc 游戏时间每小时掉血量
 * @default 15
 *
 * @param 睡觉掉血量
 * @desc 每次睡觉掉血量
 * @default 45
 *
 * @param 睡觉回复精力
 * @desc 睡觉回复的精力量
 * @default 60
 *
 * @param 主角角色ID
 * @desc 玩家的角色ID
 * @default 5
 */
//======================================================================================================================
// 常数和参数
//======================================================================================================================
FriendCore._stateParams = PluginManager.parameters('FriendStateSystem');
FriendCore._hpDropRate = Number(FriendCore._stateParams['掉血率']);
FriendCore._sleepDropHp = Number(FriendCore._stateParams['睡觉掉血量']);
FriendCore._sleepMpRegen = Number(FriendCore._stateParams['睡觉回复精力']);
FriendCore._mainActorID = Number(FriendCore._stateParams['主角角色ID']);

var _HpConsumeCounterGate = 600 / FriendCore._hpDropRate;

//======================================================================================================================
// Decrease HP by time
//======================================================================================================================
var _HP_consume_counter = 0;
var FSS_ST_onTimeChange = SystemTimer.prototype.onTimeChange;
SystemTimer.prototype.onTimeChange = function () {
    FSS_ST_onTimeChange.call(this);
    _HP_consume_counter++;
    if (_HP_consume_counter >= _HpConsumeCounterGate) {
        $gameActors.actor(FriendCore._mainActorID).gainHp(-1);
        _HP_consume_counter = 0;
    }
};

//======================================================================================================================
// Sleeping: decrease HP and increase MP
//======================================================================================================================
var FSS_DTS_passDayBySleep = DayTimeSystem.prototype.passDayBySleep;
DayTimeSystem.prototype.passDayBySleep = function () {
    FSS_DTS_passDayBySleep.call(this);
    $gameActors.actor(FriendCore._mainActorID).gainHp(-FriendCore._sleepDropHp);
    $gameActors.actor(FriendCore._mainActorID).gainMp(FriendCore._sleepMpRegen);
};

var FSS_DTS_processDate = DayTimeSystem.prototype.processDate;
DayTimeSystem.prototype.processDate = function () {
    FSS_DTS_processDate.call(this);
    $gameActors.actor(FriendCore._mainActorID).gainMp(-FriendCore._sleepDropHp);
    $gameActors.actor(FriendCore._mainActorID).gainMp(FriendCore._sleepMpRegen * 0.5);
};

//======================================================================================================================
// Action cost
//======================================================================================================================
function farmConsumeMp(cost) {
    $gameActors.actor(FriendCore._mainActorID).gainMp(-cost);
}

//======================================================================================================================
// 状态条窗口
//======================================================================================================================
function Stat_Window() {
    this.initialize.apply(this, arguments);
}
Stat_Window.prototype = Object.create(Window_Base.prototype);
Stat_Window.prototype.constructor = Stat_Window;

/**
 * 窗口参数
 */
Stat_Window.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, Graphics.boxWidth - this.windowWidth(), 0, this.windowWidth(), this.windowHeight());
    this._lastHp = -1;
    this._lastMp = -1;
    this.refresh();
};

Stat_Window.prototype.windowWidth = function() {
    return 225;
};

Stat_Window.prototype.windowHeight = function() {
    return this.fittingHeight(2);
};

// My window update function
/**
 * 刷新窗口信息
 */
Stat_Window.prototype.refresh = function () {
    if (this._lastHp === $gameActors.actor(FriendCore._mainActorID)._hp && this._lastMp === $gameActors.actor(FriendCore._mainActorID)._mp) {
        return;
    }
    this.contents.clear();
    this.drawActorHp($gameActors.actor(FriendCore._mainActorID), 0, 0);
    this.drawActorMp($gameActors.actor(FriendCore._mainActorID), 0, this.fittingHeight(0));
    this._lastHp = $gameActors.actor(FriendCore._mainActorID)._hp;
    this._lastMp = $gameActors.actor(FriendCore._mainActorID)._mp;
};

//======================================================================================================================
// CORE修改
//======================================================================================================================
var _FSS_SM_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function () {
    _FSS_SM_start.call(this);
    this._stat_Window = new Stat_Window();
    FriendCore._stat_Window = this._stat_Window;
    this.addWindow(this._stat_Window);
};

var _FSS_MS_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function () {
    _FSS_MS_update.call(this);
    this._stat_Window.refresh();
};

var _FSS_GS_startFadeOut = Game_Screen.prototype.startFadeOut;
Game_Screen.prototype.startFadeOut = function (duration) {
    _FSS_GS_startFadeOut.call(this, duration);
    FriendCore._stat_Window.hide();
};

var _FSS_GS_startFadeIn = Game_Screen.prototype.startFadeIn;
Game_Screen.prototype.startFadeIn = function (duration) {
    _FSS_GS_startFadeIn.call(this, duration);
    FriendCore._stat_Window.show();
};