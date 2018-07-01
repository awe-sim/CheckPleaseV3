import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IMathAdvancedFinancer, IMathBasicFinancer, IPersonAssignment, IPersonReadonly, ListHelpers, SplitStage, SplitType, ValidationHelpers } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-report',
	templateUrl : 'report.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class ReportPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['REPORT_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get math() { return this.split.math }
	ListHelpers = ListHelpers;
	SplitType   = SplitType;

	readParams() {
		if (!super.readParams()) return false;
		if (!this.math) return false;
		return true;
	}
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
		this.presentActions({
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
		buttons.push(this.ACTION_BUTTONS.SHOW_CALCULATIONS.onBeforeDismiss(() => this.showPersonCalculations(person, personMath)));
		this.presentActions({
			title   : this.translate('REPORT_PAGE.ACTION_TITLE', { name: person.name }),
			buttons : buttons,
		})
	}

	async returnChange(person: IPersonReadonly, personMath: IMathBasicFinancer|IMathAdvancedFinancer) {
		let maxValue = Math.min(this.math.change, personMath.change);
		let data = {
			name      : person.name,
			changeDue : personMath.change.toFixed(2).replace('.00',''),
			maxChange : maxValue.toFixed(2).replace('.00',''),
			change    : this.math.change.toFixed(2).replace('.00',''),
		}
		await this.presentAlert({
			title   : this.translate('REPORT_PAGE.RETURN_CHANGE_TITLE', data),
			message : this.translate('REPORT_PAGE.RETURN_CHANGE_MESSAGE', data),
			inputs  : [{ type: 'number', name: 'amount', placeholder: this.translate('REPORT_PAGE.RETURN_CHANGE_PLACEHOLDER', data), value: data.maxChange }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RETURN_CHANGE.onBeforeDismiss(async(data) => {
					let amount = +data.amount;
					if (!ValidationHelpers.isZeroOrPositive(amount, false)) {
						this.presentToast({ message: this.translate('REPORT_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
						return false;
					}
					if (amount > personMath.change) {
						this.presentToast({ message: await this.loadTranslations('REPORT_PAGE.ERR_UNFAIR_CHANGE', { name: person.name, amount: personMath.change.toFixed(2).replace('.00','') }), duration: 3000 });
						return false;
					}
					if (amount > maxValue) {
						this.presentToast({ message: this.translate('REPORT_PAGE.ERR_INSUFFICIENT_CHANGE'), duration: 3000 });
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
			amountPooled : personMath.amountPooled.toFixed(2).replace('.00',''),
			total        : personMath.grandTotal.toFixed(2).replace('.00',''),
		}
		await this.presentAlert({
			title   : this.translate('REPORT_PAGE.POOL_AMOUNT_TITLE', data),
			message : this.translate('REPORT_PAGE.POOL_AMOUNT_MESSAGE', data),
			inputs  : [{ type: 'number', name: 'amount', placeholder: this.translate('REPORT_PAGE.POOL_AMOUNT_PLACEHOLDER', data), value: person.amountPooled ? data.amountPooled : '' }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.POOL_AMOUNT.onBeforeDismiss(data => {
					let amount = +data.amount;
					if (!ValidationHelpers.isZeroOrPositive(amount, false)) {
						this.presentToast({ message: this.translate('REPORT_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
						return false;
					}
					if (this.split.personSetPooledAmount(person, amount)) {
						this.split.updateMath();
					}
				})
			]
		})
	}
	async markDependants(person: IPersonReadonly, options: IPersonAssignment[]) {
		this.pushPage('PersonDependantsPage', this.makeParams({
			PARAM_PERSON    : person,
			PARAM_OPTIONS   : options,
			PARAM_ON_CHANGE : () => {
				this.split.updateMath();
			}
		}))
	}
	async rename(person: IPersonReadonly) {
		let data = { name: person.name };
		await this.presentAlert({
			title   : this.translate('REPORT_PAGE.RENAME_TITLE', data),
			message : this.translate('REPORT_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('REPORT_PAGE.RENAME_PLACEHOLDER', data) }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(data => {
					let newName = data.name.trim();
					let oldName = person.name;
					if (!newName) {
						this.presentToast({ message: this.translate('REPORT_PAGE.ERR_BLANK_NAME'), duration: 3000 });
						return false;
					}
					if (newName !== oldName && this.split.personList.hasName(newName)) {
						this.presentToast({ message: this.translate('REPORT_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
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

	async showPersonCalculations(person: IPersonReadonly, personMath: IMathAdvancedFinancer) {}

}
