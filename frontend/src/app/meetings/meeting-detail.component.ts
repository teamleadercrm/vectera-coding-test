import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MeetingsService } from './meetings.service';
import { Meeting, Note, Summary } from './models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-meeting-detail',
  template: `
    <div *ngIf="loading">Loading…</div>
    <div *ngIf="error" style="color:red">{{error}}</div>

    <section *ngIf="meeting">
      <h2>{{meeting.title}}</h2>
      <p>Started at: {{meeting.started_at}}</p>

      <aside>
        <h3>Summary</h3>
        <div *ngIf="summary; else noSummary">
          <p>Status: {{summary?.status}}</p>
          <pre *ngIf="summary?.status === 'ready'">{{summary?.content}}</pre>
        </div>
        <ng-template #noSummary><em>No summary yet</em></ng-template>
        <button (click)="generateSummary()">Generate summary</button>
      </aside>

      <section>
        <h3>Notes</h3>
        <ul>
          <li *ngFor="let n of notes">{{n.created_at}} — <strong>{{n.author}}:</strong> {{n.text}}</li>
        </ul>
        <form (ngSubmit)="addNote()" style="margin-top:1rem;">
          <input [(ngModel)]="author" name="author" placeholder="Your name" required>
          <input [(ngModel)]="text" name="text" placeholder="Note text" required>
          <button type="submit">Add note</button>
        </form>
      </section>
    </section>
  `
})
export class MeetingDetailComponent implements OnInit, OnDestroy {
  meeting: Meeting | null = null;
  notes: Note[] = [];
  summary: Summary | null = null;

  author = '';
  text = '';

  loading = false;
  error: string | null = null;

  pollSub?: Subscription;

  constructor(private route: ActivatedRoute, private api: MeetingsService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.api.getMeeting(id).subscribe({
      next: (m) => { this.meeting = m; this.loading = false; this.fetchNotes(); this.fetchSummary(); },
      error: (e) => { this.error = 'Failed to load meeting'; this.loading = false; console.error(e); }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  fetchNotes(page = 1) {
    if (!this.meeting) return;
    this.api.listNotes(this.meeting.id, page).subscribe({
      next: (res) => { this.notes = res.results || res; },
      error: (e) => { console.error(e); }
    });
  }

  fetchSummary() {
    if (!this.meeting) return;
    this.api.getSummary(this.meeting.id).subscribe({
      next: (s) => { this.summary = s; },
      error: (e) => { /* likely 404 if none yet */ }
    });
  }

  addNote() {
    if (!this.meeting) return;
    this.api.addNote(this.meeting.id, { author: this.author, text: this.text }).subscribe({
      next: (n) => { this.notes = [...this.notes, n]; this.author=''; this.text=''; },
      error: (e) => { console.error(e); }
    });
  }

  generateSummary() {
    if (!this.meeting) return;
    this.api.summarize(this.meeting.id).subscribe({
      next: () => {
        // poll every 2s for updated status
        this.pollSub?.unsubscribe();
        this.pollSub = interval(2000).subscribe(() => {
          this.api.getSummary(this.meeting!.id).subscribe({
            next: (s) => {
              this.summary = s;
              if (s.status !== 'pending') this.pollSub?.unsubscribe();
            },
            error: () => { /* keep polling */ }
          });
        });
      },
      error: (e) => { console.error(e); }
    });
  }
}
