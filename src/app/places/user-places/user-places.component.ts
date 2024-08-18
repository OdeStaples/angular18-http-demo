import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {

  loading = signal(false)
  err = signal('')

  private http = inject(HttpClient)
  private placeService = inject(PlacesService)

  private destroyRef = inject(DestroyRef)

  places = this.placeService.loadedUserPlaces;

  ngOnInit(): void {
    this.loading.set(true)
    const subscription = this.placeService.loadUserPlaces().subscribe({
      error: (err) => {
        this.err.set(err.message)
      },
      complete: () => this.loading.set(false)
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }

  removePlace(place: Place) {
    const sub = this.placeService.removeUserPlace(place).subscribe()

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe()
    })
  }
}
