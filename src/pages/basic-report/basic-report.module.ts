import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BasicReportPage } from './basic-report';

import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
	declarations: [ BasicReportPage ],
	imports: [
		IonicPageModule.forChild(BasicReportPage),
		TranslateModule.forChild(),
		ComponentsModule,
		DirectivesModule,
	],
	exports: [ BasicReportPage ],
})
export class BasicReportPageModule {}
