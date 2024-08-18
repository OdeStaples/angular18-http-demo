import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  private http = inject(HttpClient)
  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'Error Fetching Places...')
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places', 'Error...').pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces)
      })
    )
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlace = this.userPlaces();

    if (!prevPlace.some((p) => p.id === place.id))
      this.userPlaces.set([...prevPlace, place])

    return this.http.put('http://localhost:3000/user-places', {
      placeId: place.id
    }).pipe(
      catchError(err => {
        this.userPlaces.set(prevPlace)
        this.errorService.showError('Operation Failed...')
        return throwError(() => new Error('Operation Failed...'))
      })
    )
  }

  removeUserPlace(place: Place) {
    const prevPlace = this.userPlaces();

    if (prevPlace.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlace.filter((p) => p.id !== place.id))
    }

    return this.http.delete('http://localhost:3000/user-places/' + place.id).pipe(
      catchError(err => {
        this.userPlaces.set(prevPlace)
        this.errorService.showError('Operation Failed...')
        return throwError(() => new Error('Operation Failed...'))
      })
    )
  }

  private fetchPlaces(url: string, errMsg: string) {
    return this.http.get<{ places: Place[] }>(url, {
      // observe: 'response'
      // observe: 'events' - during the http request what events have occured will be logged by the next function - could be triggered multiple times
    })
      .pipe(
        map(res => res.places),
        catchError((err) => {
          console.error(err)
          this.errorService.showError(errMsg)
          return throwError(() => new Error(errMsg))
        })
      )
  }
}
