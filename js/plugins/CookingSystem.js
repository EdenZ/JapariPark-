/*:
 * @plugindesc Cooking System
 * @author
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 */
//======================================================================================================================
// 常数和参数
//======================================================================================================================



//======================================================================================================================
// Cooking核心
//======================================================================================================================
function FriendCookingSystem () {
    throw new Error('This is a static class');
}
FriendCookingSystem._dataLoad = false;

FriendCookingSystem.isDataLoaded = function () {
    return this._dataLoad;
};

FriendCookingSystem.onCooking = function (foodName) {
    if (!this.onPrepareCooking(foodName)) {
        $gamePlayer.requestBalloon(7);
        return;
    }
    $gameParty.gainItem($dataItems[FriendCore._dataFood[foodName]._itemId], 1);
    $gamePlayer.requestBalloon(3);
};

FriendCookingSystem.onPrepareCooking = function (foodName) {
    var receipt = FriendCore._dataFood[foodName]._receipt;
    for (var i = 0; i < receipt.length; i++) {
        if (!this.checkItems(receipt[i])) {
            return false;
        }
    }
    for (var n = 0; n < receipt.length; n++) {
        $gameParty.gainItem($dataItems[receipt[n].itemId], -receipt[n].amount);
    }
    return true;
};

FriendCookingSystem.checkItems = function (receiptItem) {
    return $gameParty.numItems($dataItems[receiptItem.itemId]) >= receiptItem.amount;
};

FriendCookingSystem.onEventCall = function (caller) {
    var choices = [];
    for (var key in FriendCore._dataFood) {
        choices.push(key);
    }
    choices.push('取消');
    $gameMessage.setChoices(choices, 0, choices.length - 1);
    $gameMessage.setChoiceCallback(function (choice) {
        if (choice !== choices.length - 1) {
            this.onCooking(choices[choice]);
        }
    }.bind(this))
};

//======================================================================================================================
// 烹饪数据
//======================================================================================================================
function FoodInfo(name, receipt, hpGain, mpGain, itemId) {
    this._name = name;
    this._receipt = receipt;
    this._hpGain = hpGain;
    this._mpGain = mpGain;
    this._itemId = itemId;
}