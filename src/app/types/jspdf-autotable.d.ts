import 'jspdf';
import { UserOptions } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
    lastAutoTable?: {
      finalY: number;
      [key: string]: unknown;
    };
  }
}