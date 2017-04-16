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
 * @default 60
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
// 常数
//======================================================================================================================
const mainActorID = 5;


//======================================================================================================================
// Decrease HP by time
//======================================================================================================================
var HP_consume_counter = 0;
var FSS_ST_onTimeChange = SystemTimer.prototype.onTimeChange;
SystemTimer.prototype.onTimeChange = function () {
    FSS_ST_onTimeChange.call(this);
    HP_consume_counter++;
    if (HP_consume_counter >= 40) {
        $gameActors.actor(mainActorID).gainHp(-1);
        HP_consume_counter = 0;
    }
};

//======================================================================================================================
// Sleeping: decrease HP and increase MP
//======================================================================================================================
var sleep_HP_cost = -45;
var sleep_MP_gain = 60;
var FSS_DTS_passDayBySleep = DayTimeSystem.prototype.passDayBySleep;
DayTimeSystem.prototype.passDayBySleep = function () {
    FSS_DTS_passDayBySleep.call(this);
    $gameActors.actor(mainActorID).gainHp(sleep_HP_cost);
    $gameActors.actor(mainActorID).gainMp(sleep_MP_gain);
};

var FSS_DTS_processDate = DayTimeSystem.prototype.processDate;
DayTimeSystem.prototype.processDate = function () {
    FSS_DTS_processDate.call(this);
    $gameActors.actor(mainActorID).gainMp(sleep_HP_cost);
    $gameActors.actor(mainActorID).gainMp(sleep_MP_gain * 0.5);
};

//======================================================================================================================
// Action cost
//======================================================================================================================
var NORMAL_ACTION_COST = 1;

function farmConsumeMp(cost) {
    $gameActors.actor(mainActorID).gainMp(-cost);
}