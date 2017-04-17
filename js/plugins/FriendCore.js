/*:
 * @plugindesc Friend System Core
 * @author Eden
 * @help
 * @requiredAssets img/system/FriendSpriteSheet
 *
 * @param debug
 * @desc true of false
 * @default false
 */

//是否第一次启动游戏
var init_game_start = true;

function FriendCore() {
 throw new Error('This is a static class');
}
FriendCore._dataFood = {};

FriendCore.readFoodReceipt = function (str) {
    var receipt = [];
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
        var sublist = list[i].split(':');
        for (var n = 0; n < 2; n++) {
            sublist[n] = Number(sublist[n]);
        }
        var term = {};
        term['itemId'] = sublist[0];
        term['amount'] = sublist[1];
        receipt.push(term);
    }
    return receipt;
};

FriendCore.loadFoodItem = function () {
    if (!FriendCookingSystem.isDataLoaded()) {
        var dataLen = $dataItems.length;
        for (var i = 1; i < dataLen; i++) {
            var item = $dataItems[i];
            if (item.meta.item_type === '食物') {
                try {
                    this._dataFood[item.name] = new FoodInfo(item.name,
                        this.readFoodReceipt(item.meta.food_receipt),
                        Number(item.meta.hp_gain),
                        Number(item.meta.mp_gain),
                        item.id);
                } catch (e) {
                    console.log('WRONG DATA');
                }
            }
        }
        FriendCookingSystem._dataLoad = true;
    }
}

//======================================================================================================================
// 读取物品数据
//======================================================================================================================
var _FC_SM_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function () {
    _FC_SM_start.call(this);
    FriendCore.loadFoodItem();
};


//======================================================================================================================
// 存档
//======================================================================================================================
var _FC_DM_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function () {
    var contents = _FC_DM_makeSaveContents.call(this);
    contents.friendFarm   = _friendFarmSystem;
    contents.timeSystem   = _dayTimeSystem;
    return contents;
};

var _FC_DM_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function (contents) {
    _FC_DM_extractSaveContents.call(this, contents);
    _friendFarmSystem  = contents.friendFarm;
    _dayTimeSystem     = contents.timeSystem;
};