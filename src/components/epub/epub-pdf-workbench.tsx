import { EpubConvertWorkbench } from './epub-convert-workbench';

export function EpubPdfWorkbench() {
  return (
    <EpubConvertWorkbench
      format="pdf"
      apiEndpoint="/api/conversions/epub-to-pdf"
      formatLabel="PDF"
      formatDescription="Reader-friendly printable layout"
    />
  );
}
