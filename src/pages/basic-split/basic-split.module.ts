import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BasicSplitPage } from './basic-split';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ BasicSplitPage ],
	imports: [
		IonicPageModule.forChild(BasicSplitPage),
		TranslateModule.forChild(),
	],
	exports: [ BasicSplitPage ],
})
export class BasicSplitPageModule {}
