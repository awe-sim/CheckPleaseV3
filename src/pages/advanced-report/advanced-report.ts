import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, SplitStage, SplitType, IPersonReadonly, ListHelpers, IPersonAssignment, ValidationHelpers, IMathBasicFinancer } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-advanced-report',
	templateUrl : 'advanced-report.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class AdvancedReportPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['ADVANCED_REPORT_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get math() { return this.split.math }
	ListHelpers = ListHelpers;

	readParams() {
		if (!super.readParams()) return false;
		if (!this.math) return false;
		return true;
	}
	get splitType() { return SplitType.ADVANCED }
	get splitStage() { return this.split.stage = SplitStage.PERSONS | SplitStage.ITEMS | SplitStage.EXTRAS | SplitStage.REPORT | ((this.math.amountPooled >= this.math.grandTotal) ? SplitStage.COMPLETE : 0) }

	showActions(person: IPersonReadonly, personMath: IMathBasicFinancer) {
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
			title   : this.translate('ADVANCED_REPORT_PAGE.ACTION_TITLE', { name: person.name }),
			buttons : buttons,
		})
	}

	async returnChange(person: IPersonReadonly, personMath: IMathBasicFinancer) {
		let maxValue = Math.min(this.math.change, personMath.change);
		let data = {
			name      : person.name,
			changeDue : personMath.change.toFixed(2).replace('.00',''),
			maxChange : maxValue.toFixed(2).replace('.00',''),
			change    : this.math.change.toFixed(2).replace('.00',''),
		}
		await this.presentAlert({
			title   : this.translate('ADVANCED_REPORT_PAGE.RETURN_CHANGE_TITLE', data),
			message : this.translate('ADVANCED_REPORT_PAGE.RETURN_CHANGE_MESSAGE', data),
			inputs  : [{ type: 'number', name: 'amount', placeholder: this.translate('ADVANCED_REPORT_PAGE.RETURN_CHANGE_PLACEHOLDER', data), value: data.maxChange }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RETURN_CHANGE.onBeforeDismiss(async(data) => {
					let amount = +data.amount;
					if (!ValidationHelpers.isZeroOrPositive(amount, false)) {
						this.presentToast({ message: this.translate('ADVANCED_REPORT_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
						return false;
					}
					if (amount > personMath.change) {
						this.presentToast({ message: await this.loadTranslations('ADVANCED_REPORT_PAGE.ERR_UNFAIR_CHANGE', { name: person.name, amount: personMath.change.toFixed(2).replace('.00','') }), duration: 3000 });
						return false;
					}
					if (amount > maxValue) {
						this.presentToast({ message: this.translate('ADVANCED_REPORT_PAGE.ERR_INSUFFICIENT_CHANGE'), duration: 3000 });
						return false;
					}
					if (this.split.personSetPooledAmount(person, person.amountPooled - amount)) {
						this.split.updateMath();
					}
				})
			]
		})
	}
	async poolAmount(person: IPersonReadonly, personMath: IMathBasicFinancer) {
		let data = {
			name         : person.name,
			amountPooled : personMath.amountPooled.toFixed(2).replace('.00',''),
			total        : personMath.grandTotal.toFixed(2).replace('.00',''),
		}
		await this.presentAlert({
			title   : this.translate('ADVANCED_REPORT_PAGE.POOL_AMOUNT_TITLE', data),
			message : this.translate('ADVANCED_REPORT_PAGE.POOL_AMOUNT_MESSAGE', data),
			inputs  : [{ type: 'number', name: 'amount', placeholder: this.translate('ADVANCED_REPORT_PAGE.POOL_AMOUNT_PLACEHOLDER', data), value: person.amountPooled ? data.amountPooled : '' }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.POOL_AMOUNT.onBeforeDismiss(data => {
					let amount = +data.amount;
					if (!ValidationHelpers.isZeroOrPositive(amount, false)) {
						this.presentToast({ message: this.translate('ADVANCED_REPORT_PAGE.ERR_INVALID_AMOUNT'), duration: 3000 });
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
			title   : this.translate('ADVANCED_REPORT_PAGE.RENAME_TITLE', data),
			message : this.translate('ADVANCED_REPORT_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('ADVANCED_REPORT_PAGE.RENAME_PLACEHOLDER', data) }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(data => {
					let newName = data.name.trim();
					let oldName = person.name;
					if (!newName) {
						this.presentToast({ message: this.translate('ADVANCED_REPORT_PAGE.ERR_BLANK_NAME'), duration: 3000 });
						return false;
					}
					if (newName !== oldName && this.split.personList.hasName(newName)) {
						this.presentToast({ message: this.translate('ADVANCED_REPORT_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
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

}
