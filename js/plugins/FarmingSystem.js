/*:
 * @param 成熟时间
 * @desc 种子成熟的时间（秒）
 * @default 60
 */

//=============================================================================
// Plugin command
var aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    aliasPluginCommand.call(this, command, args);
    if (command === 'farm_system') {
        switch(args[0]) {
            case 'seeding':
                
                break;
        }
    }
};

//=============================================================================
var FriendFarmSystem = function () {
    this._cropStates = [];
    for (var n = 0; n <= 100; n++) {
        this._cropStates.push(0);
    }
};
var _friendFarmSystem = new FriendFarmSystem();
console.log(_friendFarmSystem._cropStates);


FriendFarmSystem.prototype.seeding = function (eventId, type) {
    switch (type) {
        case 'carrot':
            this._cropStates[eventId] = new CropState(_friendFarmSystem._carrotCrop);
            break;
    }
};

FriendFarmSystem.prototype.harvest = function (eventId) {
    $gameParty.gainItem($dataItems[1], 2);
    this._cropStates[eventId] = 0;
};

FriendFarmSystem.prototype.onEventCall = function (eventId) {
    if (this._cropStates[eventId] === 0) {
        this.seeding(eventId, 'carrot');
        $gameMessage.add('成功种下萝卜');
        return;
    }
    if (this._cropStates[eventId].done) {
        this.harvest(eventId);
        $gameMessage.add('收获的萝卜突然变成2个瓶子！');
        return;
    }
    $gameMessage.add('播种第' + this._cropStates[eventId].dayGroth + '天');
};

FriendFarmSystem.prototype.isDone = function (eventId) {
    return _friendFarmSystem._cropStates[eventId].done;
};

var _farm_system_onDayChange = DayTimeSystem.prototype.onDayChange;
DayTimeSystem.prototype.onDayChange = function () {
    _farm_system_onDayChange.call(this);
    for(var n = 0; n <_friendFarmSystem._cropStates.length ; n++) {
        if (_friendFarmSystem._cropStates[n] === 0) {
            continue;
        }
        _friendFarmSystem._cropStates[n].dayGroth = this.getDay() - _friendFarmSystem._cropStates[n].startDate;
        if (_friendFarmSystem._cropStates[n].dayGroth === _friendFarmSystem._cropStates[n].type.dayRequired) {
            _friendFarmSystem._cropStates[n].done = true;
        }
    }
};

/**
 * Represent crop state
 * @param type type of crop
 * @constructor
 */
var CropState = function (type) {
    this.startDate = _dayTimeSystem.getDay();
    this.type = type;
    this.dayGroth = 0;
    this.done = false;
};
//=============================================================================
var CropType = function (name, dayRequired) {
    this.name = name;
    this.dayRequired = dayRequired;
};
_friendFarmSystem._carrotCrop = new CropType('carrot', 3);