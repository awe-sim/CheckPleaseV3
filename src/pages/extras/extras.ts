import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { ActionCtrl, AlertCtrl, ToastCtrl } from '../../utils';
import { MixinSplitBasic, MixinSplitSave, SplitStage, SplitType } from '../../core';
import { MixinBase, MixinTranslations, MixinActions, MixinAlert, MixinToast } from '../../utils/mixins';

@IonicPage()
@Component({
  selector    : 'page-extras',
  templateUrl : 'extras.html',
	providers   : [ ActionCtrl, AlertCtrl, ToastCtrl ],
})
export class ExtrasPage extends MixinSplitSave(MixinSplitBasic(MixinToast(MixinAlert(MixinActions(MixinTranslations(MixinBase)))))) {

	rootPage   = 'SplitsPage';
	storageKey = '_entries';

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public actionCtrl   : ActionCtrl,
		public alertCtrl    : AlertCtrl,
		public toastCtrl    : ToastCtrl,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'EXTRAS_PAGE']);
		this.splitInit();
	}

	translationsLoadedCallback() {
		this.actionButtonsLoad();
		this.alertButtonsLoad();
	}
	splitLoadedCallback() {}

	get splitType() { return SplitType.ADVANCED }
	get splitStage() { return SplitStage.PERSONS | SplitStage.ITEMS | SplitStage.EXTRAS }

	get extras() { return this.split.extras }
	set extras(value) { this.split.setExtras(value) }

	nextPage() {
		this.split.updateMath();
		this.pushPage('ReportPage', this.splitParamsMake());
	}




}
