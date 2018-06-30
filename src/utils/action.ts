import { Injectable } from '@angular/core';
import { ActionSheetController, ActionSheet } from 'ionic-angular';

type BeforeDismissResult   = void|boolean|Promise<void|boolean>;
type BeforeDismissCallback = (action: ActionSheet) => BeforeDismissResult;
type AfterDismissCallback  = () => any;

function promisify(fnCallback: BeforeDismissCallback, action: ActionSheet): Promise<boolean> {
	if (!fnCallback) return Promise.resolve(true);
	let ret = fnCallback(action);
	if (typeof ret === 'undefined') return Promise.resolve(true);
	if (typeof ret === 'boolean') return Promise.resolve(ret);
	return ret.then(value => (typeof value === 'boolean') ? value : true);
}

export interface IActionOptions {
	title                 ?: string;
	subTitle              ?: string;
	cssClass              ?: string;
	enableBackdropDismiss ?: boolean;
	buttons               ?: (string|ActionButton)[];
	resolveAfterDismiss   ?: boolean;
}

export class ActionButton {
	private _text            : string;
	private _icon            : string;
	private _cssClass        : string;
	private _isDestructive   : boolean;
	private _button          : ActionButton;
	private _fnBeforeDismiss : BeforeDismissCallback;
	private _fnAfterDismiss  : AfterDismissCallback;
	get text()     { return this._text }
	get icon()     { return this._icon }
	get cssClass() { return this._cssClass }
	get role()     { return this._isDestructive ? 'destructive' : null }
	get button()   { return this._button }
	get beforeDismiss() { return this._fnBeforeDismiss }
	get afterDismiss() { return this._fnAfterDismiss }
	constructor(text: string, icon?: string, cssClass?: string, isDestructive?: boolean) {
		this._text          = text;
		this._icon          = icon;
		this._cssClass      = cssClass;
		this._isDestructive = isDestructive;
		this._button        = this;
	}
	onBeforeDismiss(fnCallback: BeforeDismissCallback) {
		let ret = new ActionButton(this._text, this._icon, this._cssClass, this._isDestructive);
		ret._button          = this._button || this;
		ret._fnBeforeDismiss = fnCallback || this._fnBeforeDismiss;
		ret._fnAfterDismiss  = this._fnAfterDismiss;
		return ret;
	}
	onAfterDismiss(fnCallback: AfterDismissCallback) {
		let ret = new ActionButton(this._text, this._icon, this._cssClass, this._isDestructive);
		ret._button          = this._button || this;
		ret._fnBeforeDismiss = this._fnBeforeDismiss;
		ret._fnAfterDismiss  = fnCallback || this._fnAfterDismiss;
		return ret;
	}
}

@Injectable()
export class ActionCtrl {
	constructor(private ctrl: ActionSheetController) { }
	async present(options: IActionOptions) {
		return new Promise<string|ActionButton>(resolve => {
			let action = this.ctrl.create({
				title                 : options.title,
				subTitle              : options.subTitle,
				cssClass              : options.cssClass,
				enableBackdropDismiss : options.enableBackdropDismiss,
				buttons               : (options.buttons || []).filter(it => !!it).map(it => {
					if (typeof it === 'string') return {
						text    : it,
						handler : () => {
							action.dismiss(it);
							return false;
						}
					}
					return {
						text     : it.text,
						icon     : it.icon,
						cssClass : it.cssClass,
						role     : it.role,
						handler  : () => {
							promisify(it.beforeDismiss, action).then(value => {
								if (value) action.dismiss(it.button).then(() => it.afterDismiss && it.afterDismiss());
								return value;
							})
							return false;
						}
					}
				})
			})
			action.present();
			options.resolveAfterDismiss ? action.onDidDismiss(button => resolve(button)) : action.onWillDismiss(button => resolve(button));
		})
	}
}
