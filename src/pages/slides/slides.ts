import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform, Slides } from 'ionic-angular';
import { MixinBase, MixinTranslations, MixinBackButtonHandler } from '../../utils/mixins';

interface Slide {
	text  : string;
	image : string;
}

@IonicPage()
@Component({
	selector    : 'page-slides',
	templateUrl : 'slides.html',
})
export class SlidesPage extends MixinBackButtonHandler(MixinTranslations(MixinBase)) {

	slides    : Slide[];
	lastSlide : Slide;
	@ViewChild(Slides) slidesCtrl: Slides;

	showSkip = true;
	dir      = 'ltr';

	constructor(
		public navCtrl      : NavController,
		public platform     : Platform,
		public translateSvc : TranslateService,
	) {
		super();
		this.translationsInit('SLIDES_PAGE');
		this.dir = this.platform.dir();
	}

	translationsLoadedCallback() {
		this.slides = [
			{ text: this.translate('SLIDE1_TEXT'), image : 'assets/slides/slide-1.jpg' },
			{ text: this.translate('SLIDE2_TEXT'), image : 'assets/slides/slide-2.jpg' },
			{ text: this.translate('SLIDE3_TEXT'), image : 'assets/slides/slide-3.jpg' },
			{ text: this.translate('SLIDE4_TEXT'), image : 'assets/slides/slide-4.jpg' },
			{ text: this.translate('SLIDE5_TEXT'), image : 'assets/img/ica-slidebox-img-1.png' }
		]
		this.lastSlide = { text: this.translate('SLIDE6_TEXT'), image : 'assets/slides/slide-6.jpg' }
	}
	backButtonHandler() { return () => {
		if (this.slidesCtrl.isEnd()) {
			this.startApp();
		}
		else {
			this.slidesCtrl.slideNext();
		}
		console.log('Consuming BACKBUTTON..');
	}}

	onSlideChangeStart(slider) {
		this.showSkip = !slider.isEnd();
	}

	startApp() {
		this.navCtrl.setRoot('SplitsPage', {}, { animate: true, direction: 'forward' });
	}
}
