declare namespace cv {
  class Mat {
    constructor();
    delete(): void;
    cols: number;
    rows: number;
  }
  
  function imread(imageSource: HTMLImageElement | HTMLCanvasElement): Mat;
  function imshow(canvasSource: HTMLCanvasElement, mat: Mat): void;
  function cvtColor(src: Mat, dst: Mat, code: number): void;
  
  const COLOR_BGR2GRAY: number;
  const THRESH_BINARY: number;
  function threshold(src: Mat, dst: Mat, thresh: number, maxval: number, type: number): void;
}

declare let cv: any; 