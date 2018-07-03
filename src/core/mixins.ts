import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ActionButton, IActionButtons, IActionOptions, IAlertButtons, IAlertOptions, IAlertResult, IToastOptions } from '../utils';
import { Split } from './split';

type Constructor<T={}> = new (...args: any[]) => T;
export { MixinBase } from '../utils/mixins';

//	----------------------------------------------------------------------------

export function MixinSplitBasic<T extends Constructor>(Base: T) {
	abstract class SplitBasicBase extends Base {

		//	TO BE IMPLEMENTED
		abstract navCtrl: NavController;
		abstract navParams: NavParams;
		abstract rootPage: any;
		abstract splitLoadedCallback();

		//	ADDED VIA MixinTranslations
		abstract translate(key: string, params?: Object): string;

		private _split: Split;
		get split() { return this._split }

		private _promiseLoad: Promise<boolean>;
		get splitLoaded() { return this._promiseLoad }

		splitParamsRead(): boolean {
			this._split = this.navParams.get('PARAM_SPLIT') || null;
			return this.split !== null;
		}

		splitInit() {
			this._promiseLoad = new Promise(resolve => {
				if (this.splitParamsRead()) {
					resolve(true);
					this.splitLoadedCallback();
				}
				else {
					this.popToRootPage(false);
				}
			})
		}

		splitParamsMake(params?: Object, splitOverride?: Split): Object {
			params = params || {};
			params['PARAM_SPLIT'] = splitOverride || this.split;
			return params;
		}

		isDirty() { return this.split && this.split.isDirty }

		isSaved() { return this.split && this.split.isSaved }

		popToRootPage(animate: boolean = true) {
			return this.navCtrl.setRoot(this.rootPage, {}, { animate: animate, direction: 'back' });
		}

		pushPage(page: any, params?: Object, splitOverride?: Split) {
			return this.navCtrl.push(page, this.splitParamsMake(params, splitOverride));
		}
	}
	return SplitBasicBase;
}

export function MixinSplitSave<T extends Constructor>(Base: T) {
	abstract class SplitSaveBase extends Base {

		//	TO BE IMPLEMENTED
		abstract navCtrl: NavController;
		abstract navParams: NavParams;
		abstract storageKey: string;

		//	ADDED VIA MixinSplitBasic
		abstract get split(): Split;
		abstract isDirty(): boolean;
		abstract isSaved(): boolean;
		abstract popToRootPage(animate?: boolean): Promise<any>;
		//	ADDED VIA MixinActions
		abstract actions(options: IActionOptions): Promise<string|ActionButton>;
		abstract get ACTION_BUTTONS(): IActionButtons;
		//	ADDED VIA MixinAlert
		abstract alert(options: IAlertOptions): Promise<IAlertResult>;
		abstract get ALERT_BUTTONS(): IAlertButtons;
		//	ADDED VIA MixinToast
		abstract toast(options: IToastOptions): Promise<any>;
		//	ADDED VIA MixinTranslations
		abstract translate(key: string, params?: Object): string;

		get splitType() { return this.split.type }
		get splitStage() { return this.split.stage }

		storage: Storage = new Storage({});

		save() {
			this.split.type = this.splitType;
			this.split.stage = this.splitStage;
			this.split.save(this.storage, this.storageKey);
		}
		close() {
			if (!this.isDirty()) {
				this.popToRootPage();
			}
			else {
				this.actions({
					title   : this.translate('BASE_PAGE.SAVE_TITLE'),
					buttons : [
					this.ACTION_BUTTONS.SAVE.onBeforeDismiss(async() => {
						if (this.isSaved()) {
							if (this.isDirty()) this.save();
							this.popToRootPage();
						}
						else {
							await this.alert({
								title   : this.translate('BASE_PAGE.SAVE_TITLE'),
								message : this.translate('BASE_PAGE.SAVE_MESSAGE'),
								inputs: [{ type: 'text', name: 'name', placeholder: this.translate('BASE_PAGE.SAVE_PLACEHOLDER') }],
								buttons: [
									this.ALERT_BUTTONS.CANCEL,
									this.ALERT_BUTTONS.SAVE
										.onBeforeDismiss(data => {
											let name = data.name.trim();
											if (!name) {
												this.toast({ message: this.translate('BASE_PAGE.ERR_BLANK_SPLIT_NAME'), duration: 3000 });
												return false;
											}
											this.split.name = data.name.trim();
											this.save();
											this.popToRootPage();
										})
								]
							})
						}
					}),
					this.ACTION_BUTTONS.DISCARD.onBeforeDismiss(() => { this.popToRootPage() })
					]
				})
			}
		}

	}
	return SplitSaveBase;
}
