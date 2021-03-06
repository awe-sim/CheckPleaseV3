import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemsReportPage } from './items-report';

import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ ItemsReportPage ],
	imports: [
		IonicPageModule.forChild(ItemsReportPage),
		TranslateModule.forChild(),
		ComponentsModule,
	],
	exports: [ ItemsReportPage ],
})
export class ItemsReportPageModule {}
