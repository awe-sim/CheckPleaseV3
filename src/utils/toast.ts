import { Injectable } from '@angular/core';
import { ToastController, ToastOptions } from 'ionic-angular';

export interface IToastOptions extends ToastOptions {
	resolveAfterDismiss ?: boolean;
	delay               ?: number;
	cancel              ?: Promise<any>;
}

@Injectable()
export class ToastCtrl {

	constructor(private ctrl: ToastController) { }

	private _present(opts: IToastOptions, resolve: Function) {
		let stockToast = this.ctrl.create(opts);
		opts.resolveAfterDismiss ? stockToast.onDidDismiss(() => resolve()) : stockToast.onWillDismiss(() => resolve());
		stockToast.present();
	}

	async present(opts: IToastOptions): Promise<any> {
		return new Promise(resolve => {
			if (opts.delay) {
				let cancelled = false;
				let tID = setTimeout(() => {
					if (!cancelled) this._present(opts, resolve);
				}, opts.delay);
				if (opts.cancel) opts.cancel.then(() => {
					cancelled = true;
					clearTimeout(tID);
				});
			}
			else {
				this._present(opts, resolve);
			}
		})
	}

}
