import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ToastCtrl } from '../../utils';
import { MixinSplitBasic, MixinSplitSave, IPersonAssignment, IPersonReadonly, ListHelpers, SplitStage, SplitType } from '../../core';
import { MixinBase, MixinTranslations, MixinBackButtonHandler, MixinActions, MixinAlert, MixinToast } from '../../utils/mixins';

@IonicPage()
@Component({
	selector    : 'page-persons',
	templateUrl : 'persons.html',
	providers   : [ ActionCtrl, AlertCtrl, ToastCtrl ],
})
export class PersonsPage extends MixinSplitSave(MixinSplitBasic(MixinToast(MixinAlert(MixinActions(MixinBackButtonHandler(MixinTranslations(MixinBase))))))) {

	ListHelpers = ListHelpers;

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
		this.translationsInit(['BASE_PAGE', 'PERSONS_PAGE']);
		this.splitInit();
	}

	backButtonHandler() { return () => this.close() }
	translationsLoadedCallback() {
		this.actionButtonsLoad();
		this.alertButtonsLoad();
	}
	splitLoadedCallback() {}

	get splitType() { return SplitType.ADVANCED }
	get splitStage() { return SplitStage.PERSONS }

	showActions(person: IPersonReadonly) {
		let buttons = [];
		buttons.push(this.ACTION_BUTTONS.RENAME.onBeforeDismiss(() => this.renamePerson(person)));
		let options = this.split.personList.getPossibleDependantsFor(person);
		if (options.length !== 0) {
			buttons.push(this.ACTION_BUTTONS.DEPENDANTS.onBeforeDismiss(() => this.personDependants(person, options)));
		}
		buttons.push(this.ACTION_BUTTONS.DELETE.onBeforeDismiss(() => this.removePerson(person)));
		this.actions({
			title   : this.translate('PERSONS_PAGE.ACTION_TITLE', { name: person.name }),
			buttons : buttons,
		})
	}

	async addPerson() {
		let ret = await this.alert({
			title   : this.translate('PERSONS_PAGE.ADD_TITLE'),
			message : this.translate('PERSONS_PAGE.ADD_MESSAGE'),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('PERSONS_PAGE.ADD_PLACEHOLDER') }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.ADD
					.onBeforeDismiss(data => this.addPersonBeforeDismiss(data)),
				this.ALERT_BUTTONS.ADD_ANOTHER
					.onBeforeDismiss(data => this.addPersonBeforeDismiss(data)),
			],
			resolveAfterDismiss: true,
		})
		console.log(JSON.stringify(ret));
		switch(ret.button) {
			case this.ALERT_BUTTONS.ADD:
			case this.ALERT_BUTTONS.ADD_ANOTHER:
				this.split.personAdd(ret.data.name.trim());
				this.split.personsSort();
				break;
		}
		if (ret.button === this.ALERT_BUTTONS.ADD_ANOTHER) this.addPerson();
	}
	addPersonBeforeDismiss(data) {
		let name = data.name.trim();
		if (!name) {
			this.toast({ message: this.translate('PERSONS_PAGE.ERR_BLANK_NAME'), duration: 3000 });
			return false;
		}
		if (this.split.personList.hasName(name)) {
			this.toast({ message: this.translate('PERSONS_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
			return false;
		}
	}

	async renamePerson(person: IPersonReadonly) {
		let data = { name: person.name };
		await this.alert({
			title   : this.translate('PERSONS_PAGE.RENAME_TITLE', data),
			message : this.translate('PERSONS_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('PERSONS_PAGE.RENAME_PLACEHOLDER', data), value: person.name }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(data => {
					let newName = data.name.trim();
					if (!newName) {
						this.toast({ message: this.translate('PERSONS_PAGE.ERR_BLANK_NAME'), duration: 3000 });
						return false;
					}
					if (newName !== person.name && this.split.personList.hasName(newName)) {
						this.toast({ message: this.translate('PERSONS_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
						return false;
					}
					if (this.split.personSetName(person, newName)) {
						this.split.personsSort();
					}
				})
			]
		})
	}
	async removePerson(person: IPersonReadonly) {
		let data = { name: person.name };
		await this.alert({
			title   : this.translate('PERSONS_PAGE.REMOVE_TITLE', data),
			message : this.translate('PERSONS_PAGE.REMOVE_MESSAGE', data),
			buttons : [
				this.ALERT_BUTTONS.DELETE.onAfterDismiss(data => {
					if (this.split.personRemove(person)) {
						this.split.personsSort();
					}
				}),
				this.ALERT_BUTTONS.CANCEL,
			]
		})
	}

	personDependants(person: IPersonReadonly, options: IPersonAssignment[]) {
		this.pushPage('PersonDependantsPage', this.splitParamsMake({
			PARAM_PERSON    : person,
			PARAM_OPTIONS   : options,
		}));
	}

	nextPage() {
		if (this.split.personList.numPersons === 0) {
			this.toast({ message: this.translate('PERSONS_PAGE.ERR_NEXT_PAGE'), duration: 3000 });
			return;
		}
		this.pushPage('ItemsPage', this.splitParamsMake());
	}


}
