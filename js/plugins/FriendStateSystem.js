/*:
 * @plugindesc Friend State Controller
 * @author Eden
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 */

var mainActorID = 5;


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
var FSS_DTS_passDayBySleep = DayTimeSystem.prototype.passDayBySleep;
DayTimeSystem.prototype.passDayBySleep = function () {
    FSS_DTS_passDayBySleep.call(this);
    $gameActors.actor(mainActorID).gainHp(-45);
    $gameActors.actor(mainActorID).gainMp(50);
};