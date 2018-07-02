import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonReportPage } from './person-report';

import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ PersonReportPage ],
	imports: [
		IonicPageModule.forChild(PersonReportPage),
		TranslateModule.forChild(),
		ComponentsModule,
	],
	exports: [ PersonReportPage ],
})
export class PersonReportPageModule {}
