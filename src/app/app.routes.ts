import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
        title: 'Sankalan — Developer Portfolio',
        data: {
          meta: {
            description:
              'Full-stack developer portfolio showcasing projects, skills, and experience.',
            ogImage: '/assets/og-home.jpg',
          },
        },
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
        title: 'About — Sankalan',
        data: {
          meta: {
            description: 'Learn about my background, journey, and the technologies I work with.',
            ogImage: '/assets/og-about.jpg',
          },
        },
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/projects.component').then(
            (m) => m.ProjectsComponent
          ),
        title: 'Projects — Sankalan',
        data: {
          meta: {
            description: 'A curated showcase of my best frontend and fullstack projects.',
            ogImage: '/assets/og-projects.jpg',
          },
        },
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then(
            (m) => m.ContactComponent
          ),
        title: 'Contact — Sankalan',
        data: {
          meta: {
            description: 'Get in touch — open to freelance, full-time, and collaboration.',
            ogImage: '/assets/og-contact.jpg',
          },
        },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
