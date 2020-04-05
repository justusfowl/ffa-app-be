import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();

  const script = document.createElement('script');
   script.src = "https://www.googletagmanager.com/gtag/js?id=" + environment.gaId
   document.head.appendChild(script);
}else{

  const script = document.createElement('script');
   script.src = "https://www.googletagmanager.com/gtag/js?id=" + environment.gaId
   document.head.appendChild(script);
}

const ga = document.createElement('script');
ga.type="text/javascript";
ga.innerHTML="window.dataLayer = window.dataLayer || [];  function gtag(){dataLayer.push(arguments);}";
document.head.appendChild(ga);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
