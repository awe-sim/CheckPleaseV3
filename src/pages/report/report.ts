import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ToastCtrl } from '../../utils';
import { MixinSplitBasic, MixinSplitSave, IMathAdvancedFinancer, IMathBasicFinancer, IPersonAssignment, IPersonReadonly, ListHelpers, SplitStage, SplitType, ValidationHelpers } from '../../core';
import { MixinBase, MixinTranslations, MixinBackButtonHandler, MixinActions, MixinAlert, MixinToast } from '../../utils/mixins';

@IonicPage()
@Component({
	selector    : 'page-report',
	templateUrl : 'report.html',
	providers   : [ ActionCtrl, AlertCtrl, ToastCtrl ],
})
export class ReportPage extends MixinSplitSave(MixinSplitBasic(MixinToast(MixinAlert(MixinActions(MixinBackButtonHandler(MixinTranslations(MixinBase))))))) {

	ListHelpers = ListHelpers;
	SplitType   = SplitType;

	rootPage   = 'SplitsPage';
	storageKey = '_entries';

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public platform     : Platform,
		public actionCtrl   : ActionCtrl,
		public alertCtrl    : AlertCtrl,
		public toastCtrl    : ToastCtrl,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'REPORT_PAGE']);
		this.splitInit();
	}

	get math() { return this.split.math }

	translationsLoadedCallback() {
		this.actionButtonsLoad();
		this.alertButtonsLoad();
	}
	splitParamsRead() {
		if (!super.splitParamsRead()) return false;
		if (!this.math) return false;
		return true;
	}
	splitLoadedCallback() {}

	get splitType() { return this.split.type }
	get splitStage() {
		let stage: SplitStage = 0;
		if (this.splitType === SplitType.BASIC) {
			stage = SplitStage.BASIC;
		}
		else {
			stage = SplitStage.PERSONS | SplitStage.ITEMS | SplitStage.EXTRAS;
		}
		stage |= SplitStage.REPORT;
		if (this.math.amountPooled >= this.math.grandTotal) {
			stage |= SplitStage.COMPLETE;
		}
		return stage;
	}

	showBasicActions(person: IPersonReadonly, personMath: IMathBasicFinancer) {
		let buttons = [];
		if (this.math.change > 0 && personMath.change > 0) {
			buttons.push(this.ACTION_BUTTONS.RETURN_CHANGE.onBeforeDismiss(() => this.returnChange(person, personMath)));
		}
		buttons.push(this.ACTION_BUTTONS.POOL_AMOUNT.onBeforeDismiss(() => this.poolAmount(person, personMath)));
		let options = this.split.personList.getPossibleDependantsFor(person);
		if (options.length !== 0) {
			buttons.push(this.ACTION_BUTTONS.DEPENDANTS.onBeforeDismiss(() => this.markDependants(person, options)));
		}
		buttons.push(this.ACTION_BUTTONS.RENAME.onBeforeDismiss(() => this.rename(person)));
		this.actions({
			title   : this.translate('REPORT_PAGE.ACTION_TITLE', { name: person.name }),
			buttons : buttons,
		})
	}

	showAdvancedActions(person: IPersonReadonly, personMath: IMathAdvancedFinancer) {
		let buttons = [];
		if (this.math.change > 0 && personMath.change > 0) {
			buttons.push(this.ACTION_BUTTONS.RETURN_CHANGE.onBeforeDismiss(() => this.returnChange(person, personMath)));
		}
		buttons.push(this.ACTION_BUTTONS.POOL_AMOUNT.onBeforeDismiss(() => this.poolAmount(person, personMath)));
		let options = this.split.personList.getPossibleDependantsFor(person);
		if (options.length !== 0) {
			buttons.push(this.ACTION_BUTTONS.DEPENDANTS.onBeforeDismiss(() => this.markDependants(person, options)));
		}
		buttons.push(this.ACTION_BUTTONS.RENAME.onBeforeDismiss(() => this.rename(person)));
		buttons.push(this.ACTION_BUTTONS.SHOW_CALCULATIONS.onBeforeDismiss(() => this.showPersonReport(person)));
		this.actions({
			title   : this.translate('REPORT_PAGE.ACTION_TITLE', { name: person.name }),
			buttons : buttons,
		})
	}

	showItemsReport() {
		this.pushPage('ItemsReportPage', this.splitParamsMake());
	}

	async returnChange(person: IPersonReadonly, personMath: IMathBasicFinancer|IMathAdvancedFinancer) {
		let maxValue = Math.min(this.math.change, personMath.change);
		let data = {
			name      : person.name,
			changeDue : personMath.change,
			maxChange : maxValue,
			change    : this.math.change,
		}
		await this.alert({
			title   : this.translate('REPORT_PAGE.RETURN_CHANGE_TITLE', data),
			message : this.translate('REPORT_PAGE.RETURN_CHANGE_MESSAGE', data),
			inputs  : [{ type: 'number', name: 'amount', placeholder: this.translate('REPORT_PAGE.RETURN_CHANGE_PLACEHOLDER', data) }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RETURN_CHANGE.onBeforeDismiss(async(data) => {
					let amount = +data.amount;
					if (!ValidationHelpers.isZeroOrPositive(amount, false)) {
						this.toast({ message: this.translate('REPORT_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
						return false;
					}
					if (amount > personMath.change) {
						this.toast({ message: await this.translationsLoad('REPORT_PAGE.ERR_UNFAIR_CHANGE', { name: person.name, amount: personMath.change.toFixed(2).replace('.00','') }), duration: 3000 });
						return false;
					}
					if (amount > maxValue) {
						this.toast({ message: this.translate('REPORT_PAGE.ERR_INSUFFICIENT_CHANGE'), duration: 3000 });
						return false;
					}
					if (this.split.personSetPooledAmount(person, person.amountPooled - amount)) {
						this.split.updateMath();
					}
				})
			]
		})
	}
	async poolAmount(person: IPersonReadonly, personMath: IMathBasicFinancer|IMathAdvancedFinancer) {
		let data = {
			name         : person.name,
			amountPooled : personMath.amountPooled,
			amountDue    : personMath.grandTotal,
		}
		await this.alert({
			title   : this.translate('REPORT_PAGE.POOL_AMOUNT_TITLE', data),
			message : this.translate('REPORT_PAGE.POOL_AMOUNT_MESSAGE', data),
			inputs  : [{ type: 'number', name: 'amount', placeholder: this.translate('REPORT_PAGE.POOL_AMOUNT_PLACEHOLDER', data), value: person.amountPooled ? data.amountPooled : '' }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.POOL_AMOUNT.onBeforeDismiss(data => {
					let amount = +data.amount;
					if (!ValidationHelpers.isZeroOrPositive(amount, false)) {
						this.toast({ message: this.translate('REPORT_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
						return false;
					}
					if (this.split.personSetPooledAmount(person, amount)) {
						this.split.updateMath();
					}
				})
			]
		})
	}
	markDependants(person: IPersonReadonly, options: IPersonAssignment[]) {
		this.pushPage('PersonDependantsPage', this.splitParamsMake({
			PARAM_PERSON    : person,
			PARAM_OPTIONS   : options,
			PARAM_ON_CHANGE : () => {
				this.split.updateMath();
			}
		}))
	}
	async rename(person: IPersonReadonly) {
		let data = { name: person.name };
		await this.alert({
			title   : this.translate('REPORT_PAGE.RENAME_TITLE', data),
			message : this.translate('REPORT_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('REPORT_PAGE.RENAME_PLACEHOLDER', data) }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(data => {
					let newName = data.name.trim();
					let oldName = person.name;
					if (!newName) {
						this.toast({ message: this.translate('REPORT_PAGE.ERR_BLANK_NAME'), duration: 3000 });
						return false;
					}
					if (newName !== oldName && this.split.personList.hasName(newName)) {
						this.toast({ message: this.translate('REPORT_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
						return false;
					}
					if (this.split.personSetName(person, newName)) {
						this.split.personsSort();
						this.split.updateMath();
					}
				})
			]
		})
	}

	showPersonReport(person: IPersonReadonly) {
		this.pushPage('PersonReportPage', this.splitParamsMake({ PARAM_PERSON: person}));
	}

}
