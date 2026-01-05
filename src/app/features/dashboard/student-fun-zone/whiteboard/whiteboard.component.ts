import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Path {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss']
})
export class WhiteboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentPath: Point[] = [];
  

  paths: Path[] = [];
  redoStack: Path[][] = [];
  

  selectedTool: 'pen' | 'eraser' = 'pen';
  selectedColor = '#000000';
  penSize = 3;
  eraserSize = 20;
  

  colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];
  

  penSizes = [1, 3, 5, 8];
  

  eraserSizes = [10, 20, 30, 40];

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.loadDrawing();
    
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    this.saveDrawing();
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth - 40; 
      this.canvas.height = container.clientHeight - 40;
      this.redrawCanvas();
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.currentPath = [{ x, y }];
  }

  onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    

    if (this.selectedTool === 'eraser') {
      this.updateEraserCursor(x, y);
    }
    
    if (!this.isDrawing) return;
    
    this.currentPath.push({ x, y });
    
    if (this.selectedTool === 'eraser') {

      this.erase(x, y);
    } else {
      this.drawPath(
        this.currentPath, 
        this.selectedColor, 
        this.penSize,
        this.selectedTool
      );
    }
  }

  onCanvasMouseEnter(): void {
    if (this.selectedTool === 'eraser') {
      const cursor = document.getElementById('eraser-cursor');
      if (cursor) {
        cursor.style.display = 'block';
      }
    }
  }

  onCanvasMouseLeave(): void {
    const cursor = document.getElementById('eraser-cursor');
    if (cursor) {
      cursor.style.display = 'none';
    }
  }

private updateEraserCursor(x: number, y: number): void {
  const cursor = document.getElementById('eraser-cursor');
  if (cursor) {
    const canvas = this.canvas;
    const canvasRect = canvas.getBoundingClientRect();
    const wrapperRect = canvas.parentElement?.getBoundingClientRect();
    
    if (wrapperRect) {
      const offsetX = canvasRect.left - wrapperRect.left;
      const offsetY = canvasRect.top - wrapperRect.top;
      const halfSize = this.eraserSize / 2;
      cursor.style.left = `${offsetX + x - halfSize}px`;
      cursor.style.top = `${offsetY + y - halfSize}px`;
      cursor.style.width = `${this.eraserSize}px`;
      cursor.style.height = `${this.eraserSize}px`;
    }
  }
}

  onMouseUp(): void {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    
    if (this.currentPath.length > 0) {
      this.paths.push({
        points: [...this.currentPath],
        color: this.selectedColor,
        width: this.selectedTool === 'pen' ? this.penSize : this.eraserSize,
        tool: this.selectedTool
      });
      this.currentPath = [];
      this.redoStack = [];
      this.saveDrawing();
    }
  }


  private erase(x: number, y: number): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.eraserSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawPath(points: Point[], color: string, width: number, tool: 'pen' | 'eraser'): void {
    if (points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    if (tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
      this.ctx.lineWidth = width;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
    }

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private redrawCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.paths.forEach(path => {
      if (path.tool === 'eraser') {
        path.points.forEach(point => {
          this.ctx.save();
          this.ctx.globalCompositeOperation = 'destination-out';
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, path.width / 2, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        });
      } else {
        this.drawPath(path.points, path.color, path.width, path.tool);
      }
    });
  }

  selectTool(tool: 'pen' | 'eraser'): void {
    this.selectedTool = tool;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  selectPenSize(size: number): void {
    this.penSize = size;
  }

  selectEraserSize(size: number): void {
    this.eraserSize = size;

    const cursor = document.getElementById('eraser-cursor');
    if (cursor && this.selectedTool === 'eraser') {
      cursor.style.width = `${size}px`;
      cursor.style.height = `${size}px`;
    }
  }

  clearCanvas(): void {
    const confirmed = confirm('Da li ste sigurni da želite obrisati sve?');
    if (confirmed) {
      this.paths = [];
      this.redoStack = [];
      this.redrawCanvas();
      this.saveDrawing();
    }
  }

  undo(): void {
    if (this.paths.length === 0) return;

    const lastPath = this.paths.pop();
    if (lastPath) {
      this.redoStack.push([...this.paths, lastPath]);
    }

    this.redrawCanvas();
    this.saveDrawing();
  }

  redo(): void {
    if (this.redoStack.length === 0) return;

    const state = this.redoStack.pop();
    if (state) {
      this.paths = [...state];
      this.redrawCanvas();
      this.saveDrawing();
    }
  }

  private saveDrawing(): void {
    localStorage.setItem('whiteboard-data', JSON.stringify(this.paths));
  }

  private loadDrawing(): void {
    const saved = localStorage.getItem('whiteboard-data');
    if (saved) {
      try {
        this.paths = JSON.parse(saved);
        this.redrawCanvas();
      } catch (e) {
        console.error('Error loading whiteboard data:', e);
      }
    }
  }
}