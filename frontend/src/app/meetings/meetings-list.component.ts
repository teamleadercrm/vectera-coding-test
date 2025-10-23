import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeetingsService } from './meetings.service';
import { Meeting } from './models';

@Component({
  selector: 'app-meetings-list',
  template: `
    <section>
      <h2>Meetings</h2>
      <form (ngSubmit)="create()" style="margin-bottom:1rem;">
        <input [(ngModel)]="title" name="title" placeholder="Title" required>
        <input [(ngModel)]="started_at" name="started_at" placeholder="Started at (ISO)" required>
        <button type="submit">Create</button>
      </form>

      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" style="color:red">{{error}}</div>

      <ul>
        <li *ngFor="let m of meetings" (click)="open(m)" style="cursor:pointer">
          <strong>{{m.title}}</strong> — {{m.started_at}}
          <span> • notes: {{m.note_count}}</span>
          <span *ngIf="m.latest_summary"> • summary: {{m.latest_summary?.status}}</span>
        </li>
      </ul>
    </section>
  `
})
export class MeetingsListComponent implements OnInit {
  meetings: Meeting[] = [];
  loading = false;
  error: string | null = null;

  title = '';
  started_at = '';

  constructor(private api: MeetingsService, private router: Router) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api.listMeetings().subscribe({
      next: (res) => { this.meetings = res.results || res; this.loading = false; },
      error: (err) => { this.error = 'Failed to load'; this.loading = false; console.error(err); }
    });
  }

  open(m: Meeting) { this.router.navigate(['/meetings', m.id]); }

  create() {
    this.api.createMeeting({ title: this.title, started_at: this.started_at }).subscribe({
      next: () => { this.title = ''; this.started_at=''; this.fetch(); },
      error: (err) => { this.error = 'Failed to create'; console.error(err); }
    });
  }
}
