import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemOrdersPage } from './item-orders';

import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ ItemOrdersPage ],
	imports: [
		IonicPageModule.forChild(ItemOrdersPage),
		TranslateModule.forChild(),
		ComponentsModule,
	],
	exports: [ ItemOrdersPage ],
})
export class ItemOrdersPageModule {}
