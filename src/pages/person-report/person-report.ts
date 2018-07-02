import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IPersonReadonly, IMathAdvancedFinancerItem, ListHelpers } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-person-report',
	templateUrl : 'person-report.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class PersonReportPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['FINANCER_REPORT_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get math() { return this.split.math }
	get personMath() { return this.split.math.advanced.financerMap[this.person.id] }
	ListHelpers = ListHelpers;

	person: IPersonReadonly;

	readParams() {
		if (!super.readParams()) return false;
		if (!this.math) return false;
		this.person = this.navParams.get('PARAM_PERSON') || null;
		if (!this.person) return false;
		return true;
	}

	getSharedBy(itemMath: IMathAdvancedFinancerItem): string {
		let persons = itemMath.sharedByUs
			.concat(itemMath.sharedByOthers)
			.map(it => this.split.personList.personsMap[it])
			.filter(it => !!it);
		return ListHelpers.names(persons, this.split.personList, itemMath.sharedByUs.length);
	}

}
