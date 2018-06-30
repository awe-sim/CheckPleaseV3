import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonsPage } from './persons';

import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ PersonsPage ],
	imports: [
		IonicPageModule.forChild(PersonsPage),
		TranslateModule.forChild(),
		ComponentsModule,
		PipesModule,
	],
	exports: [ PersonsPage ],
})
export class PersonsPageModule {}
