import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, SplitStage, SplitType } from '../../core';

@IonicPage()
@Component({
  selector    : 'page-extras',
  templateUrl : 'extras.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class ExtrasPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['BASIC_SPLIT_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get splitType() { return SplitType.ADVANCED }
	get splitStage() { return SplitStage.PERSONS | SplitStage.ITEMS | SplitStage.EXTRAS }

	get extras() { return this.split.extras }
	set extras(value) { this.split.setExtras(value) }

	nextPage() {
		this.pushPage('AdvancedReportPage', this.makeParams());
	}




}
