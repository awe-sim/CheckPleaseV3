import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemsPage } from './items';

import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ ItemsPage ],
	imports: [
		IonicPageModule.forChild(ItemsPage),
		TranslateModule.forChild(),
		ComponentsModule,
		PipesModule,
	],
	exports: [ ItemsPage ],
})
export class ItemsPageModule {}
