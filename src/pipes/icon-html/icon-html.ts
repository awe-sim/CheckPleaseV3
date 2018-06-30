import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'iconHtml',
})
export class IconHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

	transform(content: string) {
		console.log(content);
		content = content.replace(/#[A-z\-:]*#/g, token => {
			let match = token.match(/# *([A-z\-]+) ?:? ?([A-z\-]+)? *#/);
			return `<ion-icon ${match[2] ? 'color="${match[2]}"' : ''} name="${match[1]}" role="img" class="icon icon-md icon-md-teal ion-md-${match[1]}" aria-label="${match[1]}" ng-reflect-color="teal" ng-reflect-name="${match[1]}"></ion-icon>`;
		})
		console.log(content);
		return this.sanitizer.bypassSecurityTrustHtml(content);
	}

}
