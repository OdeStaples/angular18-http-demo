import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { HttpEventType, HttpHandlerFn, HttpRequest, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { tap } from 'rxjs';

function loggingInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  console.log("Outgoing Request ->", request)
  // const req = request.clone({
  //   headers: request.headers.set('X_DEBUG', 'TESTING')
  // })
  return next(request).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          console.log('1ncoming Res ->');
          console.log(event.status);
        }

        if (event.type === HttpEventType.Response) {
          console.log('2ncoming Res ->');
          console.log(event.body);
        }
      }
    })
  )
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(
    withInterceptors([loggingInterceptor])
  )]
}).catch((err) => console.error(err));
