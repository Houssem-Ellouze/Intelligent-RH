import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { BoardResponse, ColumnResponse, KanbanService, TaskResponse } from '../../services/kanban.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view-component.html',
  standalone: true,
  imports: [
    FormsModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
    NgForOf,
    NgIf,
  ],
  styleUrls: ['./main-view-component.scss']
})
export class MainViewComponent implements OnInit, OnDestroy {

  board: BoardResponse = { id: 0, name: '', createdAt: '', updatedAt: '', columns: [] };
  isLoading = true;
  errorMessage = '';
  debugInfo = '';

  private readonly BOARD_ID = 1;
  private readonly LOAD_TIMEOUT_MS = 10_000;

  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private subscriptions = new Subscription();

  colors      = ['#FFB3B3', '#FFE0B3', '#D4FFB3', '#B3E5FF'];
  titleColors = ['#000000', '#000000', '#000000', '#000000'];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    // ✅ Lire le cache directement via la méthode propre du service
    const cached = this.kanbanService.getCache(this.BOARD_ID);
    if (cached?.id) {
      this.board     = { ...cached, columns: cached.columns ?? [] };
      this.isLoading = false;
      return;
    }
    this.loadBoard();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.clearLoadTimeout();
  }

  // ── Timeout de sécurité ──────────────────────────────────
  private startLoadTimeout(): void {
    this.clearLoadTimeout();
    this.loadTimeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading    = false;
        this.errorMessage = '❌ Le serveur ne répond pas. Vérifiez que Spring Boot tourne sur http://localhost:8222';
      }
    }, this.LOAD_TIMEOUT_MS);
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeoutId !== null) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  // ── Chargement ───────────────────────────────────────────
  loadBoard(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.debugInfo    = '';
    this.startLoadTimeout();

    const sub = this.kanbanService.getBoard(this.BOARD_ID).subscribe({
      next: (data) => {
        this.clearLoadTimeout();
        this.board     = { ...data, columns: data.columns ?? [] };
        this.isLoading = false;
        this.saveBoardToCache();
      },
      error: (err) => {
        if (err.status === 404 || err.status === 0) {
          this.debugInfo = 'Board introuvable, création en cours...';
          this.createDefaultBoard();
        } else {
          this.clearLoadTimeout();
          this.isLoading    = false;
          this.errorMessage = `❌ Erreur ${err.status} : ${err.message}`;
        }
      }
    });

    this.subscriptions.add(sub);
  }

  private createDefaultBoard(): void {
    const sub = this.kanbanService.createBoard('Mon Kanban').subscribe({
      next: (created) => {
        this.clearLoadTimeout();
        this.board     = { ...created, columns: created.columns ?? [] };
        this.isLoading = false;
        this.debugInfo = '';
        this.saveBoardToCache();
      },
      error: (createErr) => {
        this.clearLoadTimeout();
        this.isLoading    = false;
        this.debugInfo    = '';
        this.errorMessage = createErr.status === 0
          ? '❌ Impossible de contacter le serveur. Vérifiez que Spring Boot tourne sur http://localhost:8222'
          : `❌ Erreur ${createErr.status} : ${createErr.message}`;
      }
    });

    this.subscriptions.add(sub);
  }

  // ✅ Utilise la méthode publique du service (plus de cast `as any`)
  private saveBoardToCache(): void {
    this.kanbanService.setCache(this.BOARD_ID, this.board);
  }

  // ── Drag & Drop ──────────────────────────────────────────
  getConnectedLists(currentIndex: number): string[] {
    return this.board.columns
      .map((_, i) => `column-${i}`)
      .filter((_, i) => i !== currentIndex);
  }

  drop(event: CdkDragDrop<TaskResponse[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      const movedTask = event.container.data[event.currentIndex];
      const sub = this.kanbanService
        .updateTask(movedTask.id, movedTask.text, event.currentIndex)
        .subscribe({
          next: () => this.saveBoardToCache(),
          error: (err) => console.error('Erreur update position', err)
        });
      this.subscriptions.add(sub);

    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedTask      = event.container.data[event.currentIndex];
      const targetColumnId = this.getColumnIdFromList(event.container.id);

      if (targetColumnId === -1) {
        console.error('Colonne cible introuvable pour:', event.container.id);
        return;
      }

      const sub = this.kanbanService
        .moveTask(movedTask.id, targetColumnId, event.currentIndex)
        .subscribe({
          next: () => this.saveBoardToCache(),
          error: (err) => console.error('Erreur déplacement tâche', err)
        });
      this.subscriptions.add(sub);
    }
  }

  private getColumnIdFromList(listId: string): number {
    const index = this.board.columns.findIndex((_, i) => `column-${i}` === listId);
    return index >= 0 ? this.board.columns[index].id : -1;
  }

  // ── Tâches ───────────────────────────────────────────────
  addTask(columnIndex: number): void {
    if (!this.board.columns[columnIndex]) return;
    const column   = this.board.columns[columnIndex];
    const position = column.tasks?.length ?? 0;

    const sub = this.kanbanService.createTask(column.id, '', position).subscribe({
      next: (newTask) => {
        if (!column.tasks) column.tasks = [];
        column.tasks.push(newTask);
        this.saveBoardToCache();
      },
      error: (err) => console.error('Erreur création tâche', err)
    });
    this.subscriptions.add(sub);
  }

  removeTask(columnIndex: number, taskIndex: number): void {
    if (!this.board.columns[columnIndex]) return;
    const column = this.board.columns[columnIndex];
    if (!column.tasks?.[taskIndex]) return;

    const task = column.tasks[taskIndex];
    const sub  = this.kanbanService.deleteTask(task.id).subscribe({
      next: () => {
        column.tasks.splice(taskIndex, 1);
        this.saveBoardToCache();
      },
      error: (err) => console.error('Erreur suppression tâche', err)
    });
    this.subscriptions.add(sub);
  }

  updateTaskText(task: TaskResponse, columnIndex: number): void {
    if (!this.board.columns[columnIndex]) return;
    const column   = this.board.columns[columnIndex];
    const position = column.tasks.findIndex(t => t.id === task.id);
    if (position === -1) return;

    const sub = this.kanbanService.updateTask(task.id, task.text, position).subscribe({
      next: () => this.saveBoardToCache(),
      error: (err) => console.error('Erreur mise à jour tâche', err)
    });
    this.subscriptions.add(sub);
  }

  // ── Export PDF — Scan complet de la page en vue desktop ──────────────────
  exportBoardAsPDF(): void {
    const target = document.querySelector('.kanban-universe') as HTMLElement;
    if (!target) { console.error('Élément .kanban-universe introuvable'); return; }

    const scrollX          = window.scrollX;
    const scrollY          = window.scrollY;
    const prevBodyWidth    = document.body.style.width;
    const prevBodyOverflow = document.body.style.overflow;

    const DESKTOP_WIDTH = 1440;
    document.body.style.width    = `${DESKTOP_WIDTH}px`;
    document.body.style.overflow = 'visible';
    window.scrollTo(0, 0);

    html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#0A0600',
      width: target.scrollWidth,
      height: target.scrollHeight,
      windowWidth: DESKTOP_WIDTH,
      windowHeight: target.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      imageTimeout: 15_000,
      onclone: (_doc: Document, clonedEl: HTMLElement) => {
        clonedEl.style.overflow  = 'visible';
        clonedEl.style.height    = 'auto';
        clonedEl.style.maxHeight = 'none';
        clonedEl.querySelectorAll<HTMLElement>('*').forEach(el => {
          const cs = window.getComputedStyle(el);
          if (['auto', 'scroll', 'hidden'].includes(cs.overflow))  el.style.overflow  = 'visible';
          if (['auto', 'scroll', 'hidden'].includes(cs.overflowY)) el.style.overflowY = 'visible';
          if (['auto', 'scroll', 'hidden'].includes(cs.overflowX)) el.style.overflowX = 'visible';
        });
      }
    }).then(canvas => {
      document.body.style.width    = prevBodyWidth;
      document.body.style.overflow = prevBodyOverflow;
      window.scrollTo(scrollX, scrollY);

      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW   = pdf.internal.pageSize.getWidth();
      const pageH   = pdf.internal.pageSize.getHeight();
      const imgW    = pageW;
      const imgH    = (canvas.height * pageW) / canvas.width;

      let remaining = imgH;
      let yOffset   = 0;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, -yOffset, imgW, imgH);
        remaining -= pageH;
        yOffset   += pageH;
        if (remaining > 0) pdf.addPage();
      }

      pdf.setProperties({
        title: `Kanban — ${this.board.name || 'Board'}`,
        subject: 'Export Kanban Board',
        author: 'Kanban App',
        creator: 'html2canvas + jsPDF'
      });
      pdf.save(`Kanban_Board_${new Date().toISOString().slice(0, 10)}.pdf`);

    }).catch(err => {
      document.body.style.width    = prevBodyWidth;
      document.body.style.overflow = prevBodyOverflow;
      window.scrollTo(scrollX, scrollY);
      console.error('Erreur export PDF:', err);
    });
  }

  // ── Export Excel ─────────────────────────────────────────
  exportBoardAsExcel(): void {
    const data = this.convertBoardToExcelFormat();
    if (!data.length) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kanban Board');
    XLSX.writeFile(wb, 'Kanban_Board.xlsx');
  }

  convertBoardToExcelFormat(): any[] {
    const tasks: any[] = [];
    (this.board.columns ?? []).forEach(col => {
      (col.tasks ?? []).forEach(task => tasks.push({ Colonne: col.name, Tâche: task.text }));
    });
    return tasks;
  }

  getColumnColor(index: number): string { return this.colors[index % this.colors.length]; }
  getTitleColor(index: number): string  { return this.titleColors[index % this.titleColors.length]; }
  trackByColumnId(_: number, col: ColumnResponse): number { return col.id; }
  trackByTaskId(_: number, task: TaskResponse): number    { return task.id; }
}
