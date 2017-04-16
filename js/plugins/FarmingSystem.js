/*:
 * @plugindesc Farm System
 * @author Eden
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 *
 * @param 种子物品ID
 * @desc 把所有种子ID输入到这里,用空格分开
 * @default
 *
 * @param 产物物品ID
 * @desc 把所有产物ID输入到这里,用空格分开
 * @default
 *
 * @param 播种精力消耗
 * @desc
 * @default 8
 *
 * @param 播种读条时间
 * @desc 现实秒
 * @default 1
 *
 * @param 浇水精力消耗
 * @desc
 * @default 2
 *
 * @param 浇水读条时间
 * @desc 现实秒
 * @default 3
 */

//======================================================================================================================
// 常数和参数
//======================================================================================================================
FriendCore._farmParams = PluginManager.parameters('FarmingSystem');
FriendCore._seedingMPCost = Number(FriendCore._farmParams['播种精力消耗']);
FriendCore._seedingTiming = Number(FriendCore._farmParams['播种读条时间']);
FriendCore._wateringMPCost = Number(FriendCore._farmParams['浇水精力消耗']);
FriendCore._wateringTiming = Number(FriendCore._farmParams['浇水读条时间']);

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
    if (!this.checkAndConsumeMP(FriendCore._seedingMPCost))  {
        $gamePlayer.requestBalloon(7);
        return;
    }
    $gamePlayer.setProcessBar(FriendCore._seedingTiming);
    this._cropStates[eventId] = new CropState(cropType);
    $gameParty.loseItem($dataItems[cropType.seedId], 1);
    this.drawCropTile(eventId, 88);
};

/**
 * 浇水
 * @param eventId
 */
FriendFarmSystem.prototype.watering = function (eventId) {
    if (!this.checkAndConsumeMP(FriendCore._wateringMPCost)) {
        $gamePlayer.requestBalloon(7);
        return;
    }
    $gamePlayer.setProcessBar(FriendCore._wateringTiming);
    this._cropStates[eventId].daily = true;
    this.drawCropTile(eventId, 88);
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
    var spriteSet = this.currentSceneMap._spriteset._characterSprites;
    var length = spriteSet.length;
    //匹配事件ID上色
    for (var n = 0; n <length; n++) {
        if (spriteSet[n]._character instanceof Game_Event && spriteSet[n]._character._eventId === eventId) {
            //找到对象完成作业并结束任务
            spriteSet[n].setColorTone(colorTone);
            return;
        }
    }
};

/**
 * Event把柄
 * @param {Object} caller
 */
FriendFarmSystem.prototype.onEventCall = function (caller) {
    var eventId = caller._eventId;
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
 * 消耗MP
 * @param amount
 * @return boolean
 */
FriendFarmSystem.prototype.checkAndConsumeMP = function (amount) {
    if ($gameActors.actor(FriendCore._mainActorID)._mp < amount) return false;
    farmConsumeMp(amount);
    return true;
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
    this.setup($gameMap.mapId());
};

//======================================================================================================================
// 显示读条
//======================================================================================================================
function Sprite_ProcessBar() {
    this.initialize.apply(this, arguments);
}

Sprite_ProcessBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_ProcessBar.prototype.constructor = Sprite_ProcessBar;

Sprite_ProcessBar.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.initMembers();
    this.loadBitmap();
};

Sprite_ProcessBar.prototype.initMembers = function() {
    this._balloonId = 0;
    this._duration = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this.z = 7;
};

Sprite_ProcessBar.prototype.loadBitmap = function() {
    this.bitmap = ImageManager.loadSystem('FriendSpriteSheet');
    this.setFrame(0, 0, 0, 0);
};

Sprite_ProcessBar.prototype.setup = function(durationInSec) {
    this._balloonId = 1;
    this._duration = durationInSec * 60;
    this._speed = this._duration / 8;
};

//Called as a child
Sprite_ProcessBar.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    if (this._duration > 0) {
        this._duration--;
        if (this._duration > 0) {
            this.updateFrame();
        }
    }
};

//Picking the image
Sprite_ProcessBar.prototype.updateFrame = function() {
    var w = 48;
    var h = 48;
    var sx = this.frameIndex() * w;
    var sy = (this._balloonId - 1) * h;
    this.setFrame(sx, sy, w, h);
};

Sprite_ProcessBar.prototype.frameIndex = function() {
    var index = this._duration / this._speed;
    if (Math.floor(index) > 7) {
        return 0;
    }
    return 7 - Math.max(Math.floor(index), 0);
};

Sprite_ProcessBar.prototype.isPlaying = function() {
    return this._duration > 0;
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

//======================================================================================================================
//
// CORE修改
//
//======================================================================================================================
//刷新作物图像
var _FS_SM_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function () {
    _FS_SM_start.call(this);
    _friendFarmSystem.currentSceneMap = this;
    Object.defineProperty(_friendFarmSystem, 'currentSceneMap', {
        enumerable: false,
        writable: true
    });
    _friendFarmSystem.setup($gameMap._mapId);
};

var _FS_GP_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function () {
    if ($gamePlayer.isProcessBarPlaying()) {
        return false;
    }
    return _FS_GP_canMove.call(this);
};

//读条图像

//======================================================================================================================
// Game_CharacterBase
//======================================================================================================================
var _FS_GCB_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function () {
    _FS_GCB_initMembers.call(this);
    this._processBar = 0;
    this._durationInSec = 0;
};

Game_CharacterBase.prototype.setProcessBar = function (durationInSec) {
    this._durationInSec = durationInSec;
    this._processBar = 1;
};

Game_CharacterBase.prototype.startProcessBar = function () {
    this._processBar = 0;
    this._durationInSec = 0;
    this._processBarPlaying = true;
};

Game_CharacterBase.prototype.isProcessBarPlaying = function () {
    return this._processBar > 0 || this._processBarPlaying;
};

Game_CharacterBase.prototype.endProcessBar = function () {
    this._processBar = 0;
    this._durationInSec = 0;
    this._processBarPlaying = false;
};

//======================================================================================================================
// Sprite_Character
//======================================================================================================================
var _FS_SC_setupBalloon = Sprite_Character.prototype.setupBalloon;
Sprite_Character.prototype.setupBalloon = function () {
    _FS_SC_setupBalloon.call(this);
    if (this._character._processBar > 0) {
        this.startProcessBar();
        this._character.startProcessBar();
    }
};

Sprite_Character.prototype.startProcessBar = function () {
    if (!this._processBarSprite) {
        this._processBarSprite = new Sprite_ProcessBar();
    }
    this._processBarSprite.setup(this._character._durationInSec);
    this.parent.addChild(this._processBarSprite);
};

var _FS_SC_updateBalloon = Sprite_Character.prototype.updateBalloon;
Sprite_Character.prototype.updateBalloon = function () {
    _FS_SC_updateBalloon.call(this);
    this.updateProcessBar();
};

Sprite_Character.prototype.updateProcessBar = function () {
    if (this._processBarSprite) {
        this._processBarSprite.x = this.x;
        this._processBarSprite.y = this.y - this.height;
        if (!this._processBarSprite.isPlaying()) this.endProcessBar();
    }
};

Sprite_Character.prototype.endProcessBar = function () {
    if (this._processBarSprite) {
        this.parent.removeChild(this._processBarSprite);
        this._processBarSprite = null;
        this._character.endProcessBar();
    }
};

Sprite_Character.prototype.isProcessBarPlaying = function () {
    return !!this._processBarSprite;
};