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
// Farming System class
var FriendFarmSystem = function () {
    this._cropStates = [];
    for (var n = 0; n <= 100; n++) {
        this._cropStates.push(0);
    }
};
var _friendFarmSystem = new FriendFarmSystem();

/**
 * 播种
 * @param {Number} eventId
 * @param {Number} type
 */
FriendFarmSystem.prototype.seeding = function (eventId, type) {
    switch (type) {
        case this._cropGroup._carrot.name:
            this._cropStates[eventId] = new CropState(this._cropGroup._carrot);
            $gameParty.loseItem($dataItems[this._cropGroup._carrot.seedId], 1);
            break;

        case this._cropGroup._potato.name:
            this._cropStates[eventId] = new CropState(this._cropGroup._potato);
            $gameParty.loseItem($dataItems[this._cropGroup._potato.seedId], 1);
            break;
        case this._cropGroup._blackcurrant.name:
            this._cropStates[eventId] = new CropState(this._cropGroup._blackcurrant);
            $gameParty.loseItem($dataItems[this._cropGroup._blackcurrant.seedId], 1);
    }
};

/**
 * 收获
 * @param {Number} eventId
 */
FriendFarmSystem.prototype.harvest = function (eventId) {
    var amount = this._cropStates[eventId].type.amountOfProduct;
    $gameParty.gainItem($dataItems[this._cropStates[eventId].type.productId], amount);
    $gameMessage.add('收获了' + String(amount) + '个' + this._cropStates[eventId].type.name);
    this._cropStates[eventId] = 0;
};

/**
 * Event把柄
 * @param {Number} eventId
 */
FriendFarmSystem.prototype.onEventCall = function (eventId) {
    if (this._cropStates[eventId] === 0) {
        this.chooseSeed(eventId);
        return;
    }
    if (this._cropStates[eventId].done) {
        this.harvest(eventId);

        return;
    }
    $gameMessage.add(this._cropStates[eventId].type.name + ', ' + this._cropStates[eventId].dayGroth + '天');
};

/**
 * 选择种子窗口
 * @param {Number} eventId
 */
FriendFarmSystem.prototype.chooseSeed = function (eventId) {
    var choices = [];
    for (var cropKey in this._cropGroup) {
        if (!this._cropGroup.hasOwnProperty(cropKey)) continue;

        var obj = this._cropGroup[cropKey];
        if ($gameParty.hasItem($dataItems[obj.seedId])) {
            choices.push(obj.name);
        }
    }
    if (choices.length === 0) {
        $gameMessage.add('没有种子');
        return;
    }
    choices.push('取消');

    $gameMessage.setChoices(choices, 0, choices.length - 1);
    $gameMessage.setChoiceCallback(function (choice) {
        _friendFarmSystem.seeding(eventId, choices[choice]);
        }
    )
};

/**
 * 此地的作物是否成熟
 * @param {Number} eventId
 * @returns {boolean}
 */
FriendFarmSystem.prototype.isDone = function (eventId) {
    return _friendFarmSystem._cropStates[eventId].done;
};

var _farm_system_onDayChange = DayTimeSystem.prototype.onDayChange;
/**
 * 日期变更
 */
DayTimeSystem.prototype.onDayChange = function () {
    _farm_system_onDayChange.call(this);
    for(var n = 0; n <_friendFarmSystem._cropStates.length ; n++) {
        if (_friendFarmSystem._cropStates[n] === 0) {
            continue;
        }
        _friendFarmSystem._cropStates[n].dayGroth = this.getDay() - _friendFarmSystem._cropStates[n].startDate + 1;
        if (_friendFarmSystem._cropStates[n].dayGroth >= _friendFarmSystem._cropStates[n].type.dayRequired) {
            _friendFarmSystem._cropStates[n].done = true;
        }
    }
};

/**
 * Represent crop state
 * @param {Object} type type of crop
 * @constructor
 */
var CropState = function (type) {
    this.startDate = _dayTimeSystem.getDay();
    this.type = type;
    this.dayGroth = 1;
    this.done = false;
};
//=============================================================================
/**
 * 作物种类信息
 * @param {String} name
 * @param {Number} seedPrice
 * @param {Number} amount
 * @param {Number} dayRequired
 * @param {Number} productPrice
 * @param {Number} seedId
 * @param {Number} productId
 * @constructor
 */
var CropType = function (name, seedPrice, amount, dayRequired, productPrice, seedId, productId) {
    this.name = name;
    this.dayRequired = dayRequired;
    this.seedPrice = seedPrice;
    this.amountOfProduct = amount;
    this.productPrice = productPrice;
    this.seedId = seedId;
    this.productId = productId;
};
_friendFarmSystem._cropGroup = {};
_friendFarmSystem._cropGroup._carrot = new CropType('贾巴利萝卜', 5, 5, 2, 2, 2, 3);
_friendFarmSystem._cropGroup._potato = new CropType('贾巴利土豆', 30, 4, 5, 15, 4, 5);
_friendFarmSystem._cropGroup._blackcurrant = new CropType('贾巴利黑加仑', 120, 10, 10, 25, 6, 7);