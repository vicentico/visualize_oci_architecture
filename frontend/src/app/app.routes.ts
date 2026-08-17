import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/architecture/architecture-list/architecture-list.component')
        .then(m => m.ArchitectureListComponent)
  },
  {
    path: 'designer',
    loadComponent: () =>
      import('./features/canvas/canvas-designer.component')
        .then(m => m.CanvasDesignerComponent)
  },
  {
    path: 'designer/:id',
    loadComponent: () =>
      import('./features/canvas/canvas-designer.component')
        .then(m => m.CanvasDesignerComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
