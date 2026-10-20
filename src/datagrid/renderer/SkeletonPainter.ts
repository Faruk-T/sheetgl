import { IGridThemeTokens } from '../theme/IGridTheme';

export class SkeletonPainter {
  public static paintSkeletonCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: IGridThemeTokens
  ): void {
    const padX = 10;
    const barH = 12;
    const barY = y + (height - barH) / 2;
    const barW = Math.max(30, width - padX * 2);

    ctx.save();
    ctx.fillStyle = theme.canvas.skeletonBar;
    ctx.beginPath();
    ctx.roundRect(x + padX, barY, barW, barH, 4);
    ctx.fill();
    ctx.restore();
  }
}
