/*:
 * @plugindesc Cooking System
 * @author
 * @help
 *
 * @param debug
 * @desc true of false
 * @default false
 */

//物品数量
//amount = $gameParty.numItems($dataItems[itemID]);

//增加或减少物品(amount可以正负)
//$gameParty.gainItem($dataItems[itemID], amount);

function CookingSystem(){

}
var _CookingSystem = new CookingSystem();

/**
 *烹饪
 *@param type
 */
CookingSystem.cooking = function (type) {
    var foodType;
    switch (type) {
        //罗卜
        case this._foodMenu.carrotsala.name:
            foodType = this._foodMenu.carrotsala;
            break;

        //土豆
        case this._foodMenu.bakedpotato.name:
            foodType = this._foodMenu.bakedpotato;
            break;

        //黑加仑
        case this._foodMenu.blueberryjuice.name:
            foodType = this._foodMenu.blueberryjuice;
            break;

        case '取消':
            return;
    }
        return;
    }
    need = $gameParty.numItems($dataItems[foodType.needID]);
    if (need<foodType.amount) {
    	$gameMessage.add('食材不足');
        return;
    }
    $gameParty.loseItem($dataItems[foodType.needID], foodType.amount);
    $gamePlayer.setProcessBar(3);
    $gameParty.gainItem($dataItems[foodType.foodID], 1);

};

 /**
 * 选择窗口
 */
CookingSystem.MenuChoose = function () {
    var choices = [];
    for (var food in _foodMenu[]) {

        var obj = this._foodMenu[food];
            choices.push(obj.name);
    }

    choices.push('取消');

    $gameMessage.setChoices(choices, 0, choices.length - 1);
    $gameMessage.setChoiceCallback(function (choice) {
        CookingSystem.cooking(choices[choice]);
        }
    )
};

function foodMenu(name,foodID,gainhp,gainmp,needID,amount){
	this.name = name;
	this.foodID = foodID;
	this.gainhp = gainhp;
	this.gainmp = gainmp;
	this.needID = needID;
	this.amount = amount;
}

var _foodMenu =new foodMenu{};
var _foodMenu.carrotsala = new foodMenu('carrotsala',10,60,0,3,5);
var _foodMenu.bakedpotato = new foodMenu('bakedpotato',11,90,0,5,4);
var _foodMenu.blueberryjuice = new foodMenu('blueberryjuice',12,0,30,7,10);

