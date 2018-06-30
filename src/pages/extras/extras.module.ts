import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExtrasPage } from './extras';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ ExtrasPage ],
	imports: [
		IonicPageModule.forChild(ExtrasPage),
		TranslateModule.forChild(),
	],
	exports: [ ExtrasPage ],
})
export class ExtrasPageModule {}
