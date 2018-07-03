import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { MixinSplitBasic, ListHelpers } from '../../core';
import { MixinBase, MixinTranslations } from '../../utils/mixins';

@IonicPage()
@Component({
	selector    : 'page-items-report',
	templateUrl : 'items-report.html',
})
export class ItemsReportPage extends MixinSplitBasic(MixinTranslations(MixinBase)) {

	ListHelpers = ListHelpers;

	rootPage   = 'SplitsPage';

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'ITEMS_REPORT_PAGE']);
		this.splitInit();
	}

	translationsLoadedCallback() {}
	splitLoadedCallback() {}

	get math() { return this.split.math }

	splitParamsRead() {
		if (!super.splitParamsRead()) return false;
		if (!this.math) return false;
		return true;
	}

}
