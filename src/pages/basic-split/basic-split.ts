import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, Split, SplitStage, SplitType } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-basic-split',
	templateUrl : 'basic-split.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class BasicSplitPage extends BasePage {

	shadowSplit: Split;

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
		this.onLoad.subscribe(value => value && this._cloneToShadow());
	}

	get backButtonHandler() { return () => this.close() }
	isDirty() { return this.shadowSplit && this.shadowSplit.isDirty }
	get splitType() { return SplitType.BASIC }
	get splitStage() { return SplitStage.BASIC }

	ionViewWillEnter() {
		this.onLoad.subscribe(value => value && this._cloneToShadow());
	}

	_cloneToShadow() {
		this.shadowSplit = Split.fromJSON(this.split.toJSON());
		if (this.split.isDirty) this.shadowSplit.markDirty();
	}
	_cloneFromShadow() {
		this.split.setBillAmount(this.shadowSplit.billAmount);
		this.split.setExtras(this.shadowSplit.extras);
		this.split.setNumPersons(this.shadowSplit.personList.numPersons, this.nextNameGenerator('Person #'));
		this.split.type  = this.shadowSplit.type;
		this.split.stage = this.shadowSplit.stage;
	}

	get billAmount() { return this.shadowSplit.billAmount }
	get extras() { return this.shadowSplit.extras }
	get grandTotal() { return this.billAmount + this.extras }
	get numPersons() { return this.shadowSplit.personList.numPersons }
	get costPerHead() { return this.numPersons > 0 ? this.grandTotal / this.numPersons : 'N/A' }

	set billAmount(value) {
		this.shadowSplit.setBillAmount(value);
	}

	set extras(value) {
		this.shadowSplit.setExtras(value);
	}

	set numPersons(value) {
		this.shadowSplit.setNumPersons(value, this.nextNameGenerator('Person #'));
	}


	async save() {
		this._cloneFromShadow();
		await super.save();
	}
	nextNameGenerator(prefix: string) {
		return (() => {
			let counter = 0;
			return () => `${prefix}${++counter}`;
		})();
	}

	onClickTrack() {
		if (this.grandTotal === 0) return this.presentToast({ message: this.translate('BASIC_SPLIT_PAGE.ERR_GRAND_TOTAL'), duration: 3000 });
		if (this.numPersons === 0) return this.presentToast({ message: this.translate('BASIC_SPLIT_PAGE.ERR_NUM_PERSONS'), duration: 3000 });
		this._cloneFromShadow();
		this.split.updateMath();
		this.pushPage('ReportPage', this.makeParams());
	}

	onClickSwitch() {
		this._cloneFromShadow();
		let isDirty = this.split.isDirty;
		this.split.type = SplitType.ADVANCED;
		if (!isDirty) this.split.markClean();
		this.navCtrl.setPages([{ page: 'PersonsPage', params: this.makeParams() }], { animate: true, direction: 'forward' });
	}

}
