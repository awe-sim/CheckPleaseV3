import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage, IPersonAssignment, IPersonReadonly, ListHelpers, SplitStage, SplitType } from '../../core';

@IonicPage()
@Component({
	selector    : 'page-persons',
	templateUrl : 'persons.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class PersonsPage extends BasePage {

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['PERSONS_PAGE']);
		this.onError.subscribe(value => value && this.popToRoot(false));
	}

	get backButtonHandler() { return () => this.close() }
	get splitType() { return SplitType.ADVANCED }
	get splitStage() { return SplitStage.PERSONS }

	ListHelpers = ListHelpers;

	async showActions(person: IPersonReadonly) {
		let buttons = [];
		buttons.push(this.ACTION_BUTTONS.RENAME.onBeforeDismiss(() => this.renamePerson(person)));
		let options = this.split.personList.getPossibleDependantsFor(person);
		if (options.length !== 0) {
			buttons.push(this.ACTION_BUTTONS.DEPENDANTS.onBeforeDismiss(() => this.personDependants(person, options)));
		}
		buttons.push(this.ACTION_BUTTONS.DELETE.onBeforeDismiss(() => this.removePerson(person)));
		this.presentActions({
			title   : this.translate('PERSONS_PAGE.ACTION_TITLE', { name: person.name }),
			buttons : buttons,
		})
	}

	async addPerson() {
		let ret = await this.presentAlert({
			title   : this.translate('PERSONS_PAGE.ADD_TITLE'),
			message : this.translate('PERSONS_PAGE.ADD_MESSAGE'),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('PERSONS_PAGE.ADD_PLACEHOLDER') }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.ADD
					.onBeforeDismiss(data => this.addPersonBeforeDismiss(data)),
				this.ALERT_BUTTONS.ADD_ANOTHER
					.onBeforeDismiss(data => this.addPersonBeforeDismiss(data)),
			]
		})
		switch(ret.button) {
			case this.ALERT_BUTTONS.ADD:
			case this.ALERT_BUTTONS.ADD_ANOTHER:
				this.split.personAdd(ret.data.name.trim());
				break;
		}
		if (ret.button === this.ALERT_BUTTONS.ADD_ANOTHER) this.addPerson();
	}
	addPersonBeforeDismiss(data) {
		let name = data.name.trim();
		if (!name) {
			this.presentToast({ message: this.translate('PERSONS_PAGE.ERR_BLANK_NAME'), duration: 3000 });
			return false;
		}
		if (this.split.personList.hasName(name)) {
			this.presentToast({ message: this.translate('PERSONS_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
			return false;
		}
	}

	renamePerson(person: IPersonReadonly) {
		let data = { name: person.name };
		this.presentAlert({
			title   : this.translate('PERSONS_PAGE.RENAME_TITLE', data),
			message : this.translate('PERSONS_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('PERSONS_PAGE.RENAME_PLACEHOLDER', data), value: person.name }],
			buttons : [
				this.ALERT_BUTTONS.CANCEL,
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(data => {
					let newName = data.name.trim();
					if (!newName) {
						this.presentToast({ message: this.translate('PERSONS_PAGE.ERR_BLANK_NAME'), duration: 3000 });
						return false;
					}
					if (newName !== person.name && this.split.personList.hasName(newName)) {
						this.presentToast({ message: this.translate('PERSONS_PAGE.ERR_DUPLICATE_NAME'), duration: 3000 });
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
		this.presentAlert({
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

	async personDependants(person: IPersonReadonly, options: IPersonAssignment[]) {
		this.pushPage('PersonDependantsPage', this.makeParams({
			PARAM_PERSON    : person,
			PARAM_OPTIONS   : options,
		}));
	}

	async nextPage() {
		if (this.split.personList.numPersons === 0) {
			this.presentToast({ message: this.translate('PERSONS_PAGE.ERR_NEXT_PAGE'), duration: 3000 });
			return;
		}
		this.pushPage('ItemsPage', this.makeParams());
	}


}
