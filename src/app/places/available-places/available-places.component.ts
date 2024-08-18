import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  loading = signal(false);
  error = signal('');
  private placeService = inject(PlacesService)

  ngOnInit(): void {
    try {
      this.loading.set(true)
      const subscription = this.placeService.loadAvailablePlaces()
        .subscribe({
          next: (response) => {
            // console.log(response, "\n")
            // console.log(response.body?.places)
            this.places.set(response);
          },
          error: (err) => this.error.set(err.message),
          complete: () => this.loading.set(false)
        })

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe()
      })
    } catch (error) {
      throw new Error('Error Handling Http Request')
    }
  }

  doStuff(event: Place) {
    const subscription = this.placeService.addPlaceToUserPlaces(event).subscribe(
      {
        next: res => console.log(res)
      }
    )

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }
}
