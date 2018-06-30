import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SplitsPage } from './splits';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ SplitsPage ],
	imports: [
		IonicPageModule.forChild(SplitsPage),
		TranslateModule.forChild(),
	],
	exports: [ SplitsPage ],
})
export class SplitsPageModule {}
