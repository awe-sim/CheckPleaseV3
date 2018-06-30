import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IItemReadonly, IPersonAssignment } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-item-orders',
	templateUrl : 'item-orders.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class ItemOrdersPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['PERSON_DEPENDANTS_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	item       : IItemReadonly;
	options    : IPersonAssignment[];
	fnOnChange : Function;

	readParams() {
		if (!super.readParams()) return false;
		this.item       = this.navParams.get('PARAM_ITEM');
		this.options    = this.navParams.get('PARAM_OPTIONS');
		this.fnOnChange = this.navParams.get('PARAM_ON_CHANGE');
		if (!this.item || !this.options) return false;
		return true;
	}

	selectAll() {
		this.options.forEach(it => it.checked = true);
	}
	selectNone() {
		this.options.forEach(it => it.checked = false);
	}

	async close() {
		let isChanged = false;
		this.options.forEach(it => {
			if (it.checked !== it.wasChecked) {
				this.split.orderMark(it.person, this.item, it.checked);
				isChanged = true;
			}
		})
		if (isChanged && this.fnOnChange) this.fnOnChange();
		this.navCtrl.pop();
	}

}
