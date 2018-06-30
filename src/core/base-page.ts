import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl, ActionButton, AlertButton, IActionOptions, IAlertOptions, IAlertResult, IModalOptions, IToastOptions } from '../utils';
import { Split, SplitStage, SplitType } from './split';

interface IActionButtons {
	DELETE        : ActionButton;
	DEPENDANTS    : ActionButton;
	DISCARD       : ActionButton;
	OPEN          : ActionButton;
	POOL_AMOUNT   : ActionButton;
	RENAME        : ActionButton;
	RETURN_CHANGE : ActionButton;
	SAVE          : ActionButton;
}
interface IAlertButtons {
	ADD           : AlertButton;
	ADD_ANOTHER   : AlertButton;
	CANCEL        : AlertButton;
	DELETE        : AlertButton;
	POOL_AMOUNT   : AlertButton;
	RENAME        : AlertButton;
	RETURN_CHANGE : AlertButton;
	SAVE          : AlertButton;
}

export abstract class BasePage {

	static readonly PARAM_SPLIT = 'PARAM_SPLIT';
	static readonly STORAGE_KEY = '_entries';
	static readonly ROOT_PAGE   = 'SplitsPage';

	private _storage = new Storage({});
	private _onLoad  = new BehaviorSubject<boolean>(false);
	private _onError = new BehaviorSubject<boolean>(false);
	private _translations   : any;
	private _actionButtons  : IActionButtons;
	private _alertButtons   : IAlertButtons;
	private _split          : Split;
	private _oldBackHandler : Function;

	get loadBaseTranslations(): boolean { return true }
	get backButtonHandler(): Function { return null }
	readParams(): boolean {
		this._split = this.navParams.get(BasePage.PARAM_SPLIT) || null;
		return !!this._split;
	}
	get splitStage(): SplitStage { return null }
	get splitType(): SplitType { return null }

	get STORAGE() { return this._storage }
	get TRANSLATIONS() { return  this._translations }
	get ACTION_BUTTONS() { return this._actionButtons }
	get ALERT_BUTTONS() { return this._alertButtons }

	get split() { return  this._split }
	get onLoad() { return  this._onLoad.asObservable() }
	get onError() { return this._onError.asObservable() }

	constructor(
		public navCtrl      : NavController,
		public navParams    : NavParams,
		public platform     : Platform,
		private actionCtrl  : ActionCtrl,
		private alertCtrl   : AlertCtrl,
		private modalCtrl   : ModalCtrl,
		private toastCtrl   : ToastCtrl,
		public translateSvc : TranslateService,
		translationKeys     : string[],
	) {
		window['storage'] = this.STORAGE;
		new Promise(resolve => {
			let keys = translationKeys || [];
			if (this.loadBaseTranslations) {
				keys.push('BASE_PAGE');
			}
			if (!keys.length) {
				resolve();
			}
			else {
				this.loadTranslations(keys)
					.then(values => {
						this._translations = values;
						if (this.loadBaseTranslations) {
							this._actionButtons = {
								DEPENDANTS    : new ActionButton(this.translate('BASE_PAGE.BUTTON_DEPENDANTS'),    'contacts'),
								DELETE        : new ActionButton(this.translate('BASE_PAGE.BUTTON_DELETE'),        'trash'),
								DISCARD       : new ActionButton(this.translate('BASE_PAGE.BUTTON_DISCARD'),       'trash'),
								OPEN          : new ActionButton(this.translate('BASE_PAGE.BUTTON_OPEN'),          'document'),
								POOL_AMOUNT   : new ActionButton(this.translate('BASE_PAGE.BUTTON_POOL_AMOUNT'),   'cash'),
								RENAME        : new ActionButton(this.translate('BASE_PAGE.BUTTON_RENAME'),        'create'),
								RETURN_CHANGE : new ActionButton(this.translate('BASE_PAGE.BUTTON_RETURN_CHANGE'), 'cash'),
								SAVE          : new ActionButton(this.translate('BASE_PAGE.BUTTON_SAVE'),          'folder-open'),
							};
							this._alertButtons  = {
								ADD           : new AlertButton(this.translate('BASE_PAGE.BUTTON_ADD')),
								ADD_ANOTHER   : new AlertButton(this.translate('BASE_PAGE.BUTTON_ADD_ANOTHER')),
								CANCEL        : new AlertButton(this.translate('BASE_PAGE.BUTTON_CANCEL'), null, true),
								DELETE        : new AlertButton(this.translate('BASE_PAGE.BUTTON_DELETE'), 'danger'),
								POOL_AMOUNT   : new AlertButton(this.translate('BASE_PAGE.BUTTON_POOL_AMOUNT')),
								RENAME        : new AlertButton(this.translate('BASE_PAGE.BUTTON_RENAME')),
								RETURN_CHANGE : new AlertButton(this.translate('BASE_PAGE.BUTTON_RETURN_CHANGE')),
								SAVE          : new AlertButton(this.translate('BASE_PAGE.BUTTON_SAVE')),
							};
						}
						resolve();
					})
			}
		}).then(_ => {
			if (this.readParams()) {
				console.log('ON_LOAD');
				this._onLoad.next(true);
			}
			else {
				console.log('ON_ERROR');
				this._onError.next(true);
			}
		})
	}

	private _setBackButtonHandler() {
		if (this.backButtonHandler && !this._oldBackHandler) {
			this._oldBackHandler = this.platform.registerBackButtonAction(this.backButtonHandler, 101);
		}
	}
	private _restoreBackButtonHandler() {
		if (this._oldBackHandler) {
			this._oldBackHandler();
			this._oldBackHandler = null;
		}
	}

	ionViewDidEnter() {
		this._setBackButtonHandler();
	}
	ionViewWillLeave() {
		this._restoreBackButtonHandler();
	}

	async presentAlert(options: IAlertOptions): Promise<IAlertResult> {
		this._restoreBackButtonHandler();
		let ret = await this.alertCtrl.present(options);
		this._setBackButtonHandler();
		return ret;
	}
	async presentActions(options: IActionOptions): Promise<string|ActionButton> {
		this._restoreBackButtonHandler();
		let ret = await this.actionCtrl.present(options);
		this._setBackButtonHandler();
		return ret;
	}
	async presentModal<T>(options: IModalOptions): Promise<T> {
		this._restoreBackButtonHandler();
		let ret = await this.modalCtrl.present<T>(options);
		this._setBackButtonHandler();
		return ret;
	}
	async presentToast(options: IToastOptions): Promise<any> {
		this._restoreBackButtonHandler();
		let ret = await this.toastCtrl.present(options);
		this._setBackButtonHandler();
		return ret;
	}

	makeParams(params?: Object, splitOverride?: Split): Object {
		params = params || {};
		params[BasePage.PARAM_SPLIT] = splitOverride || this.split;
		return params;
	}

	translate(key: string, params?: Object): string {
		let keys = key.split('.');
		let ret = this.TRANSLATIONS;
		if (ret) {
			for (let k of keys) {
				if (typeof ret === 'string' || !(k in ret)) return key;
				ret = ret[k];
			}
		}
		Object.keys(params || {}).forEach(varName => {
			console.log(params[varName]);
			ret = ret.replace(new RegExp(`\{\{ *${varName} *\}\}`, 'g'), params[varName])
		})
		return ret;
	}
	async loadTranslations(keys: string, params?: Object): Promise<string>
	async loadTranslations(keys: string[], params?: Object): Promise<Object>
	async loadTranslations(keys: string | string[], params?: Object): Promise<string|Object> {
		return new Promise(resolve => {
			this.translateSvc.get(keys, params).subscribe(values => {
				console.log('TRANSLATIONS', values);
				resolve(values);
			})
		})
	}

	async popToRoot(animate: boolean = true) {
		return await this.navCtrl.setRoot(BasePage.ROOT_PAGE, {}, { animate: animate, direction: 'back' });
	}
	async pushPage(page: string, params?: Object) {
		return await this.navCtrl.push(page, this.makeParams(params));
	}

	isDirty() { return this.split && this.split.isDirty }
	isSaved() { return this.split && this.split.isSaved }
	async save() {
		this.split.type  = this.splitType;
		this.split.stage = this.splitStage;
		return await this.split.save(this.STORAGE, BasePage.STORAGE_KEY);
	}
	async close() {
		if (!this.isDirty()) {
			this.popToRoot();
		}
		else {
			this.presentActions({
				title   : this.translate('BASE_PAGE.ACTION_TITLE'),
				buttons : [
					this.ACTION_BUTTONS.SAVE.onBeforeDismiss(() => {
						if (this.isSaved()) {
							if (this.isDirty()) this.save();
							this.popToRoot();
						}
						else {
							this.presentAlert({
								title   : this.translate('BASE_PAGE.SAVE_TITLE'),
								message : this.translate('BASE_PAGE.SAVE_MESSAGE'),
								inputs: [{ type: 'text', name: 'name', placeholder: this.translate('BASE_PAGE.SAVE_PLACEHOLDER') }],
								buttons: [
									this.ALERT_BUTTONS.CANCEL,
									this.ALERT_BUTTONS.SAVE
										.onBeforeDismiss(data => {
											let name = data.name.trim();
											if (!name) {
												this.presentToast({ message: this.translate('BASE_PAGE.ERR_BLANK_SPLIT_NAME'), duration: 3000 });
												return false;
											}
											this.split.name = data.name.trim();
											this.save();
											this.popToRoot();
										})
								]
							})
						}
					}),
					this.ACTION_BUTTONS.DISCARD.onBeforeDismiss(() => { this.popToRoot() })
				]
			})
		}
	}

}
