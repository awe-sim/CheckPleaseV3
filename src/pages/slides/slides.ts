import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl } from '../../utils';
import { BasePage } from '../../core';

interface Slide {
	text  : string;
	image : string;
}

@IonicPage()
@Component({
	selector    : 'page-slides',
	templateUrl : 'slides.html',
	providers   : [ ActionCtrl, AlertCtrl, ModalCtrl, ToastCtrl ],
})
export class SlidesPage extends BasePage {

	slides: Slide[];
	lastSlide: Slide;
	showSkip = true;
	dir      = 'ltr';

	readParams() { return  true }

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
		super(navCtrl, navParams, platform, actionCtrl, alertCtrl, modalCtrl, toastCtrl, translateSvc, ['SLIDES_PAGE']);
		this.dir = platform.dir();
		this.onError.subscribe(value => value && this.popToRoot(false));
		this.onLoad.subscribe(_ => {
			this.slides = [
				{ text: this.translate('SLIDES_PAGE.SLIDE1_TEXT'), image : 'assets/slides/slide-1.jpg' },
				{ text: this.translate('SLIDES_PAGE.SLIDE2_TEXT'), image : 'assets/slides/slide-2.jpg' },
				{ text: this.translate('SLIDES_PAGE.SLIDE3_TEXT'), image : 'assets/slides/slide-3.jpg' },
				{ text: this.translate('SLIDES_PAGE.SLIDE4_TEXT'), image : 'assets/slides/slide-4.jpg' },
				{ text: this.translate('SLIDES_PAGE.SLIDE5_TEXT'), image : 'assets/img/ica-slidebox-img-1.png' }
			]
			this.lastSlide = { text: this.translate('SLIDES_PAGE.SLIDE6_TEXT'), image : 'assets/slides/slide-6.jpg' }
		})
	}

	onSlideChangeStart(slider) {
		this.showSkip = !slider.isEnd();
	}

	startApp() {
		this.navCtrl.setRoot('SplitsPage', {}, { animate: true, direction: 'forward' });
	}
}
