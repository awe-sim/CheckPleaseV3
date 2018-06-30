import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { IonicStorageModule, Storage } from '@ionic/storage';
import { Settings } from '../utils';

const TRANSLATIONS_PATH_PREFIX = './assets/i18n/';
const TRANSLATIONS_PATH_SUFFIX = '.json';

const KEY_SETTINGS     = 'SETTINGS';
const DEFAULT_SETTINGS = { };

@NgModule({
	declarations: [ MyApp ],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp),
		HttpClientModule,
		TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: (http: HttpClient) => new TranslateHttpLoader(http, TRANSLATIONS_PATH_PREFIX, TRANSLATIONS_PATH_SUFFIX), deps: [ HttpClient ] } }),
		IonicStorageModule.forRoot(),
	],
	bootstrap: [ IonicApp ],
	entryComponents: [ MyApp ],
	providers: [
		StatusBar,
		SplashScreen,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		{ provide: Settings, useFactory: (storage: Storage) => new Settings(storage, KEY_SETTINGS, DEFAULT_SETTINGS), deps: [ Storage ] },
	]
})
export class AppModule { }
