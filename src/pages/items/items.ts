import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IItemReadonly, ListHelpers, SplitStage, SplitType, ValidationHelpers } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-items',
	templateUrl : 'items.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class ItemsPage extends BasePage {

	constructor(
		navCtrl      : NavController,
		navParams    : NavParams,
		platform     : Platform,
		actionCtrl   : ActionCtrl,
		alertCtrl    : AlertCtrl,
		modalCtrl    : ModalCtrl,
		toastCtrl    : ToastCtrl,
		translateSvc : TranslateService,
	) {
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['ITEMS_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get splitType() { return SplitType.ADVANCED }
	get splitStage() { return SplitStage.PERSONS | SplitStage.ITEMS }

	ListHelpers = ListHelpers;

	showActions(item: IItemReadonly) {
		this.presentActions({
			title   : this.translate('ITEMS_PAGE.ACTION_TITLE', { name: item.name }),
			buttons : [
				this.ACTION_BUTTONS.EDIT.onBeforeDismiss(() => this.editItem(item)),
				this.ACTION_BUTTONS.ORDERS.onBeforeDismiss(() => this.itemOrders(item)),
				this.ACTION_BUTTONS.DELETE.onBeforeDismiss(() => this.removeItem(item)),
			]
		})
	}

	async addItem() {
		let ret = await this.presentAlert({
			title   : this.translate('ITEMS_PAGE.ADD_TITLE'),
			message : this.translate('ITEMS_PAGE.ADD_MESSAGE'),
			inputs  : [
				{ type: 'text', name: 'name', placeholder: this.translate('ITEMS_PAGE.NAME_PLACEHOLDER') },
				{ type: 'number', name: 'amount', placeholder: this.translate('ITEMS_PAGE.AMOUNT_PLACEHOLDER') },
				{ type: 'number', name: 'quantity', placeholder: this.translate('ITEMS_PAGE.QUANTITY_PLACEHOLDER'), value: '1' },
			],
			buttons: [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.ADD
					.onBeforeDismiss(data => this.addItemBeforeDismiss(data)),
				this.ALERT_BUTTONS.ADD_ANOTHER
					.onBeforeDismiss(data => this.addItemBeforeDismiss(data)),
			]
		})
		switch(ret.button) {
			case this.ALERT_BUTTONS.ADD:
			case this.ALERT_BUTTONS.ADD_ANOTHER:
				let name     =  ret.data.name.trim();
				let amount   = +ret.data.amount;
				let quantity = +ret.data.quantity;
				this.split.itemAdd(name, amount, quantity);
				this.split.itemsSort();
				break;
		}
		if (ret.button === this.ALERT_BUTTONS.ADD_ANOTHER) this.addItem();
	}
	addItemBeforeDismiss(data) {
		let name     =  data.name.trim();
		let amount   = +data.amount;
		let quantity = +data.quantity;
		if (!name) {
			this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_BLANK_NAME'), duration: 3000 });
			return false;
		}
		if (!ValidationHelpers.isPositive(amount, false)) {
			this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
			return false;
		}
		if (!ValidationHelpers.isPositiveInteger(quantity, false)) {
			this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_INVALID_QUANTITY'), duration: 3000 });
			return false;
		}
	}

	editItem(item: IItemReadonly) {
		let data = { name: item.name };
		this.presentAlert({
			title   : this.translate('ITEMS_PAGE.EDIT_TITLE', data),
			message : this.translate('ITEMS_PAGE.EDIT_MESSAGE', data),
			inputs  : [
				{ type: 'text', name: 'name', placeholder: this.translate('ITEMS_PAGE.NAME_PLACEHOLDER'), value: item.name },
				{ type: 'number', name: 'amount', placeholder: this.translate('ITEMS_PAGE.AMOUNT_PLACEHOLDER'), value: item.amount.toFixed(2).replace('.00','') },
				{ type: 'number', name: 'quantity', placeholder: this.translate('ITEMS_PAGE.QUANTITY_PLACEHOLDER'), value: item.quantity.toString() },
			],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.SAVE.onBeforeDismiss(data => {
					let name     =  data.name.trim();
					let amount   = +data.amount;
					let quantity = +data.quantity;
					if (!name) {
						this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_BLANK_NAME'), duration: 3000 });
						return false;
					}
					if (!ValidationHelpers.isPositive(amount, false)) {
						this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
						return false;
					}
					if (!ValidationHelpers.isPositiveInteger(quantity, false)) {
						this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_INVALID_QUANTITY'), duration: 3000 });
						return false;
					}
					let isChanged = false;
					if (this.split.itemSetName(item, name)) isChanged = true;
					if (this.split.itemSetAmount(item, amount)) isChanged = true;
					if (this.split.itemSetQuantity(item, quantity)) isChanged = true;
					if (isChanged) {
						this.split.itemsSort();
					}
				})
			]
		})
	}

	async removeItem(item: IItemReadonly) {
		let data = { name: item.name };
		this.presentAlert({
			title   : this.translate('ITEMS_PAGE.REMOVE_TITLE', data),
			message : this.translate('ITEMS_PAGE.REMOVE_MESSAGE', data),
			buttons : [
				this.ALERT_BUTTONS.DELETE.onAfterDismiss(data => {
					if (this.split.itemRemove(item)) {
						this.split.itemsSort();
					}
				}),
				this.ALERT_BUTTONS.CANCEL,
			]
		})
	}

	async itemOrders(item: IItemReadonly) {
		let options = this.split.orders.getPossibleOrdersFor(item, this.split.personList);
		this.pushPage('ItemOrdersPage', this.makeParams({
			PARAM_ITEM      : item,
			PARAM_OPTIONS   : options,
		}));
	}

	async nextPage() {
		if (this.split.itemList.count === 0) {
			this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_NO_ITEMS'), duration: 3000 });
			return;
		}
		if (this.split.orders.getOrphanItems(this.split.itemList).length !== 0) {
			this.presentToast({ message: this.translate('ITEMS_PAGE.ERR_ORPHAN_ITEMS'), duration: 3000 });
			return;
		}
		this.pushPage('ExtrasPage', this.makeParams());
	}


}
