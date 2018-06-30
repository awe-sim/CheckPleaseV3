import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonDependantsPage } from './person-dependants';

import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ PersonDependantsPage ],
	imports: [
		IonicPageModule.forChild(PersonDependantsPage),
		TranslateModule.forChild(),
		ComponentsModule,
	],
	exports: [ PersonDependantsPage ],
})
export class PersonDependantsPageModule {}
