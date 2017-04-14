/*:
 * @plugindesc Farm System
 * @author Eden
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 */

//======================================================================================================================
// 常数
//======================================================================================================================
//农场地图编号
const FARM_MAP_ID = 1;

//======================================================================================================================
// 种田主体
//======================================================================================================================
/**
 * System class
 * @constructor
 */
function FriendFarmSystem () {
    this._wait = 0;
    this._cropStates = [];
    for (var n = 0; n <= 100; n++) {
        this._cropStates.push(0);
    }
}
var _friendFarmSystem = new FriendFarmSystem();

/**
 * Setup
 * @param mapId
 */
FriendFarmSystem.prototype.setup = function (mapId) {
    try {
        if (mapId === FARM_MAP_ID) {
            for (var n = 0; n < this._cropStates.length; n++) {
                if (this._cropStates[n] === 0) {
                    continue;
                }
                if (this._cropStates[n].done) {
                    this.drawCropTile(n, this._cropStates[n].type.finalTileId);
                    continue;
                }
                this.drawCropTile(n, 88);
            }
        }
    } catch (e) {
        console.log(e);
    }
};

/**
 * 播种
 * @param {Number} eventId
 * @param {Number} type
 */
FriendFarmSystem.prototype.seeding = function (eventId, type) {
    var cropType;
    switch (type) {
        //萝卜
        case this._cropGroup._carrot.name:
            cropType = this._cropGroup._carrot;
            break;

        //土豆
        case this._cropGroup._potato.name:
            cropType = this._cropGroup._potato;
            break;

        //黑加仑
        case this._cropGroup._blackcurrant.name:
            cropType = this._cropGroup._blackcurrant;
            break;

        case '取消':
            return;
    }
    this._cropStates[eventId] = new CropState(cropType);
    $gameParty.loseItem($dataItems[cropType.seedId], 1);
    this.drawCropTile(eventId, 88);
    this.startActionWait(1);
    farmConsumeMp(8);
};

/**
 * 浇水
 * @param eventId
 */
FriendFarmSystem.prototype.watering = function (eventId) {
    $gamePlayer.requestBalloon(6);
    farmConsumeMp(2);
    this.startActionWait(3);
    this._cropStates[eventId].daily = true;
    this.drawCropTile(eventId, 88);
};

/**
 * 收获
 * @param {Number} eventId
 */
FriendFarmSystem.prototype.harvest = function (eventId) {
    this.startActionWait(1);
    var amount = this._cropStates[eventId].type.amountOfProduct;
    $gameParty.gainItem($dataItems[this._cropStates[eventId].type.productId], amount);
    $gameMessage.add('收获了' + String(amount) + '个' + this._cropStates[eventId].type.name);
    this._cropStates[eventId] = 0;
    this.drawCropTile(eventId, 0);
};

/**
 * 作物死亡
 * @param eventId
 */
FriendFarmSystem.prototype.cropDeath = function (eventId) {
    this._cropStates[eventId] = 0;
    this.drawCropTile(eventId, 0);
};

/**
 * 更改作物的贴图
 * @param eventId
 * @param tileId
 */
FriendFarmSystem.prototype.drawCropTile = function (eventId, tileId) {
    if ($gameMap._mapId === 1) {
        $gameMap._events[eventId]._tileId = tileId;
        var colorTone = [0, 0, 0, 0];
        if (!this._cropStates[eventId].daily) {
            colorTone = [0, 0, 0, 200];
        }
        this.drawCropColor(eventId, colorTone);
    }
};

/**
 * 给作物上色
 * @param eventId
 * @param colorTone
 */
FriendFarmSystem.prototype.drawCropColor = function (eventId, colorTone) {
    if (!this.currentSceneMap._spriteset) {
        setTimeout(this.drawCropColor.bind(this, eventId, colorTone), 10);
        return;
    }
    this.currentSceneMap._spriteset._characterSprites[eventId - 1].setColorTone(colorTone);
};

/**
 * Event把柄
 * @param {Number} eventId
 */
FriendFarmSystem.prototype.onEventCall = function (eventId) {
    //空田,选种子
    if (this._cropStates[eventId] === 0) {
        this.chooseSeed(eventId);
        return;
    }
    //成熟,收获
    if (this._cropStates[eventId].done) {
        this.harvest(eventId);
        return;
    }
    //缺水,浇水
    if (!this._cropStates[eventId].daily) {
        this.watering(eventId);
        return;
    }
    $gameMessage.add(this._cropStates[eventId].type.name + ', 已成长' + this._cropStates[eventId].dayGroth + '天');
};

/**
 * 选择种子窗口
 * @param {Number} eventId
 */
FriendFarmSystem.prototype.chooseSeed = function (eventId) {
    var choices = [];
    //检查玩家是否有种子,将拥有的种子加入选项单
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

FriendFarmSystem.prototype.startActionWait = function (duration) {
    this._wait = duration;
};

FriendFarmSystem.prototype.updateActionWait = function () {
    if (this._wait > 0) {
        this._wait--;
        console.log(this._wait);
    }
};

/**
 * 日期变更操作
 */
FriendFarmSystem.prototype.dayChangeProcess = function (day) {
    for(var n = 0; n <this._cropStates.length ; n++) {
        if (this._cropStates[n] === 0) {
            continue;
        }
        if (this._cropStates[n].done) {
            continue;
        }
        //没有浇水,作物死亡
        if (!this._cropStates[n].daily) {
            this.cropDeath(n);
            continue;
        }
        //更新成长天数
        this._cropStates[n].dayGroth = day - this._cropStates[n].startDate;
        //成熟后
        if (this._cropStates[n].dayGroth >= this._cropStates[n].type.dayRequired) {
            this._cropStates[n].done = true;
            this.drawCropTile(n, this._cropStates[n].type.finalTileId);
            continue;
        }
        //浇水状态重置
        this._cropStates[n].daily = false;
    }
};

//======================================================================================================================
// 实时作物状态
//======================================================================================================================
/**
 * Represent crop state
 * startdate    开始日期
 * type         种类
 * dayGroth     成长天数
 * daily        每日浇水
 * done         成熟
 * @param {Object} type type of crop
 * @constructor
 */
function CropState (type) {
    this.startDate = _dayTimeSystem.getDay();
    this.type = type;
    this.dayGroth = 0;
    this.daily = false;
    this.done = false;
}
//======================================================================================================================
// 作物信息
//======================================================================================================================
/**
 * 作物种类信息
 * @param {String} name
 * @param {Number} seedPrice
 * @param {Number} amount
 * @param {Number} dayRequired
 * @param {Number} productPrice
 * @param {Number} seedId
 * @param {Number} productId
 * @param {Number} finalTileId
 * @constructor
 */
function CropType (name, seedPrice, amount, dayRequired, productPrice, seedId, productId, finalTileId) {
    this.name = name;
    this.dayRequired = dayRequired;
    this.seedPrice = seedPrice;
    this.amountOfProduct = amount;
    this.productPrice = productPrice;
    this.seedId = seedId;
    this.productId = productId;
    this.finalTileId = finalTileId;
}

_friendFarmSystem._cropGroup = {};
_friendFarmSystem._cropGroup._carrot = new CropType('贾巴利萝卜', 5, 5, 2, 2, 2, 3, 109);
_friendFarmSystem._cropGroup._potato = new CropType('贾巴利土豆', 30, 4, 5, 15, 4, 5, 110);
_friendFarmSystem._cropGroup._blackcurrant = new CropType('贾巴利黑加仑', 120, 10, 10, 25, 6, 7, 111);

//======================================================================================================================
// 其他插件修改
//======================================================================================================================
var _farm_system_onDayChange = DayTimeSystem.prototype.onDayChange;
/**
 * 日期变更
 */
DayTimeSystem.prototype.onDayChange = function () {
    _farm_system_onDayChange.call(this);
    _friendFarmSystem.dayChangeProcess(this.getDay());
};

var _FS_DTS_onMinuteChange = DayTimeSystem.prototype.onMinuteChange;
DayTimeSystem.prototype.onMinuteChange = function () {
    _FS_DTS_onMinuteChange.call(this);
    _friendFarmSystem.updateActionWait();
};

//======================================================================================================================
// CORE修改
//======================================================================================================================
/**
 * 地图初始化时：
 * 1. 农田更新作物贴图
 * @type {*}
 * @private
 */
var _farm_system_gameMap_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    _farm_system_gameMap_setup.call(this, mapId);
    _friendFarmSystem.setup(mapId);
};

var FS_SM_create = Scene_Map.prototype.create;
Scene_Map.prototype.create = function () {
    FS_SM_create.call(this);
    _friendFarmSystem.currentSceneMap = this;
};

var _FS_GP_executeMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function (direction) {
    if (_friendFarmSystem._wait > 0) {
        return;
    }
    _FS_GP_executeMove.call(this, direction);
};