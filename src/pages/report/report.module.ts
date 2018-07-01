import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportPage } from './report';

import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
	declarations: [ ReportPage ],
	imports: [
		IonicPageModule.forChild(ReportPage),
		TranslateModule.forChild(),
		ComponentsModule,
		DirectivesModule,
	],
	exports: [ ReportPage ],
})
export class ReportPageModule {}
