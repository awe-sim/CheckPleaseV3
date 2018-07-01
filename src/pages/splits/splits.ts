import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { AlertCtrl, ActionCtrl, ModalCtrl, SettingsCtrl, ToastCtrl } from '../../utils';
import { BasePage, ISplitEntry, ListHelpers, Split, SplitStage, SplitType } from '../../core';

const DOUBLE_BACK_DURATION = 3000;

@IonicPage()
@Component({
	selector    : 'page-splits',
	templateUrl : 'splits.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class SplitsPage extends BasePage {

	constructor(
		navCtrl      : NavController,
		navParams    : NavParams,
		platform     : Platform,
		actionCtrl   : ActionCtrl,
		alertCtrl    : AlertCtrl,
		modalCtrl    : ModalCtrl,
		toastCtrl    : ToastCtrl,
		translateSvc : TranslateService,
		public settingsCtrl : SettingsCtrl,
	) {
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['SPLITS_PAGE']);
		this.onLoad.subscribe(value => value && this.loadList());
	}

	ionViewWillEnter() {
		this.onLoad.subscribe(value => value && this.loadList());
	}

	timestampOnBackButton = 0;
	list: ISplitEntry[];

	get backButtonHandler() {
		return () => {
			console.log('Confirming close...');
			let now = Date.now();
			if (now - this.timestampOnBackButton > DOUBLE_BACK_DURATION) {
				this.timestampOnBackButton = now;
				this.presentToast({
					message  : this.translate('SPLITS_PAGE.EXIT_CONFIRMATION'),
					duration : DOUBLE_BACK_DURATION,
				})
			}
			else {
				this.platform.exitApp();
			}
		}
	}
	readParams() { return true }

	isComplete(entry: ISplitEntry) { return (entry.stage & SplitStage.COMPLETE) === SplitStage.COMPLETE }

	async loadList() {
		console.log('Loading split entries...');
		this.list = ListHelpers
			.toList(await Split.loadEntries(this.STORAGE, BasePage.STORAGE_KEY))
			.sort((a, b) => (a.timestamp < b.timestamp) ? +1 : -1);
	}

	showActions(entry: ISplitEntry) {
		this.presentActions({
			title: this.translate('SPLITS_PAGE.ACTION_TITLE', { name: entry.name }),
			buttons: [
				this.ACTION_BUTTONS.OPEN.onAfterDismiss(() => this.loadSplit(entry)),
				this.ACTION_BUTTONS.RENAME.onBeforeDismiss(() => this.renameSplit(entry)),
				this.ACTION_BUTTONS.DELETE.onBeforeDismiss(() => this.deleteSplit(entry)),
			]
		})
	}

	newSplit() {
		let split = new Split();
		//	TODO: Remove
		window['split'] = split;
		this.navCtrl.setRoot('BasicSplitPage', this.makeParams({}, split), { animate: true, direction: 'forward' });
	}

	async loadSplit(entry: ISplitEntry) {
		let split  = await Split.load(this.STORAGE, entry.id);
		let params = this.makeParams({}, split);
		let pages  = [];
		//	TODO: Remove
		window['split'] = split;
		if (split.type === SplitType.BASIC) {
			if (split.hasStage(SplitStage.BASIC))  pages.push({ page: 'BasicSplitPage', params: params });
			if (split.hasStage(SplitStage.REPORT)) pages.push({ page: 'BasicReportPage', params: params });
		}
		else {
			if (split.hasStage(SplitStage.PERSONS)) pages.push({ page: 'PersonsPage', params: params });
			if (split.hasStage(SplitStage.ITEMS))   pages.push({ page: 'ItemsPage', params: params });
			if (split.hasStage(SplitStage.EXTRAS))  pages.push({ page: 'ExtrasPage', params: params });
			if (split.hasStage(SplitStage.REPORT))  pages.push({ page: 'AdvancedReportPage', params: params });
		}
		this.navCtrl.setPages(pages, { animate: true, direction: 'forward' });
	}

	async renameSplit(entry: ISplitEntry) {
		let data = { name: entry.name };
		await this.presentAlert({
			title   : this.translate('SPLITS_PAGE.RENAME_TITLE', data),
			message : this.translate('SPLITS_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('SPLITS_PAGE.RENAME_PLACEHOLDER', data), value: entry.name }],
			buttons : [
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(async(data) => {
					let name = data.name.trim();
					if (!name) { this.presentToast({ message: this.translate('SPLITS_PAGE.ERR_BLANK_NAME'), duration: 3000 }); return false }
					await Split.renameEntry(this.STORAGE, BasePage.STORAGE_KEY, entry.id, name);
					await this.loadList();
				}),
				this.ALERT_BUTTONS.CANCEL
			]
		})
	}
	async deleteSplit(entry: ISplitEntry) {
		let data = { name: entry.name };
		await this.presentAlert({
			title   : this.translate('SPLITS_PAGE.DELETE_TITLE', data),
			message : this.translate('SPLITS_PAGE.DELETE_MESSAGE', data),
			buttons : [
				this.ALERT_BUTTONS.DELETE.onBeforeDismiss(async(data) => {
					await Split.remove(this.STORAGE, BasePage.STORAGE_KEY, entry.id);
					await this.loadList();
				}),
				this.ALERT_BUTTONS.CANCEL
			],
		})
	}

}
