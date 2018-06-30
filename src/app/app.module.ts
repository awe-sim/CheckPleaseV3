import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

const TRANSLATIONS_PATH_PREFIX = './assets/i18n/';
const TRANSLATIONS_PATH_SUFFIX = '.json';

@NgModule({
	declarations: [ MyApp ],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp),
		HttpClientModule,
		TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: (http: HttpClient) => new TranslateHttpLoader(http, TRANSLATIONS_PATH_PREFIX, TRANSLATIONS_PATH_SUFFIX), deps: [ HttpClient ] } }),
	],
	bootstrap: [ IonicApp ],
	entryComponents: [ MyApp ],
	providers: [
		StatusBar,
		SplashScreen,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
	]
})
export class AppModule { }
