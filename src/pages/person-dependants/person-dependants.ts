import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IPersonAssignment, IPersonReadonly, Split, SplitStage, SplitType } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-person-dependants',
	templateUrl : 'person-dependants.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class PersonDependantsPage extends BasePage {

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

	person     : IPersonReadonly;
	options    : IPersonAssignment[];
	fnOnChange : Function;

	readParams() {
		if (!super.readParams()) return false;
		this.person     = this.navParams.get('PARAM_PERSON');
		this.options    = this.navParams.get('PARAM_OPTIONS');
		this.fnOnChange = this.navParams.get('PARAM_ON_CHANGE');
		if (!this.person || !this.options) return false;
		return true;
	}

	async close() {
		let isChanged = false;
		this.options.forEach(it => {
			if (it.checked !== it.wasChecked) {
				this.split.personMarkDependant(this.person, it.person, it.checked);
			}
		})
		if (isChanged && this.fnOnChange) this.fnOnChange();
		this.navCtrl.pop();
	}

}
