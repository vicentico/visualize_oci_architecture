import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { CanvasStateService } from '../../canvas/services/canvas-state.service';
import { LearningService } from '../../../core/services/learning.service';
import { LearningContent } from '../../../core/models/learning.models';

@Component({
  selector: 'app-learning-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatRadioModule, FormsModule],
  template: `
    <aside class="learning-panel">
      <div class="panel-header">
        <mat-icon>school</mat-icon>
        <h2>Learning Mode</h2>
      </div>

      <div class="panel-content">
        @if (!selectedNodeId()) {
          <div class="empty-state">
            <mat-icon class="empty-icon">touch_app</mat-icon>
            <p>Select a component on the canvas to learn about it.</p>
          </div>
        } @else if (isLoading()) {
          <div class="loading-state">
            <mat-icon class="spin-icon">sync</mat-icon>
            <p>Loading educational content...</p>
          </div>
        } @else if (learningContent(); as content) {
          <div class="content-scroll">
            <h3 class="resource-title">{{ content.title }}</h3>
            
            <div class="section">
              <h4>Description</h4>
              <p>{{ content.description }}</p>
            </div>

            <div class="section">
              <h4>Typical Use Cases</h4>
              <ul>
                @for (uc of content.useCases; track uc) {
                  <li>{{ uc }}</li>
                }
              </ul>
            </div>

            <div class="quiz-section">
              <h4>Knowledge Check</h4>
              <p class="question">{{ content.quiz.questionText }}</p>
              
              <mat-radio-group class="quiz-options" [(ngModel)]="selectedAnswerIndex" [disabled]="hasAnswered()">
                @for (opt of content.quiz.options; track opt; let i = $index) {
                  <mat-radio-button [value]="i" class="quiz-option">
                    {{ opt }}
                  </mat-radio-button>
                }
              </mat-radio-group>

              @if (!hasAnswered()) {
                <button mat-flat-button color="primary" class="check-btn" 
                        [disabled]="selectedAnswerIndex() === null" 
                        (click)="checkAnswer()">
                  Check Answer
                </button>
              }

              @if (hasAnswered()) {
                <div class="feedback-box" [class.correct]="isCorrect()" [class.incorrect]="!isCorrect()">
                  <div class="feedback-header">
                    <mat-icon>{{ isCorrect() ? 'check_circle' : 'cancel' }}</mat-icon>
                    <strong>{{ isCorrect() ? 'Correct!' : 'Not quite.' }}</strong>
                  </div>
                  <p class="explanation">{{ content.quiz.explanation }}</p>
                  
                  @if (!isCorrect()) {
                    <button mat-button color="primary" (click)="resetQuiz()">Try Again</button>
                  }
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <mat-icon class="empty-icon">article</mat-icon>
            <p>No learning content available for this component type yet.</p>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .learning-panel {
      width: 320px;
      height: 100%;
      background: white;
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 15px rgba(0, 0, 0, 0.02);
      z-index: 10;
    }

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      
      mat-icon {
        color: #0ea5e9;
      }
      
      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .empty-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #64748b;
      height: 100%;

      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      .spin-icon {
        animation: spin 1s linear infinite;
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 16px;
        color: #0ea5e9;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .content-scroll {
      padding: 20px;
    }

    .resource-title {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }

    .section {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #475569;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        font-size: 14px;
        line-height: 1.5;
        color: #475569;
        
        li {
          margin-bottom: 4px;
        }
      }
    }

    .quiz-section {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 16px;
      margin-top: 32px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 700;
        color: #0369a1;
      }

      .question {
        font-size: 14px;
        font-weight: 500;
        color: #0f172a;
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      .quiz-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .quiz-option {
        font-size: 13px;
        white-space: normal;
        
        ::ng-deep .mdc-form-field {
          align-items: flex-start;
        }
        ::ng-deep .mdc-label {
          padding-top: 10px;
          line-height: 1.4;
        }
      }

      .check-btn {
        width: 100%;
      }
    }

    .feedback-box {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.5;

      &.correct {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        
        .feedback-header mat-icon { color: #10b981; }
      }

      &.incorrect {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        
        .feedback-header mat-icon { color: #ef4444; }
      }

      .feedback-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .explanation {
        margin: 0;
      }
    }
  `]
})
export class LearningPanelComponent {
  readonly selectedNodeId = computed(() => this.canvasState.selectedNodeId());
  
  readonly learningContent = signal<LearningContent | null>(null);
  readonly isLoading = signal<boolean>(false);

  // Quiz state
  readonly selectedAnswerIndex = signal<number | null>(null);
  readonly hasAnswered = signal<boolean>(false);
  readonly isCorrect = signal<boolean>(false);

  constructor(
    private canvasState: CanvasStateService,
    private learningService: LearningService
  ) {
    // React to selection changes
    effect(() => {
      const nodeId = this.selectedNodeId();
      if (nodeId) {
        const node = this.canvasState.nodes().find(n => n.id === nodeId);
        if (node) {
          this.fetchLearningContent(node.type);
        } else {
          this.resetState();
        }
      } else {
        this.resetState();
      }
    }, { allowSignalWrites: true });
  }

  private resetState() {
    this.learningContent.set(null);
    this.resetQuiz();
  }

  private fetchLearningContent(resourceType: string) {
    this.isLoading.set(true);
    this.resetQuiz();
    this.learningContent.set(null);

    this.learningService.getLearningContent(resourceType).subscribe({
      next: (content) => {
        this.learningContent.set(content);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  checkAnswer() {
    const content = this.learningContent();
    const answer = this.selectedAnswerIndex();
    
    if (content && answer !== null) {
      this.hasAnswered.set(true);
      this.isCorrect.set(answer === content.quiz.correctOptionIndex);
    }
  }

  resetQuiz() {
    this.selectedAnswerIndex.set(null);
    this.hasAnswered.set(false);
    this.isCorrect.set(false);
  }
}
