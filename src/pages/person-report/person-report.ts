import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { MixinSplitBasic, IPersonReadonly, IMathAdvancedFinancerItem, ListHelpers } from '../../core';
import { MixinBase, MixinTranslations } from '../../utils/mixins';

@IonicPage()
@Component({
	selector    : 'page-person-report',
	templateUrl : 'person-report.html',
})
export class PersonReportPage extends MixinSplitBasic(MixinTranslations(MixinBase)) {

	ListHelpers = ListHelpers;

	rootPage   = 'SplitsPage';

	person: IPersonReadonly;

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'PERSON_REPORT_PAGE']);
		this.splitInit();
	}

	translationsLoadedCallback() {}
	splitLoadedCallback() {}

	get math() { return this.split.math }
	get personMath() { return this.split.math.advanced.financerMap[this.person.id] }

	splitParamsRead() {
		if (!super.splitParamsRead()) return false;
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
