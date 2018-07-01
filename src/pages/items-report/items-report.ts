import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IMathAdvancedFinancer, IMathBasicFinancer, IPersonAssignment, IPersonReadonly, ListHelpers, SplitStage, SplitType, ValidationHelpers } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-items-report',
	templateUrl : 'items-report.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class ItemsReportPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['ITEMS_REPORT_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get math() { return this.split.math }
	ListHelpers = ListHelpers;

	readParams() {
		if (!super.readParams()) return false;
		if (!this.math) return false;
		return true;
	}

}
