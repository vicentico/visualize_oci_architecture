import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/architecture/architecture-list/architecture-list.component')
        .then(m => m.ArchitectureListComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
