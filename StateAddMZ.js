/*=============================================================================
 StateAddMZ.js
----------------------------------------------------------------------------
 (C)2023 Kuchinashi
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2023/04/15 初版
----------------------------------------------------------------------------
 [github] https://github.com/Kuchinashi-W/Plugin/blob/main/StateAddMZ.js
=============================================================================*/

/*:
 * @plugindesc ステートターン数蓄積プラグイン
 * @target MZ
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author 梔子 (参考 トリアコンタン様のStateTurnKeep.jsプラグイン)
 *
 * @param outOfTargets
 * @text 対象外ステート
 * @desc ターン数蓄積の対象外となるステートです。ここで指定したステートは通常仕様通りに初期化されます。
 * @default []
 * @type state[]
 *
 * @help StateAddMZ.js
 *
 * ステートを重ね掛けしたとき、ターン数を初期化せず
 * 蓄積するように仕様変更致します。
 * また、メモ欄にメタタグを記入することにより、付与するステートのターン数を
 * スキルごと、アイテムごとに追加することができます。
 * 
 * アイテムやスキルのメモ欄に、
 * <addStateID:x>           x:ステートのID
 * <addStateExtraTurn:y>    y:追加する継続ターン数
 * と記述すると、ステートの継続ターン数を
 * 本来設定されているターン数 + 追加する継続ターン数
 * にすることができます。
 * 
 * これによりスキルやアイテムによってステートの継続ターンを
 * 自由に設定できるようになります。
 * 
 * 例:
 * RPGツクールのデータベースでステート4番の毒の継続ターン数を1ターンに設定する。
 * スキル『毒液』のステート付加に毒を付加を設定する。
 * スキルのメモ欄に以下のように記入する。
 * <addStateID:4>           毒ステートのID
 * <addStateExtraTurn:2>    2ターン追加
 * 毒液を使用すると毒ステートの継続ターン数が1 + 2で3ターンとなる。
 * 
 * ステートの残りターン数が分かるプラグインなど入れると分かりやすくなります。
 * 
 * このプラグインの利用にはベースプラグイン『PluginCommonBase.js』が必要です。
 * 『PluginCommonBase.js』は、RPGツクールMZのインストールフォルダ配下の
 * 以下のフォルダに格納されています。
 * dlc/BasicResources/plugins/official
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);
    if (!param.outOfTargets) {
        param.outOfTargets = [];
    }
    
    //スキル、アイテムのメタタグを取得用変数
    let addStateID = 0;
    let addStateExtraTurn = 0;


    const _Game_BattlerBase_resetStateCounts = Game_BattlerBase.prototype.resetStateCounts;
    Game_BattlerBase.prototype.resetStateCounts = function(stateId) {
        const prevTurn = this._stateTurns[stateId];
        _Game_BattlerBase_resetStateCounts.apply(this, arguments);
        if (prevTurn && !param.outOfTargets.includes(stateId)) {
            this._stateTurns[stateId] = prevTurn + this._stateTurns[stateId];
        }

        //メタタグで追加ターン指定があったら追加
        if(addStateID === stateId && addStateExtraTurn){
            this._stateTurns[stateId] += addStateExtraTurn;   
            addStateID = 0;
            addStateExtraTurn = 0;
        }
    };

    //ここでスキル、アイテムのメタタグを取得しておく。
    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        const item = this.item();
        if(item.meta.addStateID && item.meta.addStateExtraTurn){
            addStateID = Number(item.meta.addStateID);
            addStateExtraTurn = Number(item.meta.addStateExtraTurn);
        }
        _Game_Action_apply.call(this,target);

    };
})();
