import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { MixinSplitBasic, IPersonAssignment, IPersonReadonly } from '../../core';
import { MixinBase, MixinTranslations } from '../../utils/mixins';


@IonicPage()
@Component({
	selector    : 'page-person-dependants',
	templateUrl : 'person-dependants.html',
})
export class PersonDependantsPage extends MixinSplitBasic(MixinTranslations(MixinBase)) {

	rootPage   = 'SplitsPage';
	storageKey = '_entries';

	person     : IPersonReadonly;
	options    : IPersonAssignment[];
	fnOnChange : Function;

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'PERSON_DEPENDANTS_PAGE']);
		this.splitInit();
	}

	translationsLoadedCallback() {}
	splitParamsRead() {
		if (!super.splitParamsRead()) return false;
		this.person     = this.navParams.get('PARAM_PERSON');
		this.options    = this.navParams.get('PARAM_OPTIONS');
		this.fnOnChange = this.navParams.get('PARAM_ON_CHANGE');
		if (!this.person || !this.options) return false;
		return true;
	}
	splitLoadedCallback() {}

	close() {
		let isChanged = false;
		this.options.forEach(it => {
			if (it.checked !== it.wasChecked) {
				this.split.personMarkDependant(this.person, it.person, it.checked);
				isChanged = true;
			}
		})
		if (isChanged && this.fnOnChange) this.fnOnChange();
		this.navCtrl.pop();
	}

}
