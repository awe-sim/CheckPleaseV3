import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { AlertCtrl, ActionCtrl, SettingsCtrl, ToastCtrl } from '../../utils';
import { ISplitEntry, ListHelpers, Split, SplitStage, SplitType } from '../../core';
import { MixinBase, MixinTranslations, MixinBackButtonHandler, MixinActions, MixinAlert, MixinToast } from '../../utils/mixins';

const DOUBLE_BACK_DURATION = 3000;

@IonicPage()
@Component({
	selector    : 'page-splits',
	templateUrl : 'splits.html',
	providers   : [ ActionCtrl, AlertCtrl, ToastCtrl ],
})
export class SplitsPage extends MixinToast(MixinAlert(MixinActions(MixinBackButtonHandler(MixinTranslations(MixinBase))))) {

	storage = new Storage({});
	storageKey = '_entries';
	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public platform     : Platform,
		public actionCtrl   : ActionCtrl,
		public alertCtrl    : AlertCtrl,
		public toastCtrl    : ToastCtrl,
		public translateSvc : TranslateService,
		public settingsCtrl : SettingsCtrl,
	) {
		super();
		this.translationsInit(['BASE_PAGE', 'SPLITS_PAGE']);
		this.loadList();
		// this.settingsCtrl.load()
		// 	.then(() => this.settingsCtrl.get<boolean>('privacyPolicySeen'))
		// 	.then(privacyPolicySeen => {
		// 		if (!privacyPolicySeen) {
		// 			this.alert({
		// 				title   : this.translate('SPLITS_PAGE.PRIVACY_POLICY_TITLE'),
		// 				message : this.translate('SPLITS_PAGE.PRIVACY_POLICY_MESSAGE'),
		// 				buttons : [
		// 					this.ALERT_BUTTONS.YES
		// 						.onAfterDismiss(() => {
		// 							this.pushPage('PrivacyPolicyPage');
		// 							this.settingsCtrl.set('privacyPolicySeen', true);
		// 						}),
		// 					this.ALERT_BUTTONS.NOT_NOW ,
		// 				],
		// 			})
		// 		}
		// 	})
	}

	translationsLoadedCallback() {
		this.actionButtonsLoad();
		this.alertButtonsLoad();
	}

	ionViewWillEnter() {
		this.loadList();
		// this.onLoad.subscribe(value => value && this.loadList());
	}

	timestampOnBackButton = 0;
	list: ISplitEntry[];

	backButtonHandler() {
		return () => {
			console.log('Consuming BACKBUTTON...');
			let now = Date.now();
			if (now - this.timestampOnBackButton > DOUBLE_BACK_DURATION) {
				this.timestampOnBackButton = now;
				this.toast({
					message  : this.translate('SPLITS_PAGE.EXIT_CONFIRMATION'),
					duration : DOUBLE_BACK_DURATION,
				})
			}
			else {
				this.platform.exitApp();
			}
		}
	}

	isComplete(entry: ISplitEntry) { return (entry.stage & SplitStage.COMPLETE) === SplitStage.COMPLETE }

	async loadList() {
		console.log('Loading split entries...');
		this.list = ListHelpers
			.toList(await Split.loadEntries(this.storage, this.storageKey))
			.sort((a, b) => (a.timestamp < b.timestamp) ? +1 : -1);
	}

	showActions(entry: ISplitEntry) {
		this.actions({
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
		this.navCtrl.setRoot('BasicSplitPage', { PARAM_SPLIT: split }, { animate: true, direction: 'forward' });
	}

	async loadSplit(entry: ISplitEntry) {
		let split  = await Split.load(this.storage, entry.id);
		let params = { PARAM_SPLIT: split };
		let pages  = [];
		//	TODO: Remove
		window['split'] = split;
		if (split.type === SplitType.BASIC) {
			if (split.hasStage(SplitStage.BASIC))  pages.push({ page: 'BasicSplitPage', params: params });
		}
		else {
			if (split.hasStage(SplitStage.PERSONS)) pages.push({ page: 'PersonsPage', params: params });
			if (split.hasStage(SplitStage.ITEMS))   pages.push({ page: 'ItemsPage', params: params });
			if (split.hasStage(SplitStage.EXTRAS))  pages.push({ page: 'ExtrasPage', params: params });
		}
		if (split.hasStage(SplitStage.REPORT))    pages.push({ page: 'ReportPage', params: params });
		this.navCtrl.setPages(pages, { animate: true, direction: 'forward' });
	}

	async renameSplit(entry: ISplitEntry) {
		let data = { name: entry.name };
		await this.alert({
			title   : this.translate('SPLITS_PAGE.RENAME_TITLE', data),
			message : this.translate('SPLITS_PAGE.RENAME_MESSAGE', data),
			inputs  : [{ type: 'text', name: 'name', placeholder: this.translate('SPLITS_PAGE.RENAME_PLACEHOLDER', data), value: entry.name }],
			buttons : [
				this.ALERT_BUTTONS.RENAME.onBeforeDismiss(async(data) => {
					let name = data.name.trim();
					if (!name) { this.toast({ message: this.translate('SPLITS_PAGE.ERR_BLANK_NAME'), duration: 3000 }); return false }
					await Split.renameEntry(this.storage, this.storageKey, entry.id, name);
					await this.loadList();
				}),
				this.ALERT_BUTTONS.CANCEL
			]
		})
	}
	async deleteSplit(entry: ISplitEntry) {
		let data = { name: entry.name };
		await this.alert({
			title   : this.translate('SPLITS_PAGE.DELETE_TITLE', data),
			message : this.translate('SPLITS_PAGE.DELETE_MESSAGE', data),
			buttons : [
				this.ALERT_BUTTONS.DELETE.onBeforeDismiss(async(data) => {
					await Split.remove(this.storage, this.storageKey, entry.id);
					await this.loadList();
				}),
				this.ALERT_BUTTONS.CANCEL
			],
		})
	}

}
