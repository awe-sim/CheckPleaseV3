import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { MixinSplitBasic, IItemReadonly, IPersonAssignment } from '../../core';
import { MixinBase, MixinTranslations } from '../../utils/mixins';

@IonicPage()
@Component({
	selector    : 'page-item-orders',
	templateUrl : 'item-orders.html',
})
export class ItemOrdersPage extends MixinSplitBasic(MixinTranslations(MixinBase)) {

	rootPage   = 'SplitsPage';

	item       : IItemReadonly;
	options    : IPersonAssignment[];
	fnOnChange : Function;

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'PERSONS_PAGE']);
		this.splitInit();
	}

	translationsLoadedCallback() {}
	splitParamsRead() {
		if (!super.splitParamsRead()) return false;
		this.item       = this.navParams.get('PARAM_ITEM');
		this.options    = this.navParams.get('PARAM_OPTIONS');
		this.fnOnChange = this.navParams.get('PARAM_ON_CHANGE');
		if (!this.item || !this.options) return false;
		return true;
	}
	splitLoadedCallback() {}

	selectAll() {
		this.options.forEach(it => it.checked = true);
	}
	selectNone() {
		this.options.forEach(it => it.checked = false);
	}

	close() {
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
