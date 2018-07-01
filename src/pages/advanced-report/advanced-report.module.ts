import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdvancedReportPage } from './advanced-report';

import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
	declarations: [ AdvancedReportPage ],
	imports: [
		IonicPageModule.forChild(AdvancedReportPage),
		TranslateModule.forChild(),
		ComponentsModule,
		DirectivesModule,
	],
	exports: [ AdvancedReportPage ],
})
export class AdvancedReportPageModule {}
