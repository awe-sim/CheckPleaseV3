import { Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ActionCtrl, ActionButton, IActionOptions } from './action';
import { AlertCtrl, AlertButton, IAlertOptions, IAlertResult } from './alert';
import { ModalCtrl, IModalOptions } from './modal';
import { ToastCtrl, IToastOptions } from './toast';

type Constructor<T={}> = new (...args: any[]) => T;
export class MixinBase {}

//	----------------------------------------------------------------------------

export function MixinTranslations<T extends Constructor>(Base: T) {
	abstract class TranslationsBase extends Base {

		//	TO BE IMPLEMENTED
		abstract translateSvc: TranslateService;
		abstract translationsLoadedCallback();

		private _translations: any;
		get TRANSLATIONS(): Readonly<any> { return this._translations }

		translationsInit(keys: string|string[], params?: Object) {
			return this.translationsLoad(keys, params).then(values => {
				console.log('TRANSLATIONS', values);
				this._translations = values;
				this.translationsLoadedCallback();
			})
		}

		async translationsLoad(keys: string|string[], params?: Object): Promise<any> {
			if (!this.translateSvc) return Promise.reject('translationsInit() not called yet');
			return new Promise(resolve => {
				this.translateSvc.get(keys, params).subscribe(values => resolve(values));
			})
		}

		translate(key: string, params?: Object): string {
			let keys = key.split('.');
			let ret: any = this.TRANSLATIONS;
			if (ret) {
				for (let k of keys) {
					if (typeof ret === 'string' || !(k in ret)) return key;
					ret = ret[k];
				}
			}
			Object.keys(params || {}).forEach(varName => {
				let varValue = params[varName];
				if (typeof varValue === 'number') {
					varValue = varValue.toFixed(2).replace('.00', '');
				}
				ret = ret.replace(new RegExp(`\{\{ *${varName} *\}\}`, 'g'), params[varName])
			})
			return ret;
		}
	}
	return TranslationsBase;
}


//	----------------------------------------------------------------------------

export function MixinBackButtonHandler<T extends Constructor>(Base: T) {
	abstract class BackButtonHandlerBase extends Base {

		//	TO BE IMPLEMENTED
		abstract platform: Platform;

		private _backButtonHandlers: Function[] = [];
		private _priotity = 100;

		backButtonHandler(): Function { return null }

		backButtonHandlerSet(fnHandler?: Function) {
			fnHandler = fnHandler || this.backButtonHandler();
			if (!fnHandler) return;
			console.log('BACKBUTTON HANDLER ADDED', this._priotity);
			this._backButtonHandlers.push(this.platform.registerBackButtonAction(fnHandler, this._priotity++));
		}

		backButtonHandlerRemove() {
			if (!this._backButtonHandlers.length) return;
			this._backButtonHandlers.pop()();
			--this._priotity;
			console.log('BACKBUTTON HANDLER REMOVED', this._priotity);
		}

		ionViewDidEnter() {
			this.backButtonHandlerSet();
		}

		ionViewWillLeave() {
			this.backButtonHandlerRemove();
		}
	}
	return BackButtonHandlerBase;
}

//	----------------------------------------------------------------------------

export interface IActionButtons {
	DELETE            : ActionButton;
	DEPENDANTS        : ActionButton;
	DISCARD           : ActionButton;
	EDIT              : ActionButton;
	OPEN              : ActionButton;
	ORDERS            : ActionButton;
	POOL_AMOUNT       : ActionButton;
	RENAME            : ActionButton;
	RETURN_CHANGE     : ActionButton;
	SAVE              : ActionButton;
	SHOW_CALCULATIONS : ActionButton;
}

export function MixinActions<T extends Constructor>(Base: T) {
	abstract class ActionBase extends Base {

		//	TO BE IMPLEMENTED
		abstract actionCtrl: ActionCtrl;

		//	ADDED VIA MixinTranslations
		abstract translate(key: string, params?: Object): string;
		//	ADDED VIA MixinBackButtonHandler
		abstract backButtonHandlerSet(fnHandler?: Function);
		abstract backButtonHandlerRemove();

		private _actionButtons: IActionButtons;
		get ACTION_BUTTONS() { return this._actionButtons }

		actionButtonsLoad() {
			this._actionButtons = {
				DEPENDANTS        : new ActionButton(this.translate('BASE_PAGE.BUTTON_DEPENDANTS'),        'contacts'),
				DELETE            : new ActionButton(this.translate('BASE_PAGE.BUTTON_DELETE'),            'trash'),
				DISCARD           : new ActionButton(this.translate('BASE_PAGE.BUTTON_DISCARD'),           'trash'),
				EDIT              : new ActionButton(this.translate('BASE_PAGE.BUTTON_EDIT'),              'create'),
				OPEN              : new ActionButton(this.translate('BASE_PAGE.BUTTON_OPEN'),              'document'),
				ORDERS            : new ActionButton(this.translate('BASE_PAGE.BUTTON_ORDERS'),            'cafe'),
				POOL_AMOUNT       : new ActionButton(this.translate('BASE_PAGE.BUTTON_POOL_AMOUNT'),       'cash'),
				RENAME            : new ActionButton(this.translate('BASE_PAGE.BUTTON_RENAME'),            'create'),
				RETURN_CHANGE     : new ActionButton(this.translate('BASE_PAGE.BUTTON_RETURN_CHANGE'),     'cash'),
				SAVE              : new ActionButton(this.translate('BASE_PAGE.BUTTON_SAVE'),              'folder-open'),
				SHOW_CALCULATIONS : new ActionButton(this.translate('BASE_PAGE.BUTTON_SHOW_CALCULATIONS'), 'calculator'),
			}
		}

		async actions(options: IActionOptions): Promise<string|ActionButton> {
			let param = { dismiss: null }
			this.backButtonHandlerSet(() => param.dismiss && param.dismiss());
			let ret = await this.actionCtrl.present(options, param);
			this.backButtonHandlerRemove();
			return ret;
		}
	}
	return ActionBase;
}

//	----------------------------------------------------------------------------

export interface IAlertButtons {
	ADD           : AlertButton;
	ADD_ANOTHER   : AlertButton;
	CANCEL        : AlertButton;
	DELETE        : AlertButton;
	NOT_NOW       : AlertButton;
	POOL_AMOUNT   : AlertButton;
	RENAME        : AlertButton;
	RETURN_CHANGE : AlertButton;
	SAVE          : AlertButton;
	YES           : AlertButton;
}

export function MixinAlert<T extends Constructor>(Base: T) {
	abstract class AlertBase extends Base {

		//	TO BE IMPLEMENTED
		abstract alertCtrl: AlertCtrl;

		//	ADDED VIA MixinTranslations
		abstract translate(key: string, params?: Object): string;
		//	ADDED VIA MixinBackButtonHandler
		abstract backButtonHandlerSet(fnHandler?: Function);
		abstract backButtonHandlerRemove();

		private _alertButtons: IAlertButtons;
		get ALERT_BUTTONS() { return this._alertButtons }

		alertButtonsLoad() {
			this._alertButtons = {
				ADD           : new AlertButton(this.translate('BASE_PAGE.BUTTON_ADD')),
				ADD_ANOTHER   : new AlertButton(this.translate('BASE_PAGE.BUTTON_ADD_ANOTHER')),
				CANCEL        : new AlertButton(this.translate('BASE_PAGE.BUTTON_CANCEL'), null, true),
				DELETE        : new AlertButton(this.translate('BASE_PAGE.BUTTON_DELETE'), 'danger'),
				NOT_NOW       : new AlertButton(this.translate('BASE_PAGE.BUTTON_NOT_NOW'), null, true),
				POOL_AMOUNT   : new AlertButton(this.translate('BASE_PAGE.BUTTON_POOL_AMOUNT')),
				RENAME        : new AlertButton(this.translate('BASE_PAGE.BUTTON_RENAME')),
				RETURN_CHANGE : new AlertButton(this.translate('BASE_PAGE.BUTTON_RETURN_CHANGE')),
				SAVE          : new AlertButton(this.translate('BASE_PAGE.BUTTON_SAVE')),
				YES           : new AlertButton(this.translate('BASE_PAGE.BUTTON_YES')),
			}
		}

		async alert(options: IAlertOptions): Promise<IAlertResult> {
			let param = { dismiss: null }
			this.backButtonHandlerSet(() => param.dismiss && param.dismiss());
			let ret = await this.alertCtrl.present(options, param);
			this.backButtonHandlerRemove();
			return ret;
		}
	}
	return AlertBase;
}

//	----------------------------------------------------------------------------

export function MixinModal<T extends Constructor>(Base: T) {
	abstract class ModalBase extends Base {

		//	TO BE IMPLEMENTED
		abstract modalCtrl: ModalCtrl;

		//	ADDED VIA MixinBackButtonHandler
		abstract backButtonHandlerSet(fnHandler?: Function);
		abstract backButtonHandlerRemove();

		async modal(options: IModalOptions): Promise<any> {
			this.backButtonHandlerRemove();
			let ret = await this.modalCtrl.present(options);
			this.backButtonHandlerSet();
			return ret;
		}
	}
	return ModalBase;
}

//	----------------------------------------------------------------------------

export function MixinToast<T extends Constructor>(Base: T) {
	abstract class ToastBase extends Base {

		//	TO BE IMPLEMENTED
		abstract toastCtrl: ToastCtrl;

		// //	ADDED VIA MixinBackButtonHandler
		// abstract backButtonHandlerSet(fnHandler?: Function);
		// abstract backButtonHandlerRemove();

		async toast(options: IToastOptions): Promise<any> {
			// this.backButtonHandlerRemove();
			// let ret = await this.toastCtrl.present(options);
			// this.backButtonHandlerSet();
			// return ret;
			return await this.toastCtrl.present(options);
		}
	}
	return ToastBase;
}

