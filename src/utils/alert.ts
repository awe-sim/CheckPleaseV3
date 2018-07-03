import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

type BeforeDismissResult   = void|boolean|Promise<void|boolean>;
type BeforeDismissCallback = (data: any) => BeforeDismissResult;
type AfterDismissCallback  = (data: any) => any;

function promisify(fnCallback: BeforeDismissCallback, params: IAlertResult): Promise<boolean> {
	if (!fnCallback) return Promise.resolve(true);
	let ret = fnCallback(params);
	if (typeof ret === 'undefined') return Promise.resolve(true);
	if (typeof ret === 'boolean') return Promise.resolve(ret);
	return ret.then(value => (typeof value === 'boolean') ? value : true);
}

function transformCheckboxData(inputs: IAlertInput[], data: any): any {
	if (!inputs || inputs.length === 0 || inputs[0].type !== 'checkbox') return data;
	let map = {};
	data.forEach(value => map[value] = true);
	return map;
}

export interface IAlertInput {
	type         : string;
	name        ?: string;
	placeholder ?: string;
	value       ?: string | number;
	label       ?: string;
	checked     ?: boolean;
	disabled    ?: boolean;
}
export interface IAlertOptions {
	title                 ?: string;
	subTitle              ?: string;
	message               ?: string;
	cssClass              ?: string;
	enableBackdropDismiss ?: boolean;
	inputs                ?: IAlertInput[];
	buttons               ?: (string|AlertButton)[];
	resolveAfterDismiss   ?: boolean;
}
export interface IAlertResult {
	button ?: string|AlertButton;
	data   ?: any;
}
export class AlertButton {
	private _text            : string;
	private _cssClass        : string;
	private _isCancel        : boolean;
	private _button          : AlertButton;
	private _fnBeforeDismiss : BeforeDismissCallback;
	private _fnAfterDismiss  : AfterDismissCallback;
	get text() { return this._text }
	get cssClass() { return this._cssClass }
	get role() { return this._isCancel ? 'cancel' : null }
	get button() { return this._button }
	get beforeDismiss() { return this._fnBeforeDismiss }
	get afterDismiss() { return this._fnAfterDismiss }
	constructor(text: string, cssClass?: string, isCancel?: boolean) {
		this._text     = text;
		this._cssClass = cssClass;
		this._isCancel = isCancel;
		this._button   = this;
	}
	onBeforeDismiss(fnCallback: BeforeDismissCallback) {
		let ret = new AlertButton(this._text, this._cssClass, this._isCancel);
		ret._button          = this._button || this;
		ret._fnBeforeDismiss = fnCallback || this._fnBeforeDismiss;
		ret._fnAfterDismiss  = this._fnAfterDismiss;
		return ret;
	}
	onAfterDismiss(fnCallback: AfterDismissCallback) {
		let ret = new AlertButton(this._text, this._cssClass, this._isCancel);
		ret._button          = this._button || this;
		ret._fnBeforeDismiss = this._fnBeforeDismiss;
		ret._fnAfterDismiss  = fnCallback || this._fnAfterDismiss;
		return ret;
	}
}

@Injectable()
export class AlertCtrl {
	constructor(private ctrl: AlertController) { }
	async present(options: IAlertOptions, param?: { dismiss: Function }) {
		return new Promise<IAlertResult>(resolve => {
			let alert = this.ctrl.create({
				title                 : options.title,
				subTitle              : options.subTitle,
				message               : options.message,
				cssClass              : options.cssClass,
				enableBackdropDismiss : options.enableBackdropDismiss,
				inputs                : (options.inputs || []).filter(it => !!it).map(it => {
					return {
						type        : it.type,
						name        : it.name,
						placeholder : it.placeholder,
						label       : it.label,
						checked     : it.checked,
						disabled    : it.disabled,
						value       : (typeof it.value === 'number') ? it.value.toFixed(2).replace('.00','') : it.value,
					}
				}),
				buttons               : (options.buttons || []).filter(it => !!it).map(it => {
					if (typeof it === 'string') return {
						text    : it,
						handler : (data : any) => {
							data = transformCheckboxData(options.inputs, data);
							alert.dismiss({ button: it, data: data });
							return false;
						}
					}
					return {
						text     : it.text,
						cssClass : it.cssClass,
						role     : it.role,
						handler  : (data        : any) => {
							data = transformCheckboxData(options.inputs, data);
							promisify(it.beforeDismiss, data).then(value => {
								if (value) alert.dismiss({ button: it.button, data: data }).then(() => it.afterDismiss && it.afterDismiss(data));
								return value;
							})
							return false;
						}
					}
				})
			})
			alert.present();
			if (param) param.dismiss = () => alert.dismiss({});
			options.resolveAfterDismiss ? alert.onDidDismiss(ret => resolve(ret)) : alert.onWillDismiss(ret => resolve(ret));
		})
	}
}


