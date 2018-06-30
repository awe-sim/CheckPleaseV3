import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

export interface IModalOptions {
	page                   : any;
	params                ?: Object;
	showBackdrop          ?: boolean;
	enableBackdropDismiss ?: boolean;
	resolveAfterDismiss   ?: boolean;
}

@Injectable()
export class ModalCtrl {

	constructor(private ctrl: ModalController) { }

	async present<T>(opts: IModalOptions): Promise<T> {
		return new Promise<T>(resolve => {
			let modal = this.ctrl.create(opts.page, opts.params, { showBackdrop: opts.showBackdrop, enableBackdropDismiss: opts.enableBackdropDismiss })
			opts.resolveAfterDismiss ? modal.onDidDismiss(data => resolve(data)) : modal.onWillDismiss(data => resolve(data));
			modal.present();
		})
	}

}
